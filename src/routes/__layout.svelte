<script>
	import { onMount } from 'svelte';
	import '../app.css';
	import { Connector } from '$lib/models/connector';
	import { TypedJSON } from 'typedjson';
import { Connection } from '$lib/models/connection';


	onMount(() => {
		const serializer = new TypedJSON(Connection);
		const connectorFrom = new Connector();
		connectorFrom.componentId = 1;
		connectorFrom.pin = 1;
		const connectorTo = new Connector();
		connectorTo.componentId = 2;
		connectorTo.pin = 1;

		const connection = new Connection();
		connection.from = connectorFrom;
		connection.to = [connectorTo];


		const json = serializer.stringify(connection);
		console.log(json,serializer.parse(json));
	});
</script>

<slot />
