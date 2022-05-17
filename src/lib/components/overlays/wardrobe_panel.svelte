<script lang="ts">
	import type { Item, ItemType } from '$lib/models/item';
	import type { HouseService } from '$lib/services/house_service';
	import { HOUSE_SERVICE } from '$lib/services/service';
	import { getContext } from 'svelte';
    import CoinIcon from '$lib/icons/coin.svelte';

    // Types
    type ClickedItemState = {
        type: 'bought' | 'selected' | 'already-selected' | 'broke',
        itemId: number,
    };

    // Services
	const houseService: HouseService = getContext(HOUSE_SERVICE);

    // Props 
	export let itemType: ItemType;
	export let items: Item[];
	export let selectedItemId: number;

    // Variables
    let clickedItemState: ClickedItemState = null;
    let suspendId: any = null;

    // Logic
    async function clickItem(item: Item) {
		const index = items.findIndex((i) => i.id == item.id);
        
        if (!item.owned) {
            const bought = await houseService.buyItem(item);
            if (!bought) {
                cancelClickArtifact();
                clickedItemState = {
                    type: 'broke',
                    itemId: item.id,
                };
                return;
            }
            items[index].owned = true;
            items = items;
            cancelClickArtifact();
            clickedItemState = {
                type: 'bought',
                itemId: item.id,
            };
        } else {
            if (item.id == selectedItemId) {
                cancelClickArtifact();
                clickedItemState = {
                    type: 'already-selected',
                    itemId: selectedItemId,
                };
                return;
            }

            houseService.setItem(itemType, item).then(() => {
                selectedItemId = item.id;
                cancelClickArtifact();
                clickedItemState = {
                    type: 'selected',
                    itemId: selectedItemId,
                };
            });
        }
    }

    function cancelClickArtifact() {
        suspendId != null && clearTimeout(suspendId);
    }

    $: {
        clickedItemState = clickedItemState;
        suspendId = setTimeout(() => clickedItemState = null, 3000);
    }
</script>

<section class="wardrobe-panel">
    <header>
        <h1>Wardrobe</h1>
    </header>
    <main>
        <ul class="item-grid">
            {#each items as item (item.id)}
                {@const selected = item.id == selectedItemId}
                {@const itemClicked = clickedItemState?.itemId == item.id}
                {@const itemBought = itemClicked && clickedItemState?.type == 'bought'}

                <li class:selected class:itemClicked>
                    <button on:click={() => clickItem(item)}>
                        <img src={item.imageUrl} alt={item.name}>
                        <h2>{item.name}</h2>
                        {#if !itemBought && item.owned}
                            <div class="item-overlay owned">
                                <div>
                                    <div class="item-overlay-bg"/>
                                    <div class="item-overlay-content">
                                        {#if itemClicked}
                                            {#if clickedItemState.type == 'already-selected'}
                                                <span>Already selected</span>
                                            {:else if clickedItemState.type == 'selected'}
                                                <span>Selected</span>
                                            {/if}
                                        {:else}
                                            <span>Owned</span>
                                        {/if}
                                    </div>
                                </div>
                            </div>
                        {:else}
                            <div class="item-overlay buy">
                                <div>
                                    <div class="item-overlay-bg"/>
                                    <div class="item-overlay-content">
                                        {#if itemClicked}
                                            {#if clickedItemState.type == 'bought'}
                                                <span>Bought!</span>
                                            {:else if clickedItemState.type == 'broke'}
                                                <span>Not enough money!</span>
                                            {/if}
                                        {:else}
                                            <span class="mr-1"><CoinIcon color={'#FBBF24'}/></span>
                                            <span>{item.cost}</span>
                                        {/if}
                                    </div>
                                </div>
                            </div>
                        {/if}
                    </button>
                </li>
            {/each}
        </ul>
    </main>
</section>

<style>
    .wardrobe-panel > header {
        @apply text-2xl font-bold pb-2 mb-4 border-b border-slate-300;
    }

    .wardrobe-panel > main {
        @apply px-16;
    }

    .item-grid {
        @apply mx-auto w-2/3 h-2/3 grid grid-cols-3 grid-rows-3 gap-4;
    }

    .item-grid > li {
        @apply border-2 rounded-lg border-slate-300 hover:border-blue-400 hover:shadow-lg transition duration-100;
    }

    .item-grid > li > button {
        @apply relative aspect-square;
    }

    .item-grid > li > button > img {
        @apply aspect-square rounded-t-lg z-10;
    }

    .item-grid > li > button > h2 {
        @apply py-1 truncate;
    }

    .selected {
        @apply bg-amber-400;
    }

    .item-grid > li > button:hover > .item-overlay, .itemClicked .item-overlay {
        @apply block;
    }

    .item-overlay {
        @apply hidden absolute top-0 left-0 w-full h-full rounded-lg;
    }

    .item-overlay > div {
        @apply text-2xl font-bold w-full h-full grid grid-cols-1;
    }

    .item-overlay > div > div {
        @apply col-start-1 row-start-1;
    }

    .item-overlay-bg {
        @apply block bg-gray-300 opacity-50;
    }

    .item-overlay-content {
        @apply text-yellow-400 flex justify-center items-center mix-blend-overlay;
    }
</style>
