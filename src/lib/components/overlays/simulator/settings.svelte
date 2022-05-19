<script lang="ts">
    import { getContext } from 'svelte';
    import type { SimulationSettings } from '$lib/models/simulation_settings';
    import type { SimulatorService } from '$lib/services/simulator_service';
    import { SIMULATOR_SERVICE } from '$lib/services/service';

    // Props
    export let onSave: (settings: SimulationSettings) => void;

    // Services
    const simulatorService: SimulatorService = getContext(SIMULATOR_SERVICE);

    // Variables
    let settings: SimulationSettings = simulatorService.getSettings();
</script>

<section class="settings">
    <header>
        <h1>Settings</h1>
    </header>
    <main>
        <form on:submit|preventDefault>
            <label>
                <span>Max simulation delay:</span>
                <input type="number" bind:value={settings.maxDelay}>
            </label>
            <div class="submit">
                <button on:click={() => onSave(settings)}>Save</button>
            </div>
        </form>
    </main>
</section>

<style>
    header {
        @apply text-lg font-bold pb-2 mb-4 border-b border-slate-300;
    }

    form {
        @apply space-y-2 p-2 pt-0 border border-t-0 rounded-b-lg border-slate-300;
    }

    form label {
        @apply space-x-2;
    }

    form label > input {
        @apply border-b border-slate-300;
    }

    .submit {
        @apply flex justify-end;
    }

    .submit > button {
        @apply py-2 px-4 w-20 rounded-br-xl border border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white;
    }
</style>

