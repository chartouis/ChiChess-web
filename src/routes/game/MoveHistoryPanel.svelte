<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { parsedMoves } from '$lib/stores/game';
  import type { ParsedMove } from '$lib/types/chess';

  let scrollEl: HTMLDivElement | undefined = $state();

  function toPairs(moves: ParsedMove[]): { num: number; white: string; black: string }[] {
    const pairs: { num: number; white: string; black: string }[] = [];
    for (let i = 0; i < moves.length; i += 2) {
      const w = moves[i];
      const b = moves[i + 1];
      pairs.push({
        num: w.moveNumber,
        white: w.san,
        black: b?.san ?? '',
      });
    }
    return pairs;
  }

  onMount(() => {
    return parsedMoves.subscribe(async () => {
      await tick();
      scrollEl?.scrollTo(0, scrollEl.scrollHeight);
    });
  });
</script>

<div class="move-history-panel">
  <div class="move-history-panel__title">Moves</div>
  <div class="move-history-panel__scroll" bind:this={scrollEl}>
    {#if $parsedMoves.length === 0}
      <div class="move-history-panel__empty">No moves yet</div>
    {:else}
      {#each toPairs($parsedMoves) as row (row.num)}
        <div class="move-row">
          <span class="move-num">{row.num}.</span>
          <span class="move-san">{row.white}</span>
          {#if row.black}
            <span class="move-san">{row.black}</span>
          {/if}
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .move-history-panel {
    display: flex;
    flex-direction: column;
    min-height: 0;
    border-radius: 2px;
    border: 1px solid color-mix(in srgb, currentColor 12%, transparent);
    border-left: 3px solid color-mix(in srgb, rgb(var(--color-tertiary-500)) 55%, transparent);
    overflow: hidden;
  }

  .move-history-panel__title {
    flex-shrink: 0;
    padding: 0.5rem 0.75rem;
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    opacity: 0.45;
    border-bottom: 1px solid color-mix(in srgb, currentColor 10%, transparent);
  }

  .move-history-panel__scroll {
    flex: 1;
    min-height: 8rem;
    max-height: 18rem;
    overflow-y: auto;
    padding: 0.65rem 0.75rem;
    font-size: 0.85rem;
    line-height: 1.65;
  }

  .move-history-panel__empty {
    font-size: 0.8rem;
    opacity: 0.4;
    font-style: italic;
  }

  .move-row {
    display: grid;
    grid-template-columns: 2rem 1fr 1fr;
    gap: 0.5rem;
    align-items: baseline;
  }

  .move-num {
    font-variant-numeric: tabular-nums;
    opacity: 0.55;
    font-size: 0.8rem;
  }

  .move-san {
    font-family: ui-monospace, 'Cascadia Code', 'Cascadia Mono', 'SFMono-Regular', Menlo, monospace;
    font-variant-numeric: tabular-nums;
  }
</style>
