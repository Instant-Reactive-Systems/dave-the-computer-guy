import type { Circuit } from "$lib/models/circuit";
import type { ComponentDefinition } from "$lib/models/component_definition";
import type { ComponentRef } from "$lib/models/component_ref";

export type CircuitBuilderService = {
    init();
    dispose();
    deductConnections(circuit: Circuit): Promise<Circuit>;
    addNewComponent(circuit: Circuit,definition: ComponentDefinition, x: number, y: number): Promise<Circuit>
} 