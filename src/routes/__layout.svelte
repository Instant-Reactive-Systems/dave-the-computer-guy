<script lang="ts">
	import { onDestroy, onMount, setContext } from 'svelte';
	import '../app.css';
	import { Connector } from '$lib/models/connector';
	import { TypedJSON } from 'typedjson';
	import { Connection } from '$lib/models/connection';
	import {  AUTH_SERVICE, CIRCUIT_LOADER_SERVICE, COMPONENT_DEFINITION_LOADER_SERVICE } from '$lib/services/service';
	import { MockAuthService } from '$lib/services/impl/mock_auth_service';
	import type { AuthService } from '$lib/services/auth_service';
	import type { CircuitLoaderService } from '$lib/services/circuit_loader_service';
	import type { ComponentDefinitionLoaderService } from '$lib/services/component_definition_loader_service';
	import { MockCircuitLoaderService } from '$lib/services/impl/mock_circuit_loader_service';
	import { MockComponentDefinitonLoaderService } from '$lib/services/impl/mock_component_definition_loader';


	let authService:AuthService;
	let circuitLoaderService: CircuitLoaderService;
	let componentDefinitionLoaderService: ComponentDefinitionLoaderService;
	authService = new MockAuthService();
	circuitLoaderService = new MockCircuitLoaderService();
	componentDefinitionLoaderService = new MockComponentDefinitonLoaderService();
	setContext(AUTH_SERVICE,authService);
	setContext(CIRCUIT_LOADER_SERVICE,circuitLoaderService);
	setContext(COMPONENT_DEFINITION_LOADER_SERVICE,componentDefinitionLoaderService);

	onMount(() => {
		
	});
	

	onDestroy(() => {
		console.log("Root layout destroyed");
	})
</script>

<slot />
