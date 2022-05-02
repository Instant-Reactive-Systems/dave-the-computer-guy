<script lang="ts">
    import { getContext } from 'svelte';
    import ParamEditor from '$lib/components/overlays/simulator/param_editor.svelte';

    type Param = {
        name: string,
        value: any,
    };

    let params: Param[] = [
        {name: 'Foo', value: 'XYZ'},
        {name: 'Bar', value: 'XYZ'},
        {name: 'Baz', value: 'XYZ'},
    ];

    const { open, close } = getContext('simple-modal');
    const paramEditorModal = () => open(ParamEditor);
</script>

<div class="indenter">
    <section class="common">
        <ul>
            <li>
                <span>ID:</span>
                <span>Foo</span>
            </li>
            <li>
                <span>Name:</span>
                <span>Foo</span>
            </li>
            <li>
                <span>Description:</span>
                <span>Foo</span>
            </li>
        </ul>
    </section>
    <section class="params">
        <h1>Parameters</h1>
        <table>
            <thead>
                <tr>
                    <td>Name</td>
                    <td>Value</td>
                </tr>
            </thead>
            <tbody>
                {#each params as param, i}
                <tr on:click={paramEditorModal}>
                    <td>{param.name}</td>
                    <td>{param.value}</td>
                </tr>
                {/each}
            </tbody>
        </table>
        <button class="add-param" on:click={paramEditorModal}>Add new parameter</button>
    </section>
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

    .params > table > tbody tr {
        @apply cursor-pointer border-b border-slate-200 hover:bg-blue-400 hover:text-white;
    }

    .params > table td:first-child {
        @apply border-r border-slate-200;
    }

    .params > table > tbody td:last-child {
        @apply text-center;
    }

    .params > table > tbody td {
        @apply px-2;
    }

    .add-param {
        @apply w-full border border-slate-300 hover:bg-blue-400 hover:text-white rounded-md;
    }
</style>

