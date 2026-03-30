<!-- src/lib/components/game/GameWrapper.svelte -->
<script lang="ts">
  import { onMount, onDestroy, setContext } from 'svelte';
  import { WSNURL, NURL } from '$lib/config';
  import { username } from '$lib/stores';
  import {
    roomState,
    gameId,
    connected,
    whiteTime,
    blackTime,
    currentTurn,
    isInQueue,
    queueElapsed,
  } from '$lib/stores/game';
  import type { JoinQueueRequest, RoomState, GameContext } from '$lib/types/chess';

  // -------------------------------------------------------------------------
  // Internal refs
  // -------------------------------------------------------------------------
  let socket           : WebSocket | null = null;
  let timerInterval    : ReturnType<typeof setInterval> | null = null;
  let queueInterval    : ReturnType<typeof setInterval> | null = null;
  let reconnectTimeout : ReturnType<typeof setTimeout>  | null = null;

  let intentionalClose    = false;
  let reconnectDelay      = 1000;
  let pendingQueueRequest : JoinQueueRequest | null = null;

  /** Avoid scheduling multiple post-game reconnects from repeated WS messages */
  let gameEndReconnectScheduled = false;
  let gameEndReconnectTimeout: ReturnType<typeof setTimeout> | null = null;

  // Prevents spamming the REST check when the clock sits at zero
  let timerExpiredChecked = false;

  // -------------------------------------------------------------------------
  // Timer expiry check
  // -------------------------------------------------------------------------
  async function checkGameEndedAfterTimeout() {
    // Only run once per timer expiry
    if (timerExpiredChecked) return;
    timerExpiredChecked = true;

    const id = $gameId;
    if (!id) return;

    try {
      const res = await fetch(`${NURL}/api/${id}`, { credentials: 'include' });
      if (!res.ok) return;
      const data: RoomState = await res.json();
      if (data.status !== 'ONGOING' && data.status !== 'WAITING') {
        window.location.reload();
      }
    } catch {
      // Network error — do nothing, let the user see the frozen clock
    }
  }

  // -------------------------------------------------------------------------
  // Timer
  // -------------------------------------------------------------------------
  function getTurnFromFEN(fen: string): 'WHITE' | 'BLACK' {
    const parts = fen.split(' ');
    return parts[1] === 'w' ? 'WHITE' : 'BLACK';
  }

  function startTimer(state: RoomState) {
    if (timerInterval) clearInterval(timerInterval);

    if (state.remainingWhite === undefined && state.remainingBlack === undefined) return;

    const turn     = state.position ? getTurnFromFEN(state.position) : 'WHITE';
    const now      = Date.now();
    const lastMove = state.lastMoveEpoch ? state.lastMoveEpoch : null;

    currentTurn.set(turn);

    // Reset expiry flag whenever a new state arrives (new move resets the clock)
    timerExpiredChecked = false;

    if (state.status === 'ONGOING') {
      if (turn === 'WHITE') {
        whiteTime.set(
          lastMove
            ? Math.max(0, (state.remainingWhite ?? 0) - (now - lastMove))
            : (state.remainingWhite ?? 0)
        );
        blackTime.set(state.remainingBlack ?? 0);
      } else {
        whiteTime.set(state.remainingWhite ?? 0);
        blackTime.set(
          lastMove
            ? Math.max(0, (state.remainingBlack ?? 0) - (now - lastMove))
            : (state.remainingBlack ?? 0)
        );
      }

      timerInterval = setInterval(() => {
        const elapsed = lastMove ? Date.now() - lastMove : 0;

        if (turn === 'WHITE') {
          const newTime = lastMove
            ? Math.max(0, (state.remainingWhite ?? 0) - elapsed)
            : (state.remainingWhite ?? 0);
          whiteTime.set(newTime);
          if (lastMove && newTime <= 0) checkGameEndedAfterTimeout();
        } else {
          const newTime = lastMove
            ? Math.max(0, (state.remainingBlack ?? 0) - elapsed)
            : (state.remainingBlack ?? 0);
          blackTime.set(newTime);
          if (lastMove && newTime <= 0) checkGameEndedAfterTimeout();
        }
      }, 100);
    } else {
      whiteTime.set(state.remainingWhite ?? 0);
      blackTime.set(state.remainingBlack ?? 0);
    }
  }

  // -------------------------------------------------------------------------
  // Queue timer
  // -------------------------------------------------------------------------
  function startQueueTimer() {
    if (queueInterval) clearInterval(queueInterval);
    const start = Date.now();
    queueElapsed.set(0);
    queueInterval = setInterval(() => {
      queueElapsed.set(Date.now() - start);
    }, 1000);
  }

  function stopQueueTimer() {
    if (queueInterval) clearInterval(queueInterval);
    queueElapsed.set(0);
  }

  // -------------------------------------------------------------------------
  // WebSocket
  // -------------------------------------------------------------------------
  function connect() {
    if (socket?.readyState === WebSocket.OPEN || socket?.readyState === WebSocket.CONNECTING) return;
    intentionalClose = false;

    socket = new WebSocket(`${WSNURL}/api/ws/game`);

    socket.onopen = () => {
      connected.set(true);
      reconnectDelay = 1000;

      socket?.send(JSON.stringify({ type: 'RECONNECT', payload: {} }));

      if (pendingQueueRequest) {
        const req = pendingQueueRequest;
        pendingQueueRequest = null;
        _dispatchQueue(req);
      }
    };

    socket.onmessage = (event: MessageEvent) => {
      let data: Record<string, unknown>;
      try {
        data = JSON.parse(event.data as string);
      } catch {
        console.error('[GameWrapper] Failed to parse WS message', event.data);
        return;
      }

      const receivedId = (data.gameId ?? data.roomId ?? data.id) as string | undefined;
      if (receivedId) gameId.set(receivedId);

      let state: RoomState | null = null;
      if (data.state && typeof data.state === 'object') {
        state = data.state as RoomState;
      } else if (
        typeof data.status === 'string' &&
        (data.position !== undefined || data.white !== undefined || data.black !== undefined)
      ) {
        state = data as unknown as RoomState;
      }

      if (state) {
        roomState.set(state);
        startTimer(state);
        if (state.status === 'ONGOING') {
          isInQueue.set(false);
          stopQueueTimer();
        }

        const st = state.status;
        if (st != null && st !== 'ONGOING' && st !== 'WAITING') {
          scheduleReconnectAfterGameEnd();
        }
      }
    };

    socket.onclose = () => {
      connected.set(false);
      socket = null;
      if (!intentionalClose) scheduleReconnect();
    };

    socket.onerror = () => {
      connected.set(false);
    };
  }

  function scheduleReconnect() {
    if (reconnectTimeout) clearTimeout(reconnectTimeout);
    reconnectTimeout = setTimeout(() => {
      reconnectDelay = Math.min(reconnectDelay * 2, 30_000);
      connect();
    }, reconnectDelay);
  }

  function disconnect() {
    intentionalClose = true;
    if (reconnectTimeout) clearTimeout(reconnectTimeout);
    socket?.close();
    connected.set(false);
  }

  /** After a finished game, tear down the socket and reconnect so the next queue join uses a clean WS. */
  function scheduleReconnectAfterGameEnd() {
    if (gameEndReconnectScheduled) return;
    gameEndReconnectScheduled = true;
    if (gameEndReconnectTimeout) clearTimeout(gameEndReconnectTimeout);
    gameEndReconnectTimeout = setTimeout(() => {
      gameEndReconnectTimeout = null;
      gameEndReconnectScheduled = false;
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      intentionalClose = true;
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
      socket?.close();
      socket = null;
      connected.set(false);
      roomState.set(null);
      gameId.set('');
      reconnectDelay = 1000;
      intentionalClose = false;
      connect();
    }, 500);
  }

  // -------------------------------------------------------------------------
  // Message senders
  // -------------------------------------------------------------------------
  function sendMessage(type: string, payload: unknown = {}): boolean {
    if (socket?.readyState !== WebSocket.OPEN) return false;
    socket.send(JSON.stringify({ type, payload }));
    return true;
  }

  function sendMove(from: string, to: string, promotion = ''): boolean {
    return sendMessage('MOVE', { from, to, promotion });
  }

  function sendResign():  boolean { return sendMessage('RESIGN'); }
  function sendDraw():    boolean { return sendMessage('DRAW'); }
  function sendUpdate():  boolean { return sendMessage('UPDATE'); }
  function sendSpectate(targetUsername: string): boolean {
    return sendMessage('SPECTATE', { username: targetUsername });
  }

  // -------------------------------------------------------------------------
  // Queue actions
  // -------------------------------------------------------------------------
  function _dispatchQueue(request: JoinQueueRequest) {
    sendMessage('QUEUE', request);
    isInQueue.set(true);
    startQueueTimer();
  }

  function joinQueue(request: JoinQueueRequest): void {
    if (socket?.readyState === WebSocket.OPEN) {
      _dispatchQueue(request);
    } else {
      pendingQueueRequest = request;
      connect();
    }
  }

  function cancelQueue(): void {
    stopQueueTimer();
    isInQueue.set(false);
    pendingQueueRequest = null;
    disconnect();
  }

  // -------------------------------------------------------------------------
  // Helpers for children
  // -------------------------------------------------------------------------
  export function getBoardSide(): 'white' | 'black' {
    const rs = $roomState;
    if (!rs) return 'white';
    return rs.black === $username ? 'black' : 'white';
  }

  // -------------------------------------------------------------------------
  // Context
  // -------------------------------------------------------------------------
  setContext<GameContext>('game', {
    sendMove,
    sendResign,
    sendDraw,
    sendUpdate,
    joinQueue,
    cancelQueue,
    sendSpectate,
    getBoardSide,
  });

  // -------------------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------------------
  onMount(() => {
    connect();
  });

  onDestroy(() => {
    intentionalClose = true;
    if (reconnectTimeout) clearTimeout(reconnectTimeout);
    if (gameEndReconnectTimeout) clearTimeout(gameEndReconnectTimeout);
    if (timerInterval)    clearInterval(timerInterval);
    if (queueInterval)    clearInterval(queueInterval);
    socket?.close();
  });

  let { children } = $props();
</script>

{@render children()}