<!-- src/lib/components/game/ButtonPanel.svelte -->
<!--
  Renders game action buttons from a descriptor list.
  Each button calls its action via GameWrapper context.
  Adding new buttons = adding one entry to the actions array.
  Disabled state is evaluated per button (e.g. can't resign if game is over).
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import { isGameActive, roomState } from '$lib/stores/game';
  import type { GameContext } from '$lib/types/chess';

  const { sendResign, sendDraw } = getContext<GameContext>('game');

  // Whether a draw has already been offered (to show pending state).
  $: drawOfferedBy = $roomState?.drawOfferedBy ?? null;

  // Action descriptor. Add entries here as the backend grows.
  // `condition` is a function returning true when the button should be shown.
  // `disabled` is a function returning true when it should be grayed out.
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
      label: () => drawOfferedBy ? 'Draw offered' : 'Offer draw',
      action: sendDraw,
      condition: () => $isGameActive,
      disabled: () => drawOfferedBy !== null,
      variant: 'default',
    },
  ];

  // Resolve label — allow label to be a string or a function
  function resolveLabel(action: Action): string {
    return typeof action.label === 'function' ? (action.label as () => string)() : action.label;
  }

  function isVisible(action: Action): boolean {
    return action.condition ? action.condition() : true;
  }

  function isDisabled(action: Action): boolean {
    return action.disabled ? action.disabled() : false;
  }
</script>

<div class="panel">
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

  .action-btn {
    /* Base: unstyled button that uses Skeleton's surface tokens */
    width: 100%;
    padding: 0.6rem 1rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    text-align: left;
    cursor: pointer;
    transition: opacity 0.15s ease;

    /* Light neutral by default — blends with any Skeleton preset */
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

  /* Resign and other destructive actions get a subtle red tint */
  .action-btn--danger {
    color: rgb(239 68 68); /* red-500 */
    border-color: color-mix(in srgb, rgb(239 68 68) 30%, transparent);
    /* Gradient only on important/destructive actions */
    background: linear-gradient(
      135deg,
      color-mix(in srgb, rgb(239 68 68) 8%, transparent),
      transparent
    );
  }

  .action-btn--danger:hover:not(:disabled) {
    background: color-mix(in srgb, rgb(239 68 68) 14%, transparent);
  }

  /* Subtle: secondary utility buttons, visually quieter */
  .action-btn--subtle {
    font-size: 0.8rem;
    opacity: 0.6;
    border-color: transparent;
  }

  .action-btn--subtle:hover:not(:disabled) {
    opacity: 1;
  }
</style>
