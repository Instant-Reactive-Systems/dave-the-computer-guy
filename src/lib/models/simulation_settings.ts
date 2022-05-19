export type SimulationSettings = {
    maxDelay: number,
};

export function defaultSimulationSettings() {
    return {
        maxDelay: 2048,
    };
}

