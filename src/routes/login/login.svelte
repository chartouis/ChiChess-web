<script lang="ts">
	import { login, type LoginPayload } from '$lib/api';
	import { resolve } from '$app/paths';
	import { writable } from 'svelte/store';
	const username = writable('');
	const password = writable('');
	async function handleSubmit(e: Event) {
		e.preventDefault();
		try {
			const payload: LoginPayload = {
				username: $username,
				password: $password
			};
			const response = await login(payload);
			console.log(response);
		} catch (err) {
			console.log(err);
		}
	}
</script>


<div class="min-h-screen flex items-center justify-center">
	<div class="border border-black w-full max-w-md space-y-6 card p-8">
		<h2 class="text-center h2 text-tertiary-500">Log In</h2>

		<form class="space-y-4" onsubmit={handleSubmit}>
			<label class="label">
				<input class="input" type="text" placeholder="Username" />
			</label>
			<label class="label">
				<input class="input" type="password" placeholder="Password" />
			</label>

			<button type="submit" class="btn w-full preset-filled-tertiary-500">Log In</button>
		</form>

		<p class="text-center text-sm">
			No account? <a href={resolve('/sign-up')} class="anchor">Sign up</a>
		</p>
	</div>
</div>