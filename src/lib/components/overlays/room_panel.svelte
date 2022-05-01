<script lang="ts">
	import { page } from '$app/stores';
	import { Router } from '$lib/router';
	import { goto } from '$app/navigation';

	let currentPage = $page;
	let destinations = [Router.SHOP_ROUTE, Router.HOME_ROUTE, Router.OFFICE_ROUTE];

	function goToDestination(e: Event) {
		const targetDestination = (e.currentTarget as any).id;
		goto(targetDestination, { replaceState: true });
	}

</script>


{#each destinations as destination}
	{#if destination != currentPage.routeId}
		<div>
			<p class=" text-2xl">{destination}</p>
			<button id={destination} on:click={goToDestination}> GO </button>
		</div>
	{/if}
{/each}

<style>
</style>
