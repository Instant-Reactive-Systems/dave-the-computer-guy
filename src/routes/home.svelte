<script lang="ts">
	import Home_01 from '$lib/components/home/home_01.svelte';
	import Home_02 from '$lib/components/home/home_02.svelte';

	import type { House } from '$lib/models/house';

	import type { HouseService } from '$lib/services/house_service';
	import { HOUSE_SERVICE } from '$lib/services/service';
	import type { Subscription } from 'rxjs';
	import { getContext, onDestroy, onMount } from 'svelte';

	const houseService: HouseService = getContext(HOUSE_SERVICE);

	const subscriptions: Subscription[] = [];

	const houseMap = {
		'1': Home_01,
		'2': Home_02
	};

	let currentHouse: {
		house: House;
		component: any;
	} = null;

	onMount(() => {
		subscriptions.push(
			houseService.getHouseBehaviourSubject().subscribe((house) => {
				currentHouse = {
					house: house,
					component: houseMap[house.id]
				};
			})
		);
	});

	onDestroy(() => {
		for (const sub of subscriptions) {
			sub.unsubscribe();
		}
	});
</script>

<svelte:component this={currentHouse?.component} />

<style>
</style>
