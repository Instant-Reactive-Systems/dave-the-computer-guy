<script lang="ts">
    import _ from 'lodash';
    import { circuitStore } from '$lib/stores/circuit';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    type TableEntry = {
        pinName: string,
        pinPosition: string,
        componentId: string,
        pinId: string,
    };

    let name: string;
    let description: string;
    let outputEntries: TableEntry[] = [];
    let inputEntries: TableEntry[] = [];

    const DEFAULT_ENTRY: TableEntry = {
        pinName: '',
        pinPosition: 'left',
        componentId: '0',
        pinId: '0',
    };

    function onExport() {
        const circuit = $circuitStore;
    }
</script>

<div class="wrapper">
    <header>
        <h1>Export circuit as component</h1>
    </header>
    <main>
        <section class="common">
            <div>
                <label>
                    <span>Name:</span>
                    <input on:keydown|stopPropagation placeholder="e.g. 'my component'" bind:value={name}>
                </label>
            </div>
            <div>
                <label>
                    <span>Description:</span>
                    <input on:keydown|stopPropagation placeholder="e.g. 'does stuff'" bind:value={description}>
                </label>
            </div>
        </section>
        <section class="pins">
            <h2>Output pins</h2>
            <table>
                <thead>
                    <tr>
                        <td>Pin name</td>
                        <td>Pin position</td>
                        <td>Component ID</td>
                        <td>Pin ID</td>
                    </tr>
                </thead>
                <tbody>
                    {#each outputEntries as entry (entry)}
                    <tr class="non-empty-table">
                        <td on:keydown|stopPropagation contenteditable="true" bind:innerHTML={entry.pinName}/>
                        <td>
                            <select bind:value={entry.pinPosition} class="pin-position">
                                <option value="left">left</option>
                                <option value="right">right</option>
                                <option value="top">top</option>
                                <option value="bottom">bottom</option>
                            </select>
                        </td>
                        <td on:keydown|stopPropagation contenteditable="true" bind:innerHTML={entry.componentId}/>
                        <td on:keydown|stopPropagation contenteditable="true" bind:innerHTML={entry.pinId}/>
                    </tr>
                    {:else}
                    <tr class="empty-table">
                        <td colspan="4">No entries.</td>
                    </tr>
                    {/each}
                </tbody>
            </table>
            <ul class="button-row">
                <li>
                    <button title="Add entry" on:click={() => outputEntries = [...outputEntries, _.cloneDeep(DEFAULT_ENTRY)]}>+</button>
                </li>
                <li>
                    <button title="Remove selected entry" on:click={() => {outputEntries.pop(); outputEntries = outputEntries;}}>-</button>
                </li>
            </ul>
        </section>
        <section class="pins">
            <h2>Input pins</h2>
            <table>
                <thead>
                    <tr>
                        <td>Pin name</td>
                        <td>Pin position</td>
                        <td>Component ID</td>
                        <td>Pin ID</td>
                    </tr>
                </thead>
                <tbody>
                    {#each inputEntries as entry (entry)}
                    <tr class="non-empty-table">
                        <td on:keydown|stopPropagation contenteditable="true" bind:innerHTML={entry.pinName}/>
                        <td>
                            <select bind:value={entry.pinPosition} class="pin-position">
                                <option value="left">left</option>
                                <option value="right">right</option>
                                <option value="top">top</option>
                                <option value="bottom">bottom</option>
                            </select>
                        </td>
                        <td on:keydown|stopPropagation contenteditable="true" bind:innerHTML={entry.componentId}/>
                        <td on:keydown|stopPropagation contenteditable="true" bind:innerHTML={entry.pinId}/>
                    </tr>
                    {:else}
                    <tr class="empty-table">
                        <td colspan="4">No entries.</td>
                    </tr>
                    {/each}
                </tbody>
            </table>
            <ul class="button-row">
                <li>
                    <button title="Add entry" on:click={() => inputEntries = [...inputEntries, _.cloneDeep(DEFAULT_ENTRY)]}>+</button>
                </li>
                <li>
                    <button title="Remove selected entry" on:click={() => {inputEntries.pop(); inputEntries = inputEntries;}}>-</button>
                </li>
            </ul>
        </section>
        <section class="export-buttons">
            <ul class="button-row">
                <li>
                    <button on:click={() => {}}>Cancel</button>
                </li>
                <li>
                    <button on:click={() => {}}>Export</button>
                </li>
            </ul>
        </section>
    </main>
</div>

<style>
    .wrapper {
        @apply mx-2 py-2 h-full overflow-y-auto;
    }

    main {
        @apply space-y-4;
    }

    header {
        @apply text-xl font-bold pb-2 mb-4 border-b border-slate-300;
    }

    h2 {
        @apply text-lg font-bold;
    }

    .common {
        @apply space-y-2;
    }

    .common > div > label {
        @apply space-x-2;
    }
    
    .common > div > label > input {
        @apply border-b border-slate-300;
    }

    section {
        @apply space-y-2;
    }

    .pins > table {
        @apply w-full border-collapse table-fixed border border-slate-300;
    }

    .pins > table > thead {
        @apply text-center font-medium border-b border-slate-300;
    }

    .pins > .non-empty-table > tbody tr {
        @apply border-b border-slate-200;
    }

    .pins > table td:not(:last-child) {
        @apply border-r border-slate-200;
    }

    .pins > .non-empty-table > tbody td {
        @apply px-2;
    }

    .button-row {
        @apply space-x-2 flex;
    }

    .button-row > li {
        @apply flex-1 text-center border border-blue-400 rounded-sm hover:bg-blue-400 hover:text-white;
    }

    .button-row > li > button {
        @apply w-full;
    }

    .export-buttons > ul {
        @apply mt-8;
    }

    .empty-table > td {
        @apply w-full text-center;
    }

    .pin-position {
        @apply w-full appearance-none bg-transparent;
    }
</style>

