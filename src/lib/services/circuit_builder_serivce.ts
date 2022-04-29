import type { Circuit } from "$lib/models/circuit";

export type CircuitBuilderService = {
    init();
    dispose();
    deductConnections(circuit:Circuit): Promise<Circuit>
} 