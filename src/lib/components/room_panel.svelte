<script lang="ts">
	import { createEventDispatcher } from 'svelte/internal';
	import { page } from '$app/stores';
	import Fa from 'svelte-fa/src/fa.svelte';
	import { faClose } from '@fortawesome/free-solid-svg-icons';
	import Modal from './modal.svelte';

	const dispatch = createEventDispatcher();
	let currentPage = $page;

	function onCloseClicked() {
		dispatch('close');
	}

	function onHomeClicked() {
		console.log(JSON.stringify(currentPage));
	}

	function onOfficeClicked() {
		console.log(JSON.stringify(currentPage));
	}

	function onShopClicked() {
		console.log(JSON.stringify(currentPage));
	}
</script>

<p>HEllo</p>
<Modal>
	<div class="flex border-2 border-solid flex-col">
		<button class="text-4xl text-red-600 flex flex-row justify-end pr-3" on:click={}>
			<Fa icon={faClose} />
        </button>
        <div class="flex flex-row justify-between">
            
        </div>
	</div>
	"
</Modal>
