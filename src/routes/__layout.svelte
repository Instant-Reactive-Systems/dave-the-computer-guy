<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import '../app.css';
	import { Connector } from '$lib/models/connector';
	import { TypedJSON } from 'typedjson';
	import { Connection } from '$lib/models/connection';
	import { addService } from '$lib/services/service';
	import { MockAuthService } from '$lib/services/impl/mock_auth_service';
import type { AuthService } from '$lib/services/auth_service';
import type { CircuitLoaderService } from '$lib/services/circuit_loader_service';
import type { ComponentDefinitionLoaderService } from '$lib/services/component_definition_loader_service';
import { MockCircuitLoaderService } from '$lib/services/impl/mock_circuit_loader_service';


	let authService:AuthService;
	let circuitLoaderService: CircuitLoaderService;
	let componentDefinitionLoaderService: ComponentDefinitionLoaderService;


	onMount(() => {
		authService = new MockAuthService();
		circuitLoaderService = new MockCircuitLoaderService();
		
	});
	

	onDestroy(() => {
		console.log("Root layout destroyed");
	})
</script>

<slot />
