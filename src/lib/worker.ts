import type { Circuit } from "./models/circuit";
import type { ComponentDefinition } from "./models/component_definition";
import type { UserEvent } from "./models/user_event";
import init, {set_panic_hook, Simulation, Config} from "digisim";

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

let initted = false;
let simulation: Simulation | undefined = undefined;
let state: SimulationState = SimulationState.STOPPED;

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
    circuit.description = "";
    circuit.params = undefined;
    console.log(`circuit definition:\n`, circuit);
    simulation.set_circuit(circuit);
}

function insertDefinition(definition: ComponentDefinition){
    console.log("Inserting definition");
    simulation.update_registry(definition);
}

function startSimulation() {
    console.log("Starting simulation");
    simulation.init();
    console.log('After init');
    state = SimulationState.RUNNING;

    while (state == SimulationState.RUNNING) {
        console.log('Outside setTimeout');
        setTimeout(() => {
            console.log('Called setTimeout tick');
            for (let i = 0; i < 100; ++i) {
                stepSimulation();
            }

            const circuitState = simulation!.circuit_state();
            console.log(circuitState);
        }, 10);
    }
}

function pauseSimulation() {
    console.log("Pausing simulation");
    state = SimulationState.PAUSED;
}

function stopSimulation(){
    console.log("Stopping simulation");
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

