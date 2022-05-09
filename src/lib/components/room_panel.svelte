<script lang="ts">
	import { createEventDispatcher, SvelteComponentDev, SvelteComponentTyped } from 'svelte/internal';
	import { page } from '$app/stores';
	import { Router } from '../router';
	import { goto } from '$app/navigation';

	const dispatch = createEventDispatcher();
	let currentPage = $page;
	let destinations = [Router.SHOP_ROUTE, Router.HOME_ROUTE, Router.OFFICE_ROUTE];

	function onCloseClicked() {
		dispatch('close');
	}

	function goToDestination(e: Event) {
		const targetDestination = (e.currentTarget as any).id;
		console.log(targetDestination);
		goto(targetDestination, { replaceState: true });
	}
</script>

<div class="z-10 fixed inset-44 flex border-2 border-solid flex-col bg-blue-700">
	<div class=" flex flex-row justify-end pr-3">
		<button class="text-4xl text-red-600" on:click={onCloseClicked}>
			CLOSE
		</button>
	</div>
	<div class="flex flex-row justify-around">
		{#each destinations as destination}
			{#if destination != currentPage.routeId}
				<div>
					<p class=" text-2xl">{destination}</p>
					<button id={destination} on:click={goToDestination}> GO </button>
				</div>
			{/if}
		{/each}
	</div>
</div>
