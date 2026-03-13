<script lang="ts">
    import { signup, type SignupPayload} from "$lib/api";
	import { writable } from "svelte/store";
    import { resolve } from "$app/paths";
    const email = writable('');
    const username = writable('');
    const password = writable('');
    async function handleSubmit(e:Event){
        e.preventDefault();
        try {
            const payload: SignupPayload = {
                email: $email,
                username: $username,
                password: $password
            };
            const response = await signup(payload);
            console.log(response);
        } catch (err) {
            console.log(err);
        }
    } 
</script>

<div class="min-h-screen flex items-center justify-center">
	<div class="border border-black w-full max-w-md space-y-6 card p-8">
		<h2 class="text-center h2 text-filled-tertiary-500">Sign Up</h2>

		<form class="space-y-4" onsubmit={handleSubmit}>
	
			<label class="label">
				<input class="input" type="email" placeholder="Email" />
			</label>

		<label class="label">
				<input class="input" type="text" placeholder="Username" />
			</label>
			<label class="label">
				<input class="input" type="password" placeholder="Password" />
			</label>

			<button type="submit" class="btn w-full preset-filled-tertiary-500">Sign Up</button>
		</form>

		<p class="text-center text-sm">
			No account? <a href={resolve('/login')} class="anchor">Login</a>
		</p>
	</div>
</div>
