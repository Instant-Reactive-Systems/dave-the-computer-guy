<script lang="ts">
	import type { ComponentDefinition } from '$lib/models/component_definition';
	import type { ValidationReport } from '$lib/models/component_validation';
	import type { Quest } from '$lib/models/quest';
	import type { ComponentDefinitionLoaderService } from '$lib/services/component_definition_loader_service';
	import type { QuestService } from '$lib/services/quest_service';
	import {
		COMPONENT_DEFINITION_LOADER_SERVICE,
		QUEST_SERVICE,
		SIMULATOR_SERVICE
	} from '$lib/services/service';
	import type { SimulatorService } from '$lib/services/simulator_service';
	import type { Subscription } from 'rxjs';
	import { getContext, onDestroy, onMount, tick } from 'svelte';

	const serviceSubscriptions: Subscription[] = [];
	const questService: QuestService = getContext(QUEST_SERVICE) as QuestService;
	const definitionLoaderService: ComponentDefinitionLoaderService = getContext(
		COMPONENT_DEFINITION_LOADER_SERVICE
	) as ComponentDefinitionLoaderService;
	const simulator: SimulatorService = getContext(SIMULATOR_SERVICE) as SimulatorService;
	let selectedQuest: Quest;
	let activeQuests: Quest[] = [];
	let userComponentDefs: ComponentDefinition[] = [];
	let selectedComponentDefinition: ComponentDefinition;
	let validationReport: ValidationReport;

	onMount(() => {
		serviceSubscriptions.push(
			questService.getActiveQuestsBehaviourSubject().subscribe((quests) => {
				activeQuests = quests;
			}),
			definitionLoaderService.getDefinitionsBehaviourSubject().subscribe((defs) => {
				userComponentDefs = Array.from(defs.values()).filter((def) => def.type != 'Builtin');
			})
		);
	});

	onDestroy(() => {
		serviceSubscriptions.forEach((sub) => sub.unsubscribe());
	});

	async function verifyQuest() {
		if (selectedQuest == null) {
			console.error('No quest selected');
		} else if (selectedComponentDefinition == null) {
			console.error('No defintiion selected');
		}
		let quest = selectedQuest;
		const report = await simulator.verifyComponent(
			selectedComponentDefinition,
			quest.verificationData
		);
		if(report.passed){
			questService.completeQuest(quest, '');
		}
		updateValidationReport(report);
	}

	function updateValidationReport(report: ValidationReport): Promise<void> {
		validationReport = report;
		return tick();
	}
</script>

<div class="w-full grid grid-cols-2 divide-x">
	<div class="h-[600px] grid grid-rows-2">
		<div class="text-center overflow-y-scroll py-2">
			<h1>Active quests</h1>
			<div class="quests">
				{#each activeQuests as quest (quest.id)}
					<div
						on:click={() => (selectedQuest = quest)}
						class="py-4 border-solid border-4 border-black"
					>
						<h1>{quest.name}</h1>
					</div>
				{:else}
					<p>You have no active quests</p>
				{/each}
			</div>
		</div>
		<div class="text-center overflow-y-scroll py-2">
			{#each userComponentDefs as def (def.id)}
				<div
					on:click={() => (selectedComponentDefinition = def)}
					class="py-4 border-solid border-4 border-black"
				>
					<h1>{def.name}</h1>
				</div>
			{:else}
				<p>You have no component definitions</p>
			{/each}
		</div>
	</div>
	<div class="text-center">
		{#if selectedQuest != null}
			<h2>
				NAME:{selectedQuest.name}
			</h2>
			<p>DESCRIPTION:{selectedQuest.description}</p>
			<p>REWARD:{selectedQuest.reward}</p>
		{/if}
		{#if selectedComponentDefinition != null}
			<h2>
				COMPONENT_NAME:{selectedComponentDefinition.name}
			</h2>
		{/if}
		{#if selectedQuest != null && selectedComponentDefinition != null}
			<button on:click={() => verifyQuest()}>Take quest</button>
		{/if}

		{#if validationReport != null}
			<h1>Validation Result</h1>
			<p>Passed: {validationReport.passed}</p>
			{#if !validationReport.passed}
				{#each validationReport.errors as error}
					<p>error</p>
				{/each}
			{/if}
		{/if}
	</div>
</div>

<style>
	button {
		@apply border-solid border-2 border-black p-2;
	}
</style>
