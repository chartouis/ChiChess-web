<script lang="ts">
  import { checkTokenAndRedirect, fetchGameHistory, fetchRating } from '$lib/api';
  import HistoryMiniBoard from '$lib/components/game/HistoryMiniBoard.svelte';
  import { username } from '$lib/stores';
  import type { RoomState } from '$lib/types/chess';
  import { outcomeForUser } from '$lib/utils/gameOutcome';
	import { onMount } from 'svelte';

  const PAGE_SIZE = 10;

  let rating = $state<number | null>(null);
  let ratingErr = $state(false);
  let historyPage = $state(0);
  let historyItems = $state<RoomState[]>([]);
  let hasNext = $state(false);
  let hasPrevious = $state(false);
  let historyLoading = $state(false);
  let historyErr = $state(false);

  $effect(() => {
    const u = $username.trim();
    if (!u) {
      rating = null;
      ratingErr = false;
      return;
    }
    let cancelled = false;
    ratingErr = false;
    rating = null;
    fetchRating(u)
      .then((r) => {
        if (!cancelled) rating = r;
      })
      .catch(() => {
        if (!cancelled) ratingErr = true;
      });
    return () => {
      cancelled = true;
    };
  });

  $effect(() => {
    checkTokenAndRedirect();
    const u = $username.trim();
    const page = historyPage;
    if (!u) {
      historyItems = [];
      hasNext = false;
      hasPrevious = false;
      historyLoading = false;
      return;
    }
    let cancelled = false;
    historyLoading = true;
    historyErr = false;
    fetchGameHistory(u, page, PAGE_SIZE)
      .then((res) => {
        if (cancelled) return;
        historyItems = res.items;
        hasNext = res.hasNext;
        hasPrevious = res.hasPrevious;
      })
      .catch(() => {
        if (!cancelled) historyErr = true;
      })
      .finally(() => {
        if (!cancelled) historyLoading = false;
      });
    return () => {
      cancelled = true;
    };
  });

  function formatDate(iso: string | undefined): string {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function gameTypeLabel(gt: string | undefined): string {
    return (gt ?? '—').toUpperCase();
  }

  function boardOrientation(room: RoomState, current: string): 'white' | 'black' {
    return room.white === current ? 'white' : 'black';
  }
</script>

<div class="home">
  <section class="home__hero">
    <p class="home__eyebrow">Welcome back</p>
    <h1 class="home__title">
      {#if $username.trim()}
        {$username.trim()}
      {:else}
        Player
      {/if}
    </h1>
    <div class="home__rating-block">
      <span class="home__eyebrow home__eyebrow--inline">Your rating</span>
      <p class="home__rating-value">
        {#if !$username.trim()}
          <span class="muted">—</span>
        {:else if ratingErr}
          <span class="muted">—</span>
        {:else if rating === null}
          <span class="muted">…</span>
        {:else}
          {rating}
        {/if}
      </p>
    </div>
    <a
      href="/game"
      style=""
      class="btn-base btn border h-15 w-full "
      >Play</a>
  </section>

  <section class="home__history" aria-labelledby="history-heading">
    <h2 id="history-heading" class="home__section-title">Recent games</h2>

    {#if !$username.trim()}
      <p class="home__empty">Sign in to see your game history.</p>
    {:else if historyLoading && historyItems.length === 0}
      <p class="home__muted">Loading…</p>
    {:else if historyErr}
      <p class="home__empty">Could not load history.</p>
    {:else if historyItems.length === 0}
      <p class="home__empty">No games yet. Start playing to build your history.</p>
    {:else}
      <ul class="history-list">
        {#each historyItems as game (game.id ?? `${game.createdAt}-${game.white}-${game.black}`)}
          {@const o = outcomeForUser($username, game)}
          <li class="history-row">
            <HistoryMiniBoard
              fen={game.position ?? ''}
              orientation={boardOrientation(game, $username)}
            />
            <div class="history-row__body">
              <div class="history-row__top">
                <span class="history-badge">{gameTypeLabel(game.gameType)}</span>
                <span class="history-date">{formatDate(game.createdAt)}</span>
              </div>
              <p class="history-players">
                White: {game.white ?? '—'} vs Black: {game.black ?? '—'}
              </p>
              <p
                class="history-outcome"
                class:history-outcome--win={o.kind === 'win'}
                class:history-outcome--loss={o.kind === 'loss'}
                class:history-outcome--draw={o.kind === 'draw'}
              >
                {o.label}
              </p>
            </div>
          </li>
        {/each}
      </ul>

      <div class="history-pager">
        <button
          type="button"
          class="history-pager__btn"
          disabled={!hasPrevious || historyLoading}
          onclick={() => {
            historyPage = Math.max(0, historyPage - 1);
          }}
        >
          Previous
        </button>
        <button
          type="button"
          class="history-pager__btn"
          disabled={!hasNext || historyLoading}
          onclick={() => {
            historyPage = historyPage + 1;
          }}
        >
          Next
        </button>
      </div>
    {/if}
  </section>
</div>

<style>
  .home {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem 1.5rem 3rem;
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
  }

  .home__hero {
    padding: 1.5rem 0 0;
    border-left: 3px solid color-mix(in srgb, rgb(var(--color-tertiary-500)) 55%, transparent);
    padding-left: 1.25rem;
  }

  .home__eyebrow {
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    opacity: 0.45;
    margin: 0 0 0.5rem;
  }

  .home__eyebrow--inline {
    margin-bottom: 0.35rem;
  }

  .home__title {
    font-size: 1.75rem;
    font-weight: 700;
    margin: 0 0 1.25rem;
    letter-spacing: 0.02em;
  }

  .home__rating-block {
    margin-bottom: 1.5rem;
  }

  .home__rating-value {
    font-family: ui-monospace, 'Cascadia Code', 'Cascadia Mono', 'SFMono-Regular', Menlo, monospace;
    font-variant-numeric: tabular-nums;
    font-size: 1.35rem;
    font-weight: 600;
    margin: 0;
  }

  .muted {
    opacity: 0.45;
  }

  .home__section-title {
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    opacity: 0.45;
    margin: 0 0 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid color-mix(in srgb, currentColor 10%, transparent);
    border-left: 3px solid color-mix(in srgb, rgb(var(--color-tertiary-500)) 45%, transparent);
    padding-left: 0.75rem;
  }

  .home__empty,
  .home__muted {
    margin: 0;
    font-size: 0.9rem;
    opacity: 0.55;
  }

  .history-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .history-row {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
    padding: 1rem 0;
    border-bottom: 1px solid color-mix(in srgb, currentColor 8%, transparent);
  }

  .history-row:last-child {
    border-bottom: none;
  }

  .history-row__body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .history-row__top {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem 1rem;
    justify-content: space-between;
  }

  .history-badge {
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    padding: 0.2rem 0.45rem;
    border-radius: 2px;
    border: 1px solid color-mix(in srgb, rgb(var(--color-tertiary-500)) 35%, transparent);
    background: color-mix(in srgb, rgb(var(--color-tertiary-500)) 8%, transparent);
  }

  .history-date {
    font-size: 0.8rem;
    opacity: 0.5;
  }

  .history-players {
    margin: 0;
    font-size: 0.875rem;
    line-height: 1.45;
  }

  .history-outcome {
    margin: 0;
    font-size: 0.85rem;
    font-weight: 600;
  }

  .history-outcome--win {
    color: rgb(34 197 94);
  }

  .history-outcome--loss {
    color: rgb(239 68 68);
  }

  .history-outcome--draw {
    color: color-mix(in srgb, currentColor 55%, transparent);
  }

  .history-pager {
    display: flex;
    gap: 0.75rem;
    margin-top: 1.25rem;
  }

  .history-pager__btn {
    font: inherit;
    font-size: 0.85rem;
    padding: 0.45rem 1rem;
    border-radius: 2px;
    border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
    background: transparent;
    color: inherit;
    cursor: pointer;
  }

  .history-pager__btn:hover:not(:disabled) {
    background: color-mix(in srgb, currentColor 5%, transparent);
  }

  .history-pager__btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
</style>
