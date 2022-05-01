<script lang="ts">
	import type { QuestService } from '$lib/services/quest_service';
	import { QUEST_SERVICE } from '$lib/services/service';

	import type { Subscription } from 'rxjs';
	import { getContext, onDestroy, onMount } from 'svelte';

	const serviceSubscriptions: Subscription[] = [];
	const questService: QuestService = getContext(QUEST_SERVICE) as QuestService;
	let availableQuests = [];

	onMount(() => {
		serviceSubscriptions.push(
			questService
				.getAvailableQuestsBehaviourSubject()
				.subscribe((quests) => availableQuests = quests)
		);
	});

	onDestroy(() => {
		serviceSubscriptions.forEach((sub) => sub.unsubscribe());
	});
</script>

<div class="w-[1000px]">
    <div>
        <h1>Available quests</h1>
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
