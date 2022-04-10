<script>
	import { onDestroy, onMount } from 'svelte';
	import '../app.css';
	import { Connector } from '$lib/models/connector';
	import { TypedJSON } from 'typedjson';
	import { Connection } from '$lib/models/connection';


	console.log("Injecting services");
	onMount(() => {
		console.log("Mounted");
	});

	onDestroy(() => {
		console.log("Destoryed");
	})
</script>

<slot />
