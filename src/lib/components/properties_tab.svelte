<script lang="ts">
    import { getContext, onMount } from 'svelte';
    import ParamEditor from '$lib/components/overlays/simulator/param_editor.svelte';
    import { componentStore } from '$lib/stores/component_store';
    import { circuitStore } from '$lib/stores/circuit';
    import type { ComponentDefinition } from '$lib/models/component_definition';
    import type { Component } from '$lib/models/component';
    import type { Param, Params } from '$lib/models/circuit';

    // Variables
    const { open, close } = getContext('simple-modal');
    let component: Component = null;
    let params: [string, any][] = [];
    let isPrebuilt = false;

    // Logic
    function openParamEditorModal(param: [string, any]) {
        open(ParamEditor, {
            param: param,
            onSave: (param: [string, any]) => {
                const key = `${component.id}`;
                let params = $circuitStore.params[key];
                if (params == undefined) params = {};
                params[param[0]] = param[1];
                $circuitStore.params[key] = params;
                $circuitStore = $circuitStore;
                close();
            },
        });
    }

    function getParams(): [string, any][] {
        const params: Params = {
            ...component.definition.params,
            ...$circuitStore.params[`${component.id}`]
        };
        return Object.entries(params);
    }

    $: {
        component = $componentStore;
        isPrebuilt = component && component!.definition.id < 0;
    }

    $: if (component != null) {
        $circuitStore;
        params = getParams();
    }
</script>

<div class="indenter scroll-shadows-y">
    {#if component == null}
        <div class="none-selected">
            <h2>Select a component to modify.</h2>
        </div>
    {:else}
        <section class="common">
            <ul>
                <li>
                    <span>ID:</span>
                    <span>{component.id}</span>
                </li>
                <li>
                    <span>Name:</span>
                    <span>{component.definition.name}</span>
                </li>
                <li>
                    <span>Description:</span>
                    {#if component.definition.description != ''}
                        <span>{component.definition.description}</span>
                    {:else}
                        <span class="text-gray-400">No description.</span>
                    {/if}
                </li>
            </ul>
        </section>
        <section class="params" class:hidden={!isPrebuilt}>
            <h1>Parameters</h1>
            <table>
                <thead>
                    <tr>
                        <td>Name</td>
                        <td>Value</td>
                    </tr>
                </thead>
                <tbody>
                    {#each params as param}
                        {@const [name, value] = param}
                        <tr on:click={() => openParamEditorModal(param)} class="param-row">
                            <td>{name}</td>
                            <td>{value}</td>
                        </tr>
                    {:else}
                        <tr>
                            <td colspan="2">
                                Component has no parameters.
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </section>
    {/if}
</div>

<style>
    .indenter {
        @apply mx-2 py-2 space-y-4 h-full overflow-y-auto;
    }

    .common > ul > li > span:first-child {
        @apply font-medium;
    }

    .common > ul > li {
        @apply space-x-2;
    }

    .params {
        @apply space-y-2;
    }

    .params > h1 {
        @apply mb-2 text-xl font-bold;
    }

    .params > table {
        @apply w-full border-collapse table-fixed border border-slate-300;
    }

    .params > table > thead {
        @apply text-center font-medium border-b border-slate-300;
    }

    .params > table > tbody .param-row {
        @apply cursor-pointer border-b border-slate-200 hover:bg-blue-400 hover:text-white;
    }

    .params > table td:first-child {
        @apply border-r border-slate-200;
    }

    .params > table > tbody td:last-child {
        @apply text-center;
    }

    .params > table > tbody td {
        @apply text-center px-2 truncate;
    }

    .none-selected {
        @apply text-center text-lg font-bold;
    }
</style>

