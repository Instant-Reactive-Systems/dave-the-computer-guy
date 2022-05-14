<script lang="ts">
    import { getContext, onDestroy, onMount, tick } from "svelte";
    import CoinIcon from '$lib/icons/coin.svelte';
    import CloseIcon from '$lib/icons/close.svelte';
    import type { Quest } from '$lib/models/quest';
    import { 
        QUEST_SERVICE, 
        COMPONENT_DEFINITION_LOADER_SERVICE, 
        SIMULATOR_SERVICE 
    } from "$lib/services/service";
	import type { ComponentDefinitionLoaderService } from '$lib/services/component_definition_loader_service';
    import type { QuestService } from "$lib/services/quest_service";
    import type { Subscription } from "rxjs";
    import { assert, todo } from "$lib/util/common";
    import type { ComponentDefinition } from "$lib/models/component_definition";
	import type { SimulatorService } from '$lib/services/simulator_service';
    import type { ValidationReport } from "$lib/models/component_validation";
    import { toBinaryArray } from "$lib/util/common";
    
    // Services
    const serviceSubs: Subscription[] = [];
    const questService: QuestService = getContext(QUEST_SERVICE) as QuestService;
    const definitionLoaderService: ComponentDefinitionLoaderService = getContext(
		COMPONENT_DEFINITION_LOADER_SERVICE
	) as ComponentDefinitionLoaderService;
	const simulator: SimulatorService = getContext(SIMULATOR_SERVICE) as SimulatorService;

    // Variables
    let selectedQuest: Quest = null;
    let selectedDef: ComponentDefinition = null;
    let validationReport: ValidationReport = null;
    let availableQuests: Quest[] = [];
    let activeQuests: Quest[] = [];
    let userDefs: ComponentDefinition[] = [];
    let selectedQuestType: 'active' | 'available';
    let sidePanelOpened = false;
    let sidePanelClosed = false;
    let turningIn = false;
    let showingReport = false;
    
    // Logic
    function openQuest(quest: Quest) {
        selectedQuest = quest;
        closeSidePanel();
    }

    function acceptQuest() {
        questService.addQuestToActiveQuests(selectedQuest);
    }

    function turnInQuest() {
        openSidePanel();
        turningIn = true;
    }
    
    function disbandQuest() {
        questService.disbandQuest(selectedQuest);
    }

    function cancelTurnInQuest() {
        turningIn = false;
        closeSidePanel();
    }

    function confirmTurnInQuest() {
        verifyQuest();
        turningIn = false;
    }
    
    function openSidePanel() {
        sidePanelOpened = true;
    }

    function closeSidePanel() {
        sidePanelOpened = false;
        turningIn = false;
        showingReport = false;
        selectedDef = null;
    }

    function showReport() {
        turningIn = false;
        showingReport = true;
    }

    function selectComponentDef(def: ComponentDefinition) {
        selectedDef = def;
    }

    async function verifyQuest() {
        const quest = selectedQuest;
		const report = await simulator.verifyComponent(
			selectedDef,
			quest.verificationData
		);

		if (report.passed) {
            selectedQuest = null;
			await questService.completeQuest(quest, '');
            closeSidePanel();
		} else {
            console.log('Report failed, should open report');
            validationReport = report;
            showReport();
        }
	}
    
    $: {
        // Assigns the correct quest type when a quest is selected
        if (selectedQuest != null) {
            if (availableQuests.find((x) => x == selectedQuest)) selectedQuestType = 'available';
            else selectedQuestType = 'active';
        }
    }

    $: {
        // Used for animations
        sidePanelClosed = !sidePanelOpened;
    }

    // Component lifetime
    onMount(() => {
		serviceSubs.push(
			questService.getAvailableQuestsBehaviourSubject().subscribe((quests) => {
				availableQuests = quests;
			}),
            questService.getActiveQuestsBehaviourSubject().subscribe((quests) => {
				activeQuests = quests;
			}),
            definitionLoaderService.getDefinitionsBehaviourSubject().subscribe((defs) => {
				userDefs = Array.from(defs.values()).filter((def) => def.type != 'Builtin');
			})
		);
	});

	onDestroy(() => {
		serviceSubs.forEach((sub) => sub.unsubscribe());
	})
</script>

