
<script lang="ts">
	import { onMount, SvelteComponent } from 'svelte';
	import PageTransition from '$lib/components/page_transition.svelte'; 
	import { page } from '$app/stores';

	import '../app.css';



	onMount(() => {
		console.log("Initing");
	});
</script>
  <PageTransition refresh={$page.routeId}>
	<slot/>
  </PageTransition>
