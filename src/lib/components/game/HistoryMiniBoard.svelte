<script lang="ts">
  import { Chessground } from 'svelte5-chessground';
  import 'svelte5-chessground/style.css';

  let {
    fen,
    orientation = 'white' as 'white' | 'black',
  }: {
    fen: string;
    orientation?: 'white' | 'black';
  } = $props();

  const displayFen = $derived(fen?.trim() ? fen : 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
</script>

<div class="history-mini-board">
  <Chessground fen={displayFen} {orientation} viewOnly={true} />
</div>

<style>
  .history-mini-board {
    width: 120px;
    height: 120px;
    flex-shrink: 0;
    border-radius: 2px;
    overflow: hidden;
    border: 1px solid color-mix(in srgb, currentColor 12%, transparent);
  }

  .history-mini-board :global(.cg-wrap) {
    width: 120px;
    height: 120px;
  }
</style>
