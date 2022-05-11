<script lang="ts">
    import type { Item } from '$lib/models/item';
    import type { User } from '$lib/models/user';
    import type { UserService } from '$lib/services/auth_service';

    import type { ElectronicsShopService } from '$lib/services/electronics_shop_service';

	import { SHOP_SERVICE, USER_SERVICE } from '$lib/services/service';

	import type { Subscription } from 'rxjs';
	import { getContext, onDestroy, onMount } from 'svelte';

	const serviceSubscriptions: Subscription[] = [];
	const shopService: ElectronicsShopService = getContext(SHOP_SERVICE) as ElectronicsShopService;
    const userService: UserService = getContext(USER_SERVICE) as UserService;
	let selectedItem: Item;
    let items:Item[] = [];
    let balance = 0;

	function buyItem(item: Item) {
        shopService.buyItem(item).then((bought)=> {
            if(bought){
                console.log("Bought item");
            }else{
                console.log("Insufficient funds");
            }
        })
	}

	onMount(() => {
		serviceSubscriptions.push(
			shopService.getItemsBehaviourSubject().subscribe((availableItems) => {
				items = availableItems;
			}),
            userService.getUserBehaviourSubject().subscribe((user) => balance = user.balance)
		);
	});

	onDestroy(() => {
		serviceSubscriptions.forEach((sub) => sub.unsubscribe());
	});

</script>

<div class="w-full h-[600px] text-center py-2">
	{#each items as item (item)}
        <div>
            <button on:click={()=> selectedItem = item}>{item.componentDefinition.name}:{item.cost}</button>
        </div>
    {:else}
        <p> No items here </p>
    {/each}
    {#if selectedItem}
        <button class="hover:text-xl" on:click={()=> buyItem(selectedItem)}>BUY</button>
    {/if}

    <h1 class="mt-10"> Remaining funds: {balance}</h1>
</div>
