<script lang="ts">
    import { login, type LoginPayload} from "$lib/api";
	import { writable } from "svelte/store";
    const username = writable('');
    const password = writable('');
    async function handleSubmit(e:Event){
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

<div>
    <form action="" on:submit|preventDefault={handleSubmit}>
        <div>
            <label for="">Username</label>
            <input type="text" bind:value={$username}>
        </div>
        <div>
            <label for="">Password</label>
            <input type="password" bind:value={$password}>
        </div>
        <div>
            <input type="submit" value="Log In">
        </div>
    </form>
</div>