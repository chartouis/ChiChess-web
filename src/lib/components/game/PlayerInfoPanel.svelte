<script lang="ts">
  import { fetchRating } from '$lib/api';

  let { username: playerName }: { username: string } = $props();

  let rating = $state<number | null>(null);
  let loadError = $state(false);

  $effect(() => {
    const name = playerName.trim();
    if (!name) {
      rating = null;
      loadError = true;
      return;
    }

    let cancelled = false;
    loadError = false;
    rating = null;

    fetchRating(name)
      .then((r) => {
        if (!cancelled) rating = r;
      })
      .catch(() => {
        if (!cancelled) loadError = true;
      });

    return () => {
      cancelled = true;
    };
  });
</script>

<div class="player-info">
  <span class="player-info__name">{playerName || '—'}</span>
  <span class="player-info__rating">
    {#if loadError}
      <span class="muted">—</span>
    {:else if rating === null}
      <span class="muted">…</span>
    {:else}
      {rating}
    {/if}
  </span>
</div>

<style>
  .player-info {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 0.5rem 0.75rem;
    padding: 0.5rem 0.75rem;
    border-radius: 2px;
    border: 1px solid color-mix(in srgb, currentColor 12%, transparent);
    border-left: 3px solid color-mix(in srgb, rgb(var(--color-tertiary-500)) 45%, transparent);
  }

  .player-info__name {
    font-weight: 600;
    font-size: 0.9rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
  }

  .player-info__rating {
    font-family: ui-monospace, 'Cascadia Code', 'Cascadia Mono', 'SFMono-Regular', Menlo, monospace;
    font-variant-numeric: tabular-nums;
    font-size: 0.8rem;
    font-weight: 500;
    opacity: 0.55;
    flex-shrink: 0;
  }

  .muted {
    opacity: 0.35;
  }
</style>
