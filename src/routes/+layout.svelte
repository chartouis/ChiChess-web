
<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { checkTokenAndRedirect, refresh } from '$lib/api';
	import { REFRESH_INTERVAL } from '$lib/config';

	const REFRESH_INTERVAL_MS=REFRESH_INTERVAL;

	let refreshTimer: ReturnType<typeof setInterval> | undefined;

	async function refreshToken() {
		try {
			if (await refresh()) {
				if (refreshTimer) clearInterval(refreshTimer);
				goto('/login');
			}
		} catch {
			if (refreshTimer) clearInterval(refreshTimer);
			goto('/login');
		}
	}

	onMount(() => {
		checkTokenAndRedirect(); 
		refreshTimer = setInterval(refreshToken, REFRESH_INTERVAL_MS);
	});

	onDestroy(() => {
		if (refreshTimer) clearInterval(refreshTimer);
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<slot />