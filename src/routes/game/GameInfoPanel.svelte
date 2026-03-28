<script lang="ts">
  import { roomState } from '$lib/stores/game';
</script>

<div class="game-info">
  <div class="game-info__row">
    <span class="game-info__label">Type</span>
    <span class="game-info__value">{$roomState?.gameType ?? '—'}</span>
  </div>
  <div class="game-info__row">
    <span class="game-info__label">Room</span>
    <span class="game-info__value game-info__mono">{$roomState?.id ?? '—'}</span>
  </div>
  <div class="game-info__row">
    <span class="game-info__label">Status</span>
    <span class="game-info__value">{$roomState?.status ?? '—'}</span>
  </div>
</div>

<style>
  .game-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-radius: 2px;
    border: 1px solid color-mix(in srgb, currentColor 12%, transparent);
    border-left: 3px solid color-mix(in srgb, rgb(var(--color-tertiary-500)) 45%, transparent);
  }

  .game-info__row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 1rem;
    font-size: 0.8rem;
  }

  .game-info__label {
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    opacity: 0.45;
    flex-shrink: 0;
  }

  .game-info__value {
    text-align: right;
    word-break: break-all;
  }

  .game-info__mono {
    font-family: ui-monospace, 'Cascadia Code', 'Cascadia Mono', 'SFMono-Regular', Menlo, monospace;
    font-size: 0.75rem;
  }
</style>
