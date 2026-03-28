<script lang="ts">
  import { whiteTime, blackTime, currentTurn } from '$lib/stores/game';

  function formatMs(ms: number): string {
    const s = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  function isLow(ms: number): boolean {
    return ms < 10_000 && ms > 0;
  }
</script>

<div class="chess-timer">
  <div
    class="clock"
    class:clock--active={$currentTurn === 'WHITE'}
    class:clock--low={isLow($whiteTime)}
  >
    <span class="clock-label">White</span>
    <span class="clock-digits">{formatMs($whiteTime)}</span>
  </div>
  <div
    class="clock"
    class:clock--active={$currentTurn === 'BLACK'}
    class:clock--low={isLow($blackTime)}
  >
    <span class="clock-label">Black</span>
    <span class="clock-digits">{formatMs($blackTime)}</span>
  </div>
</div>

<style>
  .chess-timer {
    display: flex;
    gap: 1rem;
    align-items: stretch;
    justify-content: center;
    flex-wrap: wrap;
  }

  .clock {
    flex: 1 1 8rem;
    min-width: 7rem;
    max-width: 14rem;
    padding: 0.65rem 1rem;
    border-radius: 2px;
    border: 1px solid color-mix(in srgb, currentColor 14%, transparent);
    border-left: 3px solid transparent;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    transition:
      box-shadow 0.15s ease,
      border-color 0.15s ease;

    opacity: 0.72;
  }

  .clock--active {
    opacity: 1;
    border-left-color: rgb(var(--color-tertiary-500));
    box-shadow:
      0 0 0 1px color-mix(in srgb, rgb(var(--color-tertiary-500)) 35%, transparent),
      0 0 18px color-mix(in srgb, rgb(var(--color-tertiary-500)) 12%, transparent);
  }

  .clock-label {
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    opacity: 0.45;
  }

  .clock--active .clock-label {
    opacity: 0.65;
  }

  .clock-digits {
    font-family: ui-monospace, 'Cascadia Code', 'Cascadia Mono', 'SFMono-Regular', Menlo, monospace;
    font-variant-numeric: tabular-nums;
    font-size: 1.5rem;
    font-weight: 500;
    letter-spacing: 0.04em;
    line-height: 1.2;
  }

  .clock--low .clock-digits {
    color: rgb(239 68 68);
  }
</style>
