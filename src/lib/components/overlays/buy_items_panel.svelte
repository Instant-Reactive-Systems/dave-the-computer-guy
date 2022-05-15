<script lang="ts">
	import type { Item, ItemType } from '$lib/models/item';
	import type { HouseService } from '$lib/services/house_service';
	import { MockHouseService } from '$lib/services/impl/mock_house_service';
	import { HOUSE_SERVICE } from '$lib/services/service';
	import { getContext, onMount } from 'svelte';

	export let itemType: ItemType;
	export let items: Item[];
	export let selectedItemId: number;

	const houseService: HouseService = getContext(HOUSE_SERVICE);

	async function buyItem(item: Item) {
		let boughtItem;
		try {
			boughtItem = await houseService.buyItem(item);
		} catch (e) {
			console.log(e);
			return;
		}
		let index = items.findIndex((i) => i.id == item.id);
		items[index] = item;
		items = items;
		console.log(items);
	}

	function selectItem(item: Item) {
		if (item.id == selectedItemId) {
			return;
		} else {
			houseService.setItem(itemType, item).then(() => {
				selectedItemId = item.id;
			});
			console.log('items', items);
		}
	}

	console.log(items);
</script>

<div class="w-[500px]">
	<p>Welcome to the {itemType} buy panel</p>
	{#each items as item (item.id)}
		<div class="flex flex-row space-x-3 mt-2">
			<p>{item.name}</p>
			{#if !item.owned}
				<button on:click={() => buyItem(item)} class="bg-blue-100 p-1">BUY: {item.cost}</button>
			{:else}
				<button
					on:click={() => selectItem(item)}
					class:selected={item.id === selectedItemId}
					class="bg-blue-100 p-1">SELECT</button
				>
			{/if}
		</div>
	{/each}
</div>

<style>
	.selected {
		@apply font-extrabold;
	}
</style>
