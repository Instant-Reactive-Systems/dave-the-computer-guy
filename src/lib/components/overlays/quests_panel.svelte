<script lang="ts">
import type { Quest } from '$lib/models/quest';

	import type { QuestService } from '$lib/services/quest_service';
	import { QUEST_SERVICE } from '$lib/services/service';

	import type { Subscription } from 'rxjs';
	import { getContext, onDestroy, onMount } from 'svelte';

	const serviceSubscriptions: Subscription[] = [];
	const questService: QuestService = getContext(QUEST_SERVICE) as QuestService;
	let availableQuests:Quest[] = [];

	onMount(() => {
		serviceSubscriptions.push(
			questService
				.getAvailableQuestsBehaviourSubject()
				.subscribe((quests) => (availableQuests = quests))
		);
	});

	onDestroy(() => {
		serviceSubscriptions.forEach((sub) => sub.unsubscribe());
	});
</script>

<div class="w-full h-screen grid grid-cols-2 divide-x">
		<div class="text-center">
				<h1>Available quests</h1>
				<div class="quests">
					{#each availableQuests as quest}
						<p>{quest.name}</p>
					{:else}
					<p>No work at the moment!</p>
					{/each}

				</div>
		</div>
		<div class="text-center">
			<h1>Here quests</h1>
			<h1>Available quests</h1>
			<h1>Available quests</h1>
			<h1>Available quests</h1>
			<h1>Available quests</h1>
			<h1>Available quests</h1>
			<h1>Available quests</h1>
		</div>
</div>

<style>
</style>
