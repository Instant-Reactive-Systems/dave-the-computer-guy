<script lang="ts">
    export let onSend: (name: string, description: string) => void;

    let name: string = "";
    let description: string = "";
</script>

<header>
    <h1>Save current circuit</h1>
</header>

<form on:submit|preventDefault>
    <div>
        <label>
            <span>Name:</span>
            <input on:keydown|stopPropagation autofocus placeholder="e.g. 'cool 8-bit counter'" bind:value={name}/>
        </label>
    </div>

    <div>
        <label>
            <span>Description:</span>
            <input on:keydown|stopPropagation placeholder="e.g. 'counts up to 255 numbers!'" bind:value={description}/>
        </label>
    </div>

    <div class="submit">
        <button on:click={() => onSend(`${name}`, `${description}`)}>Save</button>
    </div>
</form>

<style>
    header {
        @apply text-lg font-bold pb-2 mb-4 border-b border-slate-300;
    }

    form {
        @apply space-y-2 p-2 pt-0 border border-t-0 rounded-b-lg border-slate-300;
    }

    form > div > label {
        @apply space-x-2;
    }

    form > div > label > input {
        @apply border-b border-slate-300;
    }

    .submit {
        @apply flex justify-end;
    }

    .submit > button {
        @apply py-2 px-4 w-20 rounded-br-xl border border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white;
    }
</style>


