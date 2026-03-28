<!-- src/lib/components/game/BoardComponent.svelte -->
<script lang="ts">
  import { getContext } from 'svelte';
  import { Chess, SQUARES } from 'chess.js';
  import { Chessground } from 'svelte5-chessground';
  import 'svelte5-chessground/style.css';
  import type { Api } from 'chessground/api';
  import type { Key } from 'chessground/types';
  import { username } from '$lib/stores';
  import { roomState } from '$lib/stores/game';
  import type { GameContext } from '$lib/types/chess';

  const { sendMove, getBoardSide } = getContext<GameContext & { getBoardSide: () => 'white' | 'black' }>('game');

  // Bindable reference to the chessground API instance.
  // We use this to call api.set() imperatively when dests change,
  // because passing dests through the config prop is not reactive.
  let cgApi = $state<Api | undefined>(undefined);

  function onMove(from: string, to: string) {
    const destRank = to[1];
    const srcRank = from[1];
    const isPromotion =
      (destRank === '8' && srcRank === '7') ||
      (destRank === '1' && srcRank === '2');
    sendMove(from, to, isPromotion ? 'q' : '');
  }

  // Keep FEN in sync with roomState
  const fenFromState = $derived.by(() => {
    const p = $roomState?.position;
    if (!p || p.trim() === '' || p === 'start') return 'start';
    return p.trim();
  });

  // Recompute and push legal move destinations to chessground
  // every time the position, game status, or username changes.
  $effect(() => {
    if (!cgApi) return;

    const rs = $roomState;
    const u = $username;
    const fen = fenFromState;

    // No active game — disable all movement
    if (!rs || rs.status !== 'ONGOING') {
      cgApi.set({
        movable: { free: false, color: undefined, dests: new Map(), showDests: false },
      });
      return;
    }

    // Parse the position
    let chess: Chess;
    try {
      chess = fen === 'start' ? new Chess() : new Chess(fen);
    } catch {
      cgApi.set({
        movable: { free: false, color: undefined, dests: new Map(), showDests: false },
      });
      return;
    }

    const turnColor: 'white' | 'black' = chess.turn() === 'w' ? 'white' : 'black';
    const mySide: 'white' | 'black' = rs.black === u ? 'black' : 'white';

    // Not our turn — show board but no movable pieces
    if (mySide !== turnColor) {
      cgApi.set({
        turnColor,
        movable: { free: false, color: undefined, dests: new Map(), showDests: false },
      });
      return;
    }

    // Compute legal destinations for every square
    const dests = new Map<Key, Key[]>();
    for (const square of SQUARES) {
      const moves = chess.moves({ square, verbose: true });
      if (moves.length > 0) {
        dests.set(square as Key, moves.map((m) => m.to as Key));
      }
    }

    cgApi.set({
      turnColor,
      movable: {
        free: false,
        color: mySide,
        dests,
        showDests: true,
      },
    });
  });
</script>

<div class="board-wrap">
  <Chessground
    fen={fenFromState}
    orientation={getBoardSide()}
    {onMove}
    config={{
      drawable: {
        enabled: true,
        visible: true,
        eraseOnMove: true,
      },
    }}
    bind:api={cgApi}
  />
</div>

<style>
  .board-wrap {
    width: 100%;
    aspect-ratio: 1 / 1;
  }

  .board-wrap :global(cg-wrap) {
    width: 100%;
    height: 100%;
  }

  /* Empty destination square — small centered dot */
  .board-wrap :global(cg-board square.move-dest::after) {
    content: '';
    display: block;
    width: 40%;
    height: 40%;
    margin: 30% auto;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.25);
    pointer-events: none;
  }

  /* Occupied destination square (capture) — chessground uses class "oc", not "occupied" */
  .board-wrap :global(cg-board square.move-dest.oc::after) {
    width: 100%;
    height: 100%;
    margin: 0;
    border-radius: 0;
    background: transparent;
    border: 4px solid rgba(0, 0, 0, 0.25);
    box-sizing: border-box;
  }
</style>