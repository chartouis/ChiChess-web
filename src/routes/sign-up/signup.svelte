<script lang="ts">
    import { signup, refresh ,login, type LoginPayload, type SignupPayload} from "$lib/api";
    import { username } from "$lib/stores";
    import { resolve } from "$app/paths";

    let password = $state('');
    let email = $state('');
    async function handleSubmit(e:Event){
        e.preventDefault();
        try {
            const payload: SignupPayload = {
                email: email,
                username: $username,
                password: password
            };
            const response = await signup(payload);
            console.log(response);
            if(response.id != 0){
            const lPayload: LoginPayload = {
                username: $username,
                password: password
            }
                if(await login(lPayload)){
				    localStorage.setItem('username', payload.username);
                    console.log (await refresh());
                }
            }
            
        } catch (err) {
            console.log(err);
        }
    } 
</script>

<div class="min-h-screen flex items-center justify-center">
	<div class="border preset-outlined-tertiary-950-50 w-full max-w-md space-y-6 card p-8">
		<h2 class="text-center h2 text-filled-tertiary-500">Sign Up</h2>

		<form class="space-y-4" onsubmit={handleSubmit}>
	
			<label class="label">
				<input class="input" type="email" placeholder="Email" bind:value={email} />
			</label>

		<label class="label">
				<input class="input" type="username" placeholder="Username" bind:value={$username} />
			</label>
			<label class="label">
				<input class="input" type="password" placeholder="Password" bind:value={password}/>
			</label>

			<button type="submit" class="btn w-full preset-filled-tertiary-500">Sign Up</button>
		</form>

		<p class="text-center text-sm">
			No account? <a href={resolve('/login')} class="anchor">Login</a>
		</p>
	</div>
</div>
