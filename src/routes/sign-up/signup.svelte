<script lang="ts">
	import { registerWithFeedback, loginWithFeedback, refresh, type LoginPayload, type SignupPayload } from '$lib/api';
	import { username } from '$lib/stores';
	import { resolve } from '$app/paths';

	let password = $state('');
	let email = $state('');
	let formError = $state('');

	function clearError() {
		formError = '';
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		formError = '';
		const payload: SignupPayload = {
			email: email,
			username: $username,
			password: password
		};
		const reg = await registerWithFeedback(payload);
		if (!reg.ok) {
			formError = reg.message;
			return;
		}
		if (reg.user.id === 0) {
			formError = 'Registration failed, please try again';
			return;
		}
		const lPayload: LoginPayload = {
			username: $username,
			password: password
		};
		const loginResult = await loginWithFeedback(lPayload);
		if (!loginResult.ok) {
			formError = loginResult.message;
			return;
		}
		localStorage.setItem('username', payload.username);
		await refresh();
	}
</script>

<div class="min-h-screen flex items-center justify-center">
	<div class="border preset-outlined-tertiary-950-50 w-full max-w-md space-y-6 card p-8">
		<h2 class="text-center h2 text-filled-tertiary-500">Sign Up</h2>

		<form class="space-y-4" onsubmit={handleSubmit} oninput={clearError}>
			<label class="label">
				<input class="input" type="email" placeholder="Email" bind:value={email} />
			</label>

			<label class="label">
				<input class="input" type="text" placeholder="Username" bind:value={$username} />
			</label>
			<label class="label">
				<input class="input" type="password" placeholder="Password" bind:value={password} />
			</label>

			<button type="submit" class="btn w-full preset-filled-tertiary-500">Sign Up</button>
			{#if formError}
				<p class="form-error">{formError}</p>
			{/if}
		</form>

		<p class="text-center text-sm">
			Already have an account? <a href={resolve('/login')} class="anchor">Login</a>
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
