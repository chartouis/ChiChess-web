<script lang="ts">
  import { username } from '$lib/stores';
  import { isGameActive, roomState } from '$lib/stores/game';
  import BoardComponent from './BoardComponent.svelte';
  import ButtonPanel from './ButtonPanel.svelte';
  import ChessTimer from './ChessTimer.svelte';
  import GameInfoPanel from './GameInfoPanel.svelte';
  import GameWrapper from './GameWrapper.svelte';
  import MatchmakingPanel from './MatchmakingPanel.svelte';
  import MoveHistoryPanel from './MoveHistoryPanel.svelte';
  import PlayerInfoPanel from '$lib/components/game/PlayerInfoPanel.svelte';
</script>

<GameWrapper>
  {#if $isGameActive && $roomState}
    {@const rs = $roomState}
    {@const u = $username}
    {@const opponentUsername = rs.white === u ? (rs.black ?? '') : (rs.white ?? '')}
    <div class="game-layout">
      <aside class="game-layout__aside">
        <GameInfoPanel />
        <MoveHistoryPanel />
        <ButtonPanel />
      </aside>
      <div class="game-layout__main">
        <PlayerInfoPanel username={opponentUsername} />
        <ChessTimer />
        <div class="game-layout__board">
          <BoardComponent />
        </div>
        <PlayerInfoPanel username={u} />
      </div>
    </div>
  {:else}
    <div class="matchmaking-wrap">
      <MatchmakingPanel />
    </div>
  {/if}
</GameWrapper>

<style>
  .matchmaking-wrap {
    min-height: min(70vh, 40rem);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1.5rem;
  }

  .game-layout {
    display: grid;
    grid-template-columns: minmax(220px, 280px) minmax(0, 1fr);
    gap: 1.75rem;
    align-items: start;
    max-width: 1100px;
    margin: 0 auto;
    padding: 1.5rem;
  }

  @media (max-width: 800px) {
    .game-layout {
      grid-template-columns: 1fr;
    }

    .game-layout__aside {
      order: 2;
    }

    .game-layout__main {
      order: 1;
    }
  }

  .game-layout__aside {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-width: 0;
  }

  .game-layout__main {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    min-width: 0;
  }

  .game-layout__board {
    width: min(100%, 560px);
    margin-inline: auto;
  }
</style>
