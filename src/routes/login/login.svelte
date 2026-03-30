<script lang="ts">
	import { loginWithFeedback, refresh, validate, type LoginPayload } from '$lib/api';
	import { resolve } from '$app/paths';
	import { username } from '$lib/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let password = $state('');
	let formError = $state('');

	function clearError() {
		formError = '';
	}

	// onMount(()=>{
	// 	validate().then((res)=>{
	// 		if(res){
	// 			goto("/s")
	// 		}
	// 	})
	// })

	async function handleSubmit(e: Event) {
		e.preventDefault();
		formError = '';
		const payload: LoginPayload = {
			username: $username,
			password: password
		};
		const result = await loginWithFeedback(payload);
		if (!result.ok) {
			formError = result.message;
			return;
		}
		localStorage.setItem('username', payload.username);
		await refresh();
	}
</script>

<div class="min-h-screen flex items-center justify-center">
	<div class="border preset-outlined-tertiary-950-50 w-full max-w-md space-y-6 card p-8">
		<h2 class="text-center h2 text-tertiary-500">Log In</h2>

		<form class="space-y-4" onsubmit={handleSubmit} oninput={clearError}>
			<label class="label">
				<input class="input" type="text" placeholder="Username" bind:value={$username} />
			</label>
			<label class="label">
				<input class="input" type="password" placeholder="Password" bind:value={password} />
			</label>

			<button type="submit" class="btn w-full preset-filled-tertiary-500">Log In</button>
			{#if formError}
				<p class="form-error">{formError}</p>
			{/if}
		</form>

		<p class="text-center text-sm">
			No account? <a href={resolve('/sign-up')} class="anchor">Sign up</a>
		</p>
	</div>
</div>

<style>
	.form-error {
		margin: 0;
		font-size: 0.8rem;
		color: rgb(239 68 68);
	}
</style>
