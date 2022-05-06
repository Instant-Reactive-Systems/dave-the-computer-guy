import type { Circuit } from "./models/circuit";
import type { ComponentDefinition } from "./models/component_definition";
import type { UserEvent } from "./models/user_event";
import init, { set_panic_hook, Simulation, Config } from "digisim";

export type WorkerAction = 'setCircuit' | 'start' | 'pause' | 'stop' | 'step' | 'insertUserEvent' | 'insertDefinition';
export type WorkerPayload = ComponentDefinition | Circuit | UserEvent;

export type WorkerMessage = {
    action: WorkerAction,
    payload: WorkerPayload,
};

export type WorkerResponse = {
    action: 'circuitStateUpdate',
    payload: Map<number, any>,
};

enum SimulationState {
    STOPPED,
    PAUSED,
    RUNNING,
}

let simulatorInitted = false;
let simulation: Simulation | undefined = undefined;
let state: SimulationState = SimulationState.STOPPED;
let startTime: number;

init().then(() => {
    set_panic_hook();

    simulation = Simulation.new(Config.new(1000));
    simulatorInitted = true;
});

declare var self: DedicatedWorkerGlobalScope;
export default onmessage = (msg: MessageEvent<WorkerMessage>) => {
    if (!simulatorInitted) return;

    const action = msg.data.action;
    const payload = msg.data.payload;
    switch (action) {
        case 'start':
            startSimulation();
            break;
        case 'pause':
            pauseSimulation();
            break;
        case 'stop':
            stopSimulation();
            break;
        case 'step':
            stepSimulation();
            break;
        case 'insertUserEvent':
            insertUserEvent(payload as UserEvent);
            break;
        case 'insertDefinition':
            insertDefinition(payload as ComponentDefinition);
            break;
        case 'setCircuit':
            setCircuit(payload as Circuit);
            break;
        default: break;
    }
}

function setCircuit(circuit: Circuit) {
    console.log("Setting circuit", circuit);
    simulation.set_circuit(circuit);
}

function insertDefinition(definition: ComponentDefinition) {
    console.log("Inserting definition into registry", definition);
    simulation.update_registry(definition);
}

function startSimulation() {
    console.log("Starting simulation");
    // Initialize the simulation only if the sim is stopped
    // Otherwise we resume loop from the paused state
    if (state == SimulationState.STOPPED) {
        simulation.init();
    }
    state = SimulationState.RUNNING;
    startTime = performance.now();
    simulate();
}

function pauseSimulation() {
    console.log("Pausing simulation");
    state = SimulationState.PAUSED;
}

function stopSimulation() {
    console.log("Stopping simulation");
    state = SimulationState.STOPPED;
    const message: WorkerResponse = {
        action: "circuitStateUpdate",
        payload: null,
    };
    console.log("Clearing state", message)
    postMessage(message)

}

function stepSimulation() {
    console.log("Stepping simulation");

    // Initialize simulation if not started
    if (state == SimulationState.STOPPED) {
        simulation.init();
    }
    state = SimulationState.PAUSED;
    simulation.tick();

    const circuitState = getCircuitState();
    const message: WorkerResponse = {
        action: "circuitStateUpdate",
        payload: circuitState,
    };
    postMessage(message)
}

function insertUserEvent(event: UserEvent) {
    console.log("Inserting user event", event);
    simulation.insert_input_event(event);
}

function simulate() {
    setTimeout(() => {
        if (state != SimulationState.RUNNING) return;

        for (let i = 0; i < 10; ++i) {
            simulation.tick();
        }

        if (performance.now() - startTime > 50) {
            startTime = performance.now();
            const circuitState = getCircuitState();
            const message: WorkerResponse = {
                action: "circuitStateUpdate",
                payload: circuitState,
            };
            console.log("Sending state", message)
            postMessage(message)
        }
        simulate();
    }, 10);
}

function getCircuitState(): Map<number, any> {
    return new Map(Object.entries(simulation.circuit_state()).map(val => [parseInt(val[0]), val[1]]));
}

