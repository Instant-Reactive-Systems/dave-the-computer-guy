import type { Circuit, Junction } from "$lib/models/circuit";
import type { ComponentDefinition } from "$lib/models/component_definition";
import type { Wire } from "$lib/models/wire";

export type CircuitBuilderService = {
    init();
    dispose();
    deductConnections(circuit: Circuit): Promise<Circuit>;
    addNewComponent(circuit: Circuit, definition: ComponentDefinition, x: number, y: number): Promise<Circuit>;
    popComponent(circuit: Circuit): Promise<Circuit>;
    moveComponent(circuit: Circuit, id: number, x: number, y: number): Promise<Circuit>;
    addNewWire(circuit: Circuit, wire: Wire, junctions: Junction[]): Promise<Circuit>
} 