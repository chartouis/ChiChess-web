<script lang="ts">
  import { logout } from '$lib/api';
  import { username } from '$lib/stores';

  let menuOpen = $state(false);

  function closeMenu() {
    menuOpen = false;
  }

  function toggleMenu(e: MouseEvent) {
    e.stopPropagation();
    menuOpen = !menuOpen;
  }

  async function handleLogout() {
    closeMenu();
    await logout();
  }
</script>

<svelte:window
  onclick={() => {
    if (menuOpen) closeMenu();
  }}
/>

<nav class="site-nav">
  <div class="site-nav__inner">
    <div class="site-nav__left">
      <a href="/" class="site-nav__brand" onclick={closeMenu}>ChiChess</a>
      <a href="/" class="site-nav__link" onclick={closeMenu}>Home</a>
      <a href="/game" class="site-nav__link" onclick={closeMenu}>Play</a>
    </div>
    <div class="site-nav__right">
      {#if $username}
        <div class="nav-user">
          <button type="button" class="nav-user__trigger" onclick={toggleMenu}>
            {$username}
          </button>
          {#if menuOpen}
            <div class="nav-user__dropdown">
              <button type="button" class="nav-user__logout" onclick={handleLogout}>Logout</button>
            </div>
          {/if}
        </div>
      {:else}
        <a href="/login" class="site-nav__link">Login</a>
      {/if}
    </div>
  </div>
</nav>

<style>
  .site-nav {
    border-bottom: 1px solid color-mix(in srgb, currentColor 12%, transparent);
    background: color-mix(in srgb, currentColor 2%, transparent);
  }

  .site-nav__inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0.65rem 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .site-nav__left {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    flex-wrap: wrap;
  }

  .site-nav__brand {
    font-weight: 700;
    font-size: 1rem;
    letter-spacing: 0.04em;
    text-decoration: none;
    color: inherit;
  }

  .site-nav__link {
    font-size: 0.875rem;
    font-weight: 500;
    text-decoration: none;
    color: inherit;
    opacity: 0.85;
  }

  .site-nav__link:hover {
    opacity: 1;
  }

  .site-nav__right {
    position: relative;
    display: flex;
    align-items: center;
  }

  .nav-user {
    position: relative;
  }

  .nav-user__trigger {
    font: inherit;
    font-size: 0.875rem;
    font-weight: 500;
    padding: 0.35rem 0.6rem;
    border-radius: 2px;
    border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
    background: transparent;
    color: inherit;
    cursor: pointer;
  }

  .nav-user__trigger:hover {
    background: color-mix(in srgb, currentColor 5%, transparent);
  }

  .nav-user__dropdown {
    position: absolute;
    right: 0;
    top: calc(100% + 4px);
    min-width: 9rem;
    padding: 0.35rem;
    border-radius: 2px;
    border: 1px solid color-mix(in srgb, currentColor 14%, transparent);
    background: color-mix(in srgb, currentColor 6%, transparent);
    color: inherit;
    z-index: 50;
  }

  .nav-user__logout {
    width: 100%;
    text-align: left;
    font: inherit;
    font-size: 0.85rem;
    padding: 0.45rem 0.65rem;
    border-radius: 2px;
    border: none;
    background: transparent;
    color: inherit;
    cursor: pointer;
  }

  .nav-user__logout:hover {
    background: color-mix(in srgb, currentColor 6%, transparent);
  }
</style>
