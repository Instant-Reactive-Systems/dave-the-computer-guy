<script lang="ts">
import NewQuestsTab from "../new_quests_tab.svelte";
import TabSystem from "../tab_system.svelte";
import TurnInQuestTab from "../turn_in_quest_tab.svelte";

</script>

<TabSystem
tabs={[
	{ title: 'New quests', innerComponent: NewQuestsTab },
	{ title: 'Turn in quest', innerComponent: TurnInQuestTab }
]}
/>

<style>
</style>
