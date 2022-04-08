<script lang="ts">
	import { selectedComponentStore } from '$lib/stores/selected_component';

	let selectedComponent = $selectedComponentStore;
</script>

<table>
	<tr>
		<th>Field</th>
		<th>Value</th>
	</tr>
	<tr>
		<td>ID</td>
		<td>{selectedComponent != null ? selectedComponent.id : ''}</td>
	</tr>
	<tr>
		<td>Name</td>
		<td>{selectedComponent != null ? selectedComponent.definition.name : ''}</td>
	</tr>
	<tr>
		<td>Description</td>
		<td>{selectedComponent != null ? selectedComponent.definition.description : ''}</td>
	</tr>
</table>

<style>
	th {
		@apply text-left;
	}
	td {
		@apply text-left;
	}
</style>