<!-- src/lib/components/game/ButtonPanel.svelte -->
<script lang="ts">
  import { getContext } from 'svelte';
  import { username } from '$lib/stores';
  import { isGameActive, roomState } from '$lib/stores/game';
  import type { GameContext } from '$lib/types/chess';

  const { sendResign, sendDraw } = getContext<GameContext>('game');

  const drawOfferedBy = $derived($roomState?.drawOfferedBy ?? '');

  let declinedDraw = $state(false);
  let prevDrawOfferedBy = $state<string | undefined>(undefined);

  /** Fresh opponent offer: reset decline when drawOfferedBy changes to a new non-empty value */
  $effect(() => {
    const cur = $roomState?.drawOfferedBy ?? '';
    if (prevDrawOfferedBy === undefined) {
      prevDrawOfferedBy = cur;
      return;
    }
    if (cur !== prevDrawOfferedBy) {
      if (cur !== '') {
        declinedDraw = false;
      }
      prevDrawOfferedBy = cur;
    }
  });

  type Action = {
    label: string | (() => string);
    action: () => void;
    condition?: () => boolean;
    disabled?: () => boolean;
    variant?: 'default' | 'danger' | 'subtle';
  };

  const actions: Action[] = [
    {
      label: 'Resign',
      action: sendResign,
      condition: () => $isGameActive,
      variant: 'danger',
    },
    {
      label: () =>
        drawOfferedBy !== '' && drawOfferedBy === $username ? 'Draw offered' : 'Offer draw',
      action: sendDraw,
      condition: () =>
        $isGameActive && (drawOfferedBy === '' || drawOfferedBy === $username),
      disabled: () => drawOfferedBy !== '' && drawOfferedBy === $username,
      variant: 'default',
    },
  ];

  function resolveLabel(action: Action): string {
    return typeof action.label === 'function' ? (action.label as () => string)() : action.label;
  }

  function isVisible(action: Action): boolean {
    return action.condition ? action.condition() : true;
  }

  function isDisabled(action: Action): boolean {
    return action.disabled ? action.disabled() : false;
  }

  const showOpponentDrawPopup = $derived(
    $isGameActive &&
      drawOfferedBy !== '' &&
      drawOfferedBy !== $username &&
      !declinedDraw
  );
</script>

<div class="panel">
  {#if showOpponentDrawPopup}
    <div class="draw-offer">
      <p class="draw-offer__label">{drawOfferedBy} offers a draw</p>
      <div class="draw-offer__row">
        <button type="button" class="draw-offer__btn" onclick={() => sendDraw()}>Accept</button>
        <button type="button" class="draw-offer__btn draw-offer__btn--muted" onclick={() => (declinedDraw = true)}>
          Decline
        </button>
      </div>
    </div>
  {/if}

  {#each actions as action}
    {#if isVisible(action)}
      <button
        class="action-btn"
        class:action-btn--danger={action.variant === 'danger'}
        class:action-btn--subtle={action.variant === 'subtle'}
        disabled={isDisabled(action)}
        onclick={action.action}
      >
        {resolveLabel(action)}
      </button>
    {/if}
  {/each}
</div>

<style>
  .panel {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .draw-offer {
    padding: 0.65rem 0.75rem;
    margin-bottom: 0.15rem;
    border-radius: 2px;
    border: 1px solid color-mix(in srgb, currentColor 14%, transparent);
    border-left: 3px solid color-mix(in srgb, rgb(var(--color-tertiary-500)) 55%, transparent);
    background: color-mix(in srgb, currentColor 4%, transparent);
  }

  .draw-offer__label {
    margin: 0 0 0.5rem;
    font-size: 0.8rem;
    font-weight: 500;
    line-height: 1.35;
  }

  .draw-offer__row {
    display: flex;
    gap: 0.5rem;
  }

  .draw-offer__btn {
    flex: 1;
    padding: 0.45rem 0.65rem;
    font-size: 0.8rem;
    font-weight: 500;
    border-radius: 2px;
    border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
    background: transparent;
    color: inherit;
    cursor: pointer;
  }

  .draw-offer__btn:hover {
    background: color-mix(in srgb, currentColor 6%, transparent);
  }

  .draw-offer__btn--muted {
    opacity: 0.85;
  }

  .action-btn {
    width: 100%;
    padding: 0.6rem 1rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    text-align: left;
    cursor: pointer;
    transition: opacity 0.15s ease;

    background: transparent;
    border: 1px solid color-mix(in srgb, currentColor 20%, transparent);
    color: inherit;
  }

  .action-btn:hover:not(:disabled) {
    background: color-mix(in srgb, currentColor 6%, transparent);
  }

  .action-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .action-btn--danger {
    color: rgb(239 68 68);
    border-color: color-mix(in srgb, rgb(239 68 68) 30%, transparent);
    background: linear-gradient(
      135deg,
      color-mix(in srgb, rgb(239 68 68) 8%, transparent),
      transparent
    );
  }

  .action-btn--danger:hover:not(:disabled) {
    background: color-mix(in srgb, rgb(239 68 68) 14%, transparent);
  }

  .action-btn--subtle {
    font-size: 0.8rem;
    opacity: 0.6;
    border-color: transparent;
  }

  .action-btn--subtle:hover:not(:disabled) {
    opacity: 1;
  }
</style>
