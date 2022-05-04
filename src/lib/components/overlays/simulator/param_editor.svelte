<script lang="ts">
    import type { Param } from '$lib/models/param';
    import { onMount } from 'svelte';

    export let param: Param;
    let value: string;
</script>

<form on:submit|preventDefault>
    <header>
        <h1>Edit parameter '{param.name}'</h1>
    </header>

    {#if typeof param.type == 'string'}
        <label>
            <span>Value:</span>
            <input on:keydown|stopPropagation placeholder="cool string" bind:value={value}/>
        </label>
    {:else if typeof param.type === 'number'}
        <label>
            <span>Value:</span>
            <input on:keydown|stopPropagation type="number" bind:value={value}/>
        </label>
    {:else if typeof param.type === 'boolean'}
        <label>
            <span>Value:</span>
            <input on:keydown|stopPropagation type="checkbox" bind:value={value}/>
        </label>
    {/if}
</form>

<style>
    header {
        @apply text-lg font-bold pb-2 mb-4 border-b border-slate-300;
    }

    form > label {
        @apply space-x-2;
    }

    form > label > input {
        @apply border-b border-slate-300;
    }
</style>
