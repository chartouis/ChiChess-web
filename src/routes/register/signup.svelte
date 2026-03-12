<script lang="ts">
    import { signup, type SignupPayload} from "$lib/api";
	import { writable } from "svelte/store";
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

<div>
    <form action="" on:submit|preventDefault={handleSubmit}>
        <div>
            <label for="">Email</label>
            <input type="email" bind:value={$email}>
        </div>
        <div>
            <label for="">Username</label>
            <input type="text" bind:value={$username}>
        </div>
        <div>
            <label for="">Password</label>
            <input type="password" bind:value={$password}>
        </div>
        <div >
            <input type="submit" value="Sign up">
        </div>
    </form>
</div>