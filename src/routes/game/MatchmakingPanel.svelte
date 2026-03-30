<!-- src/lib/components/game/MatchmakingPanel.svelte -->
<!--
  Shown when there is no active game.
  Lets the user configure and join matchmaking.
  While searching, shows how long the queue has been running.
  Cancelling closes the WebSocket (backend cancels the queue when connection drops).
-->
<script lang="ts">
  import { onDestroy, onMount, getContext } from 'svelte';
  import { fetchActiveQueueCounts } from '$lib/api';
  import type { ActiveQueueCounts } from '$lib/api';
  import { isGameActive, isInQueue, queueElapsed } from '$lib/stores/game';
  import type { GameContext, JoinQueueRequest } from '$lib/types/chess';

  const { joinQueue, cancelQueue } = getContext<GameContext>('game');

  // --- Form state ---
  let rated     = $state(true);
  let gameType  = $state('blitz');
  let minRating = $state(800);
  let maxRating = $state(2800);

  const gameTypes = ['bullet', 'blitz', 'rapid', 'classical'];

  let activeCounts = $state<ActiveQueueCounts | null>(null);
  let activePoll: ReturnType<typeof setInterval> | null = null;

  function selectionKey(rated: boolean, gt: string): string {
    return `${rated ? 'rated' : 'casual'}_${gt.toLowerCase()}`;
  }

  function sumActiveQueue(c: ActiveQueueCounts): number {
    return Object.values(c).reduce((a, v) => a + (typeof v === 'number' ? v : 0), 0);
  }

  onMount(() => {
    async function tick() {
      try {
        activeCounts = await fetchActiveQueueCounts();
      } catch {
        /* ignore */
      }
    }
    tick();
    activePoll = setInterval(tick, 10_000);
  });

  onDestroy(() => {
    if (activePoll) clearInterval(activePoll);
  });

  // Format elapsed ms into m:ss
  function formatElapsed(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  function handleSearch() {
    const request: JoinQueueRequest = {
      rated,
      gameType,
      minRating,
      maxRating,
      preferences: [],
    };
    joinQueue(request);
  }

  function handleCancel() {
    cancelQueue();
  }
</script>

<!--
  This entire panel is only shown when there is no active game.
  isGameActive being true means a game was found and GameWrapper
  will render the game layout instead.
-->
{#if !$isGameActive}
  <div class="matchmaking-panel">

    {#if $isInQueue}
      <!-- Searching state -->
      <div class="searching">
        <div class="searching-label">Searching for a game</div>
        <div class="elapsed">{formatElapsed($queueElapsed)}</div>
        <div class="search-meta">
          {gameType} · {rated ? 'Rated' : 'Casual'} · {minRating}–{maxRating}
        </div>
        <button class="btn-cancel" onclick={handleCancel}>
          Cancel
        </button>
      </div>

    {:else}
      <!-- Configuration state -->
      <div class="config">
        <h2 class="panel-title">Find a game</h2>

        <!-- Game type selector -->
        <div class="field">
          <label class="field-label">Time control</label>
          <div class="type-grid">
            {#each gameTypes as type}
              <button
                class="type-btn"
                class:type-btn--active={gameType === type}
                onclick={() => gameType = type}
              >
                {type}
              </button>
            {/each}
          </div>
        </div>

        <!-- Rated toggle -->
        <div class="field field--row">
          <label class="field-label" for="rated-toggle">Rated</label>
          <input
            id="rated-toggle"
            type="checkbox"
            class="toggle"
            bind:checked={rated}
          />
        </div>

        <!-- Rating range -->
        <div class="field">
          <label class="field-label">Rating range</label>
          <div class="rating-row">
            <input
              type="number"
              class="rating-input"
              bind:value={minRating}
              min={0}
              max={3000}
              placeholder="Min"
            />
            <span class="rating-sep">–</span>
            <input
              type="number"
              class="rating-input"
              bind:value={maxRating}
              min={0}
              max={3000}
              placeholder="Max"
            />
          </div>
        </div>

        {#if activeCounts}
          <p class="active-line">
            {sumActiveQueue(activeCounts)} players searching · {activeCounts[selectionKey(rated, gameType)] ?? 0} in
            {rated ? 'rated' : 'casual'}
            {gameType}
          </p>
        {/if}

        <button class="btn-search" onclick={handleSearch}>
          Play
        </button>
      </div>
    {/if}

  </div>
{/if}

<style>
  .matchmaking-panel {
    padding: 1.5rem;
    border-radius: 0.5rem;
    border: 1px solid color-mix(in srgb, currentColor 12%, transparent);
  }

  /* --- Config form --- */

  .panel-title {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 1.25rem;
  }

  .field {
    margin-bottom: 1rem;
  }

  .field--row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .field-label {
    display: block;
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    opacity: 0.5;
    margin-bottom: 0.5rem;
  }

  .field--row .field-label {
    margin-bottom: 0;
  }

  /* Game type buttons */
  .type-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.375rem;
  }

  .type-btn {
    padding: 0.4rem 0;
    font-size: 0.8rem;
    font-weight: 500;
    border-radius: 0.25rem;
    border: 1px solid color-mix(in srgb, currentColor 15%, transparent);
    background: transparent;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .type-btn:hover {
    background: color-mix(in srgb, currentColor 6%, transparent);
  }

  /* Active type button: use tertiary preset color */
  .type-btn--active {
    background: linear-gradient(
      135deg,
      rgb(var(--color-tertiary-500) / 0.9),
      rgb(var(--color-tertiary-600) / 0.9)
    );
    color: rgb(var(--on-tertiary));
    border-color: transparent;
  }

  /* Rated toggle — simple native checkbox, styled minimally */
  .toggle {
    width: 1.125rem;
    height: 1.125rem;
    cursor: pointer;
    accent-color: rgb(var(--color-tertiary-500));
  }

  /* Rating inputs */
  .rating-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .rating-input {
    width: 5rem;
    padding: 0.4rem 0.6rem;
    font-size: 0.875rem;
    border-radius: 0.25rem;
    border: 1px solid color-mix(in srgb, currentColor 20%, transparent);
    background: transparent;
    color: inherit;
    text-align: center;
  }

  .rating-input:focus {
    outline: 2px solid rgb(var(--color-tertiary-500) / 0.5);
    outline-offset: 1px;
  }

  /* Hide number input arrows */
  .rating-input::-webkit-outer-spin-button,
  .rating-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  .rating-sep {
    opacity: 0.4;
    font-size: 1rem;
  }

  .active-line {
    margin: 0.5rem 0 0;
    font-size: 0.75rem;
    line-height: 1.45;
    opacity: 0.5;
  }

  /* Search / Play button — the one important gradient button */
  .btn-search {
    width: 100%;
    padding: 0.7rem 1rem;
    margin-top: 0.5rem;
    font-size: 0.9rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    border-radius: 0.375rem;
    border: none;
    cursor: pointer;
    transition: filter 0.15s ease;
    background: linear-gradient(
      135deg,
      rgb(var(--color-tertiary-400)),
      rgb(var(--color-tertiary-600))
    );
    color: rgb(var(--on-tertiary));
  }

  .btn-search:hover {
    filter: brightness(1.08);
  }

  /* --- Searching state --- */

  .searching {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0;
    text-align: center;
  }

  .searching-label {
    font-size: 0.8rem;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    opacity: 0.5;
  }

  .elapsed {
    font-size: 2rem;
    font-weight: 300;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.05em;
  }

  .search-meta {
    font-size: 0.8rem;
    opacity: 0.45;
    margin-bottom: 0.5rem;
  }

  .btn-cancel {
    padding: 0.5rem 1.5rem;
    font-size: 0.8rem;
    font-weight: 500;
    border-radius: 0.375rem;
    border: 1px solid color-mix(in srgb, currentColor 20%, transparent);
    background: transparent;
    cursor: pointer;
    transition: opacity 0.15s ease;
  }

  .btn-cancel:hover {
    background: color-mix(in srgb, currentColor 6%, transparent);
  }
</style>
