<script lang="ts">
    import type { Quest } from '$lib/models/quest';
	import type { AuthService } from '$lib/services/auth_service';

	import type { QuestService } from '$lib/services/quest_service';
	import { AUTH_SERVICE, QUEST_SERVICE } from '$lib/services/service';

	import type { Subscription } from 'rxjs';
	import { getContext, onDestroy, onMount } from 'svelte';

	const serviceSubscriptions: Subscription[] = [];
	const questService: QuestService = getContext(QUEST_SERVICE) as QuestService;
	const userService: AuthService = getContext(AUTH_SERVICE);
	let selectedQuest: Quest;
	let availableQuests: Quest[] = [];

	function takeQuest(quest: Quest) {
		questService.addQuestToActiveQuests(userService.getUserBehaviourSubject().getValue(), quest);
		selectedQuest = null;
	}

	onMount(() => {
		serviceSubscriptions.push(
			questService.getAvailableQuestsBehaviourSubject().subscribe((quests) => {
				availableQuests = quests;
			})
		);
	});

	onDestroy(() => {
		serviceSubscriptions.forEach((sub) => sub.unsubscribe());
	});

</script>

<div class="w-full grid grid-cols-2 divide-x">
	<div class="h-[600px] text-center overflow-y-scroll py-2">
		<h1>Available quests</h1>
		<div class="quests">
			{#each availableQuests as quest (quest.id)}
				<div
					on:click={() => (selectedQuest = quest)}
					class="py-4 border-solid border-4 border-black"
				>
					<h1>{quest.name}</h1>
				</div>
			{:else}
				<p>No work at the moment!</p>
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
            <button on:click={() => takeQuest(selectedQuest)}>Take quest</button>
		{:else}
			<p>No quest selected</p>
		{/if}
	</div>
</div>


<style>
	button{
		@apply border-solid border-2 border-black p-2
	}
</style>