<section class="quests-main">
    <header>
        <h1>Quests</h1>
    </header>
    <main>
        <ul class="quest-list">
            <li>
                <h2>Active quests</h2>
                <ul class="quests">
                    {#each activeQuests as quest (quest.id)}
                    <li>
                        <button on:click={() => openQuest(quest)} class:selected={selectedQuest != null && selectedQuest.id == quest.id}>
                            <span class="quest-id">#{quest.id}</span>
                            <span class="quest-name">{quest.name}</span>
                        </button>
                    </li>
                    {:else}
                    <div class="no-quests">
                        <span>No active quests taken.</span>
                    </div>
                    {/each}
                </ul>
            </li>
            <li>
                <h2>Available quests</h2>
                <ul class="quests">
                    {#each availableQuests as quest (quest.id)}
                    <li>
                        <button on:click={() => openQuest(quest)} class:selected={selectedQuest != null && selectedQuest.id == quest.id}>
                            <span class="quest-id">#{quest.id}</span>
                            <span class="quest-name">{quest.name}</span>
                        </button>
                    </li>
                    {:else}
                    <div class="no-quests">
                        <span>No work available.</span>
                    </div>
                    {/each}
                </ul>
            </li>
        </ul>
        <section class="quest-info">
            {#if selectedQuest}
                <section class="quest-info-main" class:sidePanelOpened class:sidePanelClosed>
                    <h3>
                        <span>#{selectedQuest.id}</span> 
                        <span>{selectedQuest.name}</span>
                    </h3>
                    <p>{selectedQuest.description}</p>
                    <section class="reward">
                        <h4>Reward</h4>
                        <p>
                            <span><CoinIcon color={'#FBBF24'}/></span>
                            <span>{selectedQuest.reward}</span>
                        </p>
                    </section>
                    <section class="quest-controls">
                        {#if selectedQuestType == 'available'}
                            <button on:click={acceptQuest} class="accept-quest">
                                <span>Accept quest</span>
                            </button>
                        {:else}
                            <button on:click={turnInQuest} class="turn-in-quest">
                                <span>Turn in quest</span>
                            </button>
                            <button on:click={disbandQuest} class="disband-quest">
                                <span>Disband quest</span>
                            </button>
                        {/if}
                    </section>
                </section>

                <!--- Side panel for turning in -->
                {#if sidePanelOpened}
                    <section class="quest-side-panel">
                        <button on:click={cancelTurnInQuest}>
                            <CloseIcon/>
                        </button>
                        {#if turningIn}
                            <div class="panel turn-in-panel">
                                <header>
                                    <h1>Select component to turn in</h1>
                                </header>
                                <ul class="component-def-list">
                                    {#each userDefs as def (def.id)}
                                    <li>
                                        <button on:click={() => selectComponentDef(def)} class:selected={selectedDef != null && selectedDef.id == def.id}>
                                            <span>{def.name}</span>
                                            <span>{def.description}</span>
                                        </button>
                                    </li>
                                    {:else}
                                        <span>No user-defined components available.</span>
                                    {/each}
                                </ul>
                                <button on:click={confirmTurnInQuest} disabled={selectedDef == null}>
                                    <span>Turn in</span>
                                </button>
                            </div>
                        {:else if showingReport}
                            <div class="panel">
                                <header>
                                    <h1>Validation report</h1>
                                </header>
                                <ul class="panel-list">
                                    {#each validationReport.errors as error}
                                    <li>
                                        {#if error.type == 'incorrectOutputs'}
                                            <div class="err-incorrect-outputs">
                                                <header>
                                                    <h2>Your outputs don't match the expected outputs!</h2>
                                                </header>
                                                <table>
                                                    <thead>
                                                        <tr>
                                                            <td rowspan="2">Inputs</td>
                                                            <td colspan="2">Outputs</td>
                                                        </tr>
                                                        <tr>
                                                            <td>Actual</td>
                                                            <td>Expected</td>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td>
                                                                {toBinaryArray(error.data.input)}
                                                            </td>
                                                            <td class="err">
                                                                {toBinaryArray(error.data.actual)}
                                                            </td>
                                                            <td class="ok">
                                                                {toBinaryArray(error.data.expected)}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        {:else if error.type == 'maxComponentsExceeded'}
                                            <div class="err-max-components">
                                                <header>
                                                    <h2>You used more components than the quest requires!</h2>
                                                </header>
                                                <p>
                                                    You used <span class="err">{error.data.used}</span> but the quest 
                                                    requires you to use up to <span class="ok">{error.data.max_allowed}</span> 
                                                    components.
                                                </p>
                                            </div>
                                        {:else if error.type == 'invalidComponentInterface'}
                                            <div class="err-component-interface">
                                                <header>
                                                    <h2>You did not expose the correct component interface!</h2>
                                                </header>
                                                <p>
                                                    For the <span class="font-bold">{error.data.kind}</span> side of the component 
                                                    you exposed <span class="err">{error.data.actual}</span> pins, but the 
                                                    quest requires that you expose <span class="ok">{error.data.expected}</span>.
                                                </p>
                                            </div>
                                        {/if}
                                    </li>
                                    {:else}
                                        <span>No user-defined components available.</span>
                                    {/each}
                                </ul>
                            </div>
                        {/if}
                    </section>
                {/if}
            {:else}
                <div class="no-selected-quest">
                    <span>Select a quest to view it.</span>
                </div>
            {/if}
        </section>
    </main>
</section>

<style>
    .quests-main {
        @apply h-[40rem];
    }

    .quests-main > header {
        @apply text-2xl font-bold pb-2 mb-4 border-b border-slate-300;
    }

    h2 {
        @apply text-lg font-bold;
    }

    main {
        @apply h-[36.5rem] grid grid-cols-12 border border-t-0 rounded-b-lg border-slate-300;
    }

    .quest-list {
        @apply col-span-4 overflow-y-auto border-r border-slate-200;
    }

    .quest-list h2 {
        @apply px-2 sticky top-0 bg-white shadow-lg;
    }

    .quest-id {
        @apply text-[1.05rem] font-bold pr-2 mr-1 border-r border-slate-300;
    }
    
    .quest-name {
        @apply text-[1.05rem];
    }

    .quests > li {
        @apply border-b border-b-slate-200 hover:bg-slate-100;
    }

    .quests > li > button {
        @apply px-4 py-2 w-full text-left;
    }

    .selected {
        @apply transition-all duration-100 border-l-4 border-l-blue-400;
    }

    .no-quests {
        @apply flex justify-center py-2 text-lg;
    }

    .quest-info {
        @apply col-span-8 grid grid-cols-1;
    }

    .sidePanelOpened {
        @apply blur transition duration-200;
    }
    
    .sidePanelClosed {
        @apply transition duration-200;
    }

    .quest-info-main {
        @apply h-full col-start-1 row-start-1 p-4 pt-2 bg-white;
    }

    .quest-info-main > h3 {
        @apply text-4xl font-bold pb-2 mb-2 border-b border-b-slate-200;
    }

    .quest-info-main > h3 > span:first-child {
        @apply pr-3 mr-2 border-r border-r-slate-300;
    }

    .quest-info-main > p {
        @apply text-lg text-slate-500 mb-4 h-[24rem];
    }

    .reward {
        @apply text-center;
    }

    .reward > h4 {
        @apply text-2xl font-bold;
    }

    .reward > p {
        @apply text-lg inline-flex;
    }

    .reward > p > span:first-child {
        @apply mr-1;
    }

    .quest-controls {
        @apply flex justify-center space-x-2;
    }

    .quest-controls > button {
        @apply py-1 px-4 rounded-md hover:opacity-75;
    }

    .accept-quest, .turn-in-quest {
        @apply bg-emerald-500;
    }

    .disband-quest {
        @apply bg-red-700;
    }

    .no-selected-quest {
        @apply h-[36.5rem] flex justify-center items-center text-3xl;
    }

    .quest-side-panel {
        @apply h-[36.5rem] col-start-1 row-start-1 flex justify-end z-50 relative;
    }

    .quest-side-panel > button {
        @apply absolute top-0 right-0 rounded-full mt-1 mr-1 hover:bg-slate-300 hover:opacity-50;
    }

    .panel {
        @apply w-1/2 p-4 bg-white rounded-br-lg border-l-2 border-b border-slate-300 transition-transform duration-100 ease-in;
    }

    .panel > header {
        @apply text-2xl font-bold pb-2 mb-4 border-b border-slate-300;
    }

    .panel-list {
        @apply h-[31rem] mb-2 border border-t-0 rounded-b-lg border-slate-300 overflow-y-auto;
    }
    
    .panel-list > li {
        @apply py-1 px-2 border-b border-b-slate-200 hover:bg-slate-100;
    }

    .component-def-list {
        @apply h-[28rem] mb-2 border border-t-0 rounded-b-lg border-slate-300 overflow-y-auto;
    }

    .component-def-list > li {
        @apply border-b border-b-slate-200 hover:bg-slate-100;
    }
    
    .component-def-list > li > button {
        @apply w-full py-1 px-2 text-left truncate;
    }

    .turn-in-panel > button {
        @apply w-full py-1 px-2 rounded-md border border-blue-400 hover:bg-blue-400 hover:text-white;
    }

    .turn-in-panel > button:disabled {
        @apply cursor-not-allowed;
    }

    .err-incorrect-outputs > table {
        @apply w-full mb-2 border-collapse;
    }

    .err-incorrect-outputs > table td {
        @apply border border-slate-300 text-center;
    }

    .err {
        @apply text-red-700 font-semibold;
    }
    
    .ok {
        @apply text-emerald-500 font-semibold;
    }
</style>

