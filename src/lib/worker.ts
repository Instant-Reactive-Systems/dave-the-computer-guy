import type { Circuit } from "./models/circuit";
import type { ComponentDefinition } from "./models/component_definition";
import type { UserEvent } from "./models/user_event";
import init, { set_panic_hook, Simulation, Config } from "digisim";
import { circuitStateStore } from "./stores/circuit_state";

export type WorkerMessage = {
    action: 'setCircuit' | 'startSimulation' | 'pauseSimulation' | 'stepSimulation' | 'insertUserEvent' | 'insertDefinition' | 'stopSimulation',
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

let initted = false;
let simulation: Simulation | undefined = undefined;
let state: SimulationState = SimulationState.STOPPED;
let simulationInitted;

init().then(() => {
    set_panic_hook();

    simulation = Simulation.new(Config.new(1000));
    initted = true;
});

declare var self: DedicatedWorkerGlobalScope;
export default onmessage = (msg: MessageEvent<WorkerMessage>) => {
    if (!initted) {
        console.log('Tried to send a message to a not-initted wasm package.');
        return;
    }
    console.log("Message in worker", msg);
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
    console.log("Setting circuit");
    circuit.description = "";
    circuit.params = undefined;
    console.log(`circuit definition:\n`, circuit);
    simulation.set_circuit(circuit);
}

function insertDefinition(definition: ComponentDefinition) {
    console.log("Inserting definition");
    simulation.update_registry(definition);
}

function startSimulation() {
    simulationInitted = true;
    console.log("Starting simulation.");
    simulation.init();
    state = SimulationState.RUNNING;
    simulate();

}

function simulate() {
    setTimeout(() => {
        if (state != SimulationState.RUNNING) return;

        for (let i = 0; i < 100; ++i) {
            simulation.tick();
        }

        const circuitState = new Map(Object.entries(simulation.circuit_state())
            .map(val => [parseInt(val[0]), val[1]]));
        const message: WorkerResponse = {
            action: "circuitStateUpdate",
            payload: circuitState
        }
        postMessage(message)
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
}

function stepSimulation() {
    if (!simulationInitted) {
        simulation.init();
        simulationInitted = true;
    }
    console.log("Stepping simulation");
    simulation.tick();
    console.log("Sim state step", simulation.circuit_state())
    const circuitState = new Map(Object.entries(simulation.circuit_state())
        .map(val => [parseInt(val[0]), val[1]]));
    const message: WorkerResponse = {
        action: "circuitStateUpdate",
        payload: circuitState
    }
    postMessage(message)


}

function insertUserEvent(event: UserEvent) {
    console.log("Updating state",event);
    simulation.insert_input_event(event);
}

