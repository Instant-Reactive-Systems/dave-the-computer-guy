<script lang="ts">
	import { onDestroy, onMount, setContext } from 'svelte';
	import '../app.css';
	import {
		CIRCUIT_BUILDER_SERVICE,
		CIRCUIT_LOADER_SERVICE,
		COMPONENT_DEFINITION_LOADER_SERVICE,
		QUEST_SERVICE,
		SIMULATOR_SERVICE,
		USER_SERVICE
	} from '$lib/services/service';
	import type { CircuitLoaderService } from '$lib/services/circuit_loader_service';
	import type { ComponentDefinitionLoaderService } from '$lib/services/component_definition_loader_service';
	import { MockCircuitLoaderService } from '$lib/services/impl/mock_circuit_loader_service';
	import { MockComponentDefinitonLoaderService } from '$lib/services/impl/mock_component_definition_loader';
	import type { SimulatorService } from '$lib/services/simulator_service';
	import { WorkerSimulatorService } from '$lib/services/impl/worker_simulator_service';
	import type { CircuitBuilderService } from '$lib/services/circuit_builder_serivce';
	import { WorkerCircuitBuilderService } from '$lib/services/impl/worker_circuit_builder_service';
    import Modal from 'svelte-simple-modal';
	import Notifications from 'svelte-notifications'; 
	import type { QuestService } from '$lib/services/quest_service';
	import { MockQuestsService } from '$lib/services/impl/mock_quest_service';
	import type { UserService } from '$lib/services/auth_service';
	import { MockUserService } from '$lib/services/impl/mock_user_service';

	let userService: UserService = new MockUserService();
	let circuitLoaderService: CircuitLoaderService = new MockCircuitLoaderService();
	let componentDefinitionLoaderService: ComponentDefinitionLoaderService =
		new MockComponentDefinitonLoaderService();
	let simulatorService: SimulatorService = new WorkerSimulatorService(componentDefinitionLoaderService);
	let circuitBuilderService: CircuitBuilderService = new WorkerCircuitBuilderService();
	let questsService: QuestService = new MockQuestsService(userService);
	setContext(USER_SERVICE, userService);
	setContext(CIRCUIT_LOADER_SERVICE, circuitLoaderService);
	setContext(COMPONENT_DEFINITION_LOADER_SERVICE, componentDefinitionLoaderService);
	setContext(SIMULATOR_SERVICE, simulatorService);
	setContext(CIRCUIT_BUILDER_SERVICE, circuitBuilderService);
	setContext(QUEST_SERVICE, questsService);

	const services = [
		userService,
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

<Notifications>
    <Modal>
				    <slot />
    </Modal>
</Notifications>
