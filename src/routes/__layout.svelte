<script lang="ts">
	import { onDestroy, onMount, setContext, getContext, SvelteComponent } from 'svelte';
	import '../app.css';
	import { Connector } from '$lib/models/connector';
	import { TypedJSON } from 'typedjson';
	import { Connection } from '$lib/models/connection';
	import {
		AUTH_SERVICE,
		CIRCUIT_BUILDER_SERVICE,
		CIRCUIT_LOADER_SERVICE,
		COMPONENT_DEFINITION_LOADER_SERVICE,
		QUEST_SERVICE,
		SIMULATOR_SERVICE
	} from '$lib/services/service';
	import { MockAuthService } from '$lib/services/impl/mock_auth_service';
	import type { AuthService } from '$lib/services/auth_service';
	import type { CircuitLoaderService } from '$lib/services/circuit_loader_service';
	import type { ComponentDefinitionLoaderService } from '$lib/services/component_definition_loader_service';
	import { MockCircuitLoaderService } from '$lib/services/impl/mock_circuit_loader_service';
	import { MockComponentDefinitonLoaderService } from '$lib/services/impl/mock_component_definition_loader';
	import type { SimulatorService } from '$lib/services/simulator_service';
	import { WorkerSimulatorService } from '$lib/services/impl/worker_simulator_service';
	import type { CircuitBuilderService } from '$lib/services/circuit_builder_serivce';
	import { WorkerCircuitBuilderService } from '$lib/services/impl/worker_circuit_builder_service';
	import Modal from 'svelte-simple-modal';
	import PageTransition from '$lib/components/page_transition.svelte';
	import { page } from '$app/stores';
	import type { QuestService } from '$lib/services/quest_service';
	import { MockQuestsService } from '$lib/services/impl/mock_quest_service';

	let authService: AuthService = new MockAuthService();
	let circuitLoaderService: CircuitLoaderService = new MockCircuitLoaderService();
	let componentDefinitionLoaderService: ComponentDefinitionLoaderService =
		new MockComponentDefinitonLoaderService();
	let simulatorService: SimulatorService = new WorkerSimulatorService();
	let circuitBuilderService: CircuitBuilderService = new WorkerCircuitBuilderService();
	let questsService: QuestService = new MockQuestsService();
	setContext(AUTH_SERVICE, authService);
	setContext(CIRCUIT_LOADER_SERVICE, circuitLoaderService);
	setContext(COMPONENT_DEFINITION_LOADER_SERVICE, componentDefinitionLoaderService);
	setContext(SIMULATOR_SERVICE, simulatorService);
	setContext(CIRCUIT_BUILDER_SERVICE, circuitBuilderService);
	setContext(QUEST_SERVICE, questsService);

	const services = [
		authService,
		circuitLoaderService,
		componentDefinitionLoaderService,
		simulatorService,
		circuitBuilderService,
		questsService
	];
	onMount(() => {
		console.log('App root initted');
		for (const service of services) {
			service.init();
		}
	});

	onDestroy(() => {
		console.log('App root disposed');
		for (const service of services) {
			service.dispose();
		}
	});
</script>

<Modal>
	<PageTransition refresh={$page.routeId}>
		<slot />
	</PageTransition>
</Modal>
