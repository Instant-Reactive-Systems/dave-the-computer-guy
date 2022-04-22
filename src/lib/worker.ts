import type { Circuit } from "./models/circuit";
import type { ComponentDefinition } from "./models/component_definition";
import type { UserEvent } from "./models/user_event";
import * as wasm from "digisim";

export type WorkerMessage = {
    action: 'setCircuit' | 'startSimulation' | 'pauseSimulation' | 'stepSimulation' | 'insertUserEvent' | 'insertDefinition' | 'stopSimulation',
    payload: ComponentDefinition | Circuit | UserEvent
};

export type WorkerResponse = {
    action: 'circuitStateUpdate'
    payload: Map<number,any>
}

enum SimulationState {
    STOPPED,
    PAUSED,
    RUNNING,
}

const simulation: wasm.Simulation = wasm.Simulation.new(wasm.Config.new(1000));
let state: SimulationState = SimulationState.STOPPED;

declare var self: DedicatedWorkerGlobalScope;
export default onmessage = (msg: MessageEvent<WorkerMessage>) => {
    console.log("Message in worker",msg);
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

function setCircuit(circuit:Circuit) {
    console.log("Setting circuit");
    simulation.set_circuit(circuit);
}

function insertDefinition(definition: ComponentDefinition){
    console.log("Inserting definition");
    simulation.update_registry(definition);
}

function startSimulation() {
    console.log("Starting simulation");
    simulation.init();
    state = SimulationState.RUNNING;
}

function pauseSimulation() {
    console.log("Stoping simulation");
    state = SimulationState.PAUSED;
}

function stopSimulation(){
    console.log("Canceling simulation");
    state = SimulationState.STOPPED;
}

function stepSimulation() {
    console.log("Stepping simulation");
    simulation.tick();
}

function insertUserEvent(event: UserEvent) {
    console.log("Inserting user event");
    simulation.insert_input_event(event);
}

