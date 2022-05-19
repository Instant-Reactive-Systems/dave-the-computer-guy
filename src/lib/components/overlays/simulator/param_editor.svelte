<script lang="ts">
    import type { Param } from '$lib/models/circuit';
    import { todo } from '$lib/util/common';

    // Props
    export let param: [string, any];
    export let onSave: (param: [string, any]) => void;

    // Variables
    let value: any = param[1];

    // Logic
    function saveParam() {
        param[1] = value;
        onSave(param);
    }
</script>

<form on:submit|preventDefault>
    <header>
        <h1>Edit parameter '{param[0]}'</h1>
    </header>
    <main>
        {#if typeof param[1] == 'string'}
            <label>
                <span>Value:</span>
                <input on:keydown|stopPropagation placeholder="cool string" bind:value={value}/>
            </label>
        {:else if typeof param[1] === 'number'}
            <label>
                <span>Value:</span>
                <input on:keydown|stopPropagation type="number" bind:value={value}/>
            </label>
        {:else if typeof param[1] === 'boolean'}
            <label>
                <span>Value:</span>
                <input on:keydown|stopPropagation type="checkbox" bind:value={value}/>
            </label>
        {/if}
        <div class="submit">
            <button on:click={saveParam}>
                Save
            </button>
        </div>
    </main>
</form>

<style>
    form > header {
        @apply text-lg font-bold pb-2 mb-4 border-b border-slate-300;
    }

    form > main {
        @apply p-2 pt-0 border border-t-0 rounded-b-lg border-slate-300;
    }

    form > main > label {
        @apply space-x-2;
    }

    form > main > label > input {
        @apply border-b border-slate-300;
    }

    .submit {
        @apply flex justify-end;
    }

    .submit > button {
        @apply py-2 px-4 w-20 rounded-br-xl border border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white;
    }
</style>
