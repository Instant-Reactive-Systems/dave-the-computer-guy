import type { Circuit } from "./models/circuit";
import type { ComponentDefinition } from "./models/component_definition";
import type { UserEvent } from "./models/user_event";
import init, { set_panic_hook, Simulation, Config } from "digisim";

export type WorkerMessage = {
    action: 'setCircuit' | 'startSimulation' | 'pauseSimulation' | 'stepSimulation' |
    'insertUserEvent' | 'insertDefinition' | 'stopSimulation',
    payload: ComponentDefinition | Circuit | UserEvent
};

export type WorkerResponse = {
    action: 'circuitStateUpdate'
    payload: Map<number, any>
}

enum SimulationState {
    STOPPED,
    PAUSED,
    RUNNING,
}

let simulatorInitted = false;
let simulation: Simulation | undefined = undefined;
let state: SimulationState = SimulationState.STOPPED;
let simulationInitted;
let startTime;

init().then(() => {
    set_panic_hook();

    simulation = Simulation.new(Config.new(1000));
    simulatorInitted = true;
});

declare var self: DedicatedWorkerGlobalScope;
export default onmessage = (msg: MessageEvent<WorkerMessage>) => {
    if (!simulatorInitted) {
        console.error('Tried to send a message to non initted digisim WASM simulator.');
        return;
    }

    const action = msg.data.action;
    const payload = msg.data.payload;
    switch (action) {
        case "setCircuit":
            setCircuit(payload as Circuit);
            break;
        case "startSimulation":
            startSimulation();
            break;
        case "pauseSimulation":
            pauseSimulation();
            break;
        case "stopSimulation":
            stopSimulation();
            break;
        case "stepSimulation":
            stepSimulation();
            break;
        case "insertUserEvent":
            insertUserEvent(payload as UserEvent);
            break;
        case "insertDefinition":
            insertDefinition(payload as ComponentDefinition);
    }
}

function setCircuit(circuit: Circuit) {
    simulationInitted = false;
    console.log("Setting circuit", circuit);
    simulation.set_circuit(circuit);
}

function insertDefinition(definition: ComponentDefinition) {
    console.log("Inserting definition into registry", definition);
    simulation.update_registry(definition);
}

function startSimulation() {
    console.log("Starting simulation");
    simulation.init();
    simulationInitted = true;
    state = SimulationState.RUNNING;
    startTime = performance.now();
    simulate();

}


function simulate() {

    setTimeout(() => {
        if (state != SimulationState.RUNNING) return;

        for (let i = 0; i < 10; ++i) {
            simulation.tick();
        }

        if (performance.now() - startTime > 50) {
            startTime = performance.now();
            const circuitState = new Map(Object.entries(simulation.circuit_state())
                .map(val => [parseInt(val[0]), val[1]]));   
            const message: WorkerResponse = {
                action: "circuitStateUpdate",
                payload: circuitState
            }
            console.log("Sending state",message)
            postMessage(message)
        }
        simulate();
    }, 10);
}

function pauseSimulation() {
    console.log("Pausing simulation");
    state = SimulationState.PAUSED;
}

function stopSimulation() {
    console.log("Stopping simulation");
    state = SimulationState.STOPPED;
    simulationInitted = false;
}

function stepSimulation() {
    console.log("Stepping simulation");
    if (!simulationInitted) {
        simulation.init();
        simulationInitted = true;
    }
    simulation.tick();
    const circuitState = new Map(Object.entries(simulation.circuit_state())
        .map(val => [parseInt(val[0]), val[1]]));
    const message: WorkerResponse = {
        action: "circuitStateUpdate",
        payload: circuitState
    }
    postMessage(message)


}

function insertUserEvent(event: UserEvent) {
    console.log("Inserting user event", event);
    simulation.insert_input_event(event);
}

