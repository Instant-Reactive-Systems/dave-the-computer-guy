<script lang="ts">
    import type { Param } from '$lib/models/circuit';
    import { todo } from '$lib/util/common';

    // Props
    export let param: Param;
    export let onSave: (param: Param) => void;

    // Variables
    let value: any = param.value;

    // Logic
    function saveParam() {
        param.value = value;
        onSave(param);
    }
</script>

<form on:submit|preventDefault>
    <header>
        <h1>Edit parameter '{param.name}'</h1>
    </header>
    <main>
        {#if typeof param.value == 'string'}
            <label>
                <span>Value:</span>
                <input on:keydown|stopPropagation placeholder="cool string" bind:value={value}/>
            </label>
        {:else if typeof param.value === 'number'}
            <label>
                <span>Value:</span>
                <input on:keydown|stopPropagation type="number" bind:value={value}/>
            </label>
        {:else if typeof param.value === 'boolean'}
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
