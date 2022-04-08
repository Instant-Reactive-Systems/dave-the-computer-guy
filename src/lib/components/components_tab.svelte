<script lang="ts">
	import { selectedComponentStore } from '$lib/stores/selected_component';

	let selectedComponent = $selectedComponentStore;
</script>

<div class="mx-2">
	<table class="table-fixed w-full">
		<thead>
			<tr>
				<th>Field</th>
				<th>Value</th>
			</tr>
			<thead />
		</thead><tbody>
			<tr>
				<td class="text-center">ID</td>
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
		</tbody>
	</table>
</div>

<style>
	th {
		@apply text-left;
	}
	td {
		@apply text-left;
	}
</style>
