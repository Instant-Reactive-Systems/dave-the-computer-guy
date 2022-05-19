<script lang="ts">
	import { getContext, onDestroy, onMount } from 'svelte';
    import RoomBar from '$lib/components/room_bar.svelte';
    import Home_01 from '$lib/components/home/home_01.svelte';
    import Home_02 from '$lib/components/home/home_02.svelte';
	import type { HouseService } from '$lib/services/house_service';
	import { HOUSE_SERVICE } from '$lib/services/service';
	import type { Subscription } from 'rxjs';

    // Services
	const houseService: HouseService = getContext(HOUSE_SERVICE);

    // Variables
	const subs: Subscription[] = [];
	const houseMap = {
		'1': Home_01,
		'2': Home_02
	};
	let currentHouse = null;

    // Logic


    // Component lifetime
	onMount(() => {
		subs.push(
			houseService.getHouseBehaviourSubject().subscribe((house) => {
				currentHouse = houseMap[house.id];
			})
		);
	});

	onDestroy(() => {
        subs.forEach((sub) => sub.unsubscribe());
	});
</script>

<RoomBar/>
<svelte:component this={currentHouse} />