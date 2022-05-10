import type { Circuit } from "./models/circuit";
import type { ComponentDefinition } from "./models/component_definition";
import type { UserEvent } from "./models/user_event";
import init, { set_panic_hook, Simulation, Config, test_combinational, update_registry } from "digisim";
import type { VerificationData } from "./models/quest";
import type { ValidationReport } from "./models/component_validation";

export type WorkerAction = 'setCircuit' | 'start' | 'pause' | 'stop' | 'step' | 'insertUserEvent' | 'insertDefinitions' | 'verifyComponent';


export type VerifyComponentPayload = {
    definition: ComponentDefinition,
    verificationData: VerificationData
}

export type WorkerPayload = ComponentDefinition[] | Circuit | UserEvent | VerifyComponentPayload;

export type WorkerMessage = {
    id: number,
    action: WorkerAction,
    payload: WorkerPayload,
};

export type WorkerResponse = {
    id: number,
    err: string,
    action: 'circuitStateUpdate' | WorkerAction,
    payload: Map<number, any> | ValidationReport,
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
let unprocessedMessageQueue: WorkerMessage[] = [];

init().then(() => {
    set_panic_hook();

    simulation = Simulation.new(Config.new(1000));
    simulatorInitted = true;
    for (const msg of unprocessedMessageQueue) {
        processMessage(msg)
    }
    unprocessedMessageQueue = [];
});

declare var self: DedicatedWorkerGlobalScope;
export default onmessage = (msg: MessageEvent<WorkerMessage>) => {
    if (!simulatorInitted) {
        if (msg.data.action == 'insertDefinitions') {
            unprocessedMessageQueue.push(msg.data);
        }
        return
    }
    console.log("Received message in worker", msg);
    processMessage(msg.data);
}

function processMessage(msg: WorkerMessage) {
    const action = msg.action;
    switch (action) {
        case 'start':
            startSimulation(msg);
            break;
        case 'pause':
            pauseSimulation(msg);
            break;
        case 'stop':
            stopSimulation(msg);
            break;
        case 'step':
            stepSimulation(msg);
            break;
        case 'insertUserEvent':
            insertUserEvent(msg);
            break;
        case 'insertDefinitions':
            insertDefinitions(msg);
            break;
        case 'setCircuit':
            setCircuit(msg);
            break;
        case 'verifyComponent':
            verifyComponent(msg)
        default: break;
    }
}


function verifyComponent(msg: WorkerMessage) {
    const definition = (msg.payload as VerifyComponentPayload).definition;
    const verificationData = (msg.payload as VerifyComponentPayload).verificationData;
    if (verificationData.type == "Combinational") {
        const validationReport: ValidationReport = test_combinational(definition, verificationData.restrictions);
        console.log("Got validation report",validationReport.errors);
        const response: WorkerResponse = {
            id: msg.id,
            action: msg.action,
            payload: validationReport,
            err: undefined
        }
        postMessage(response)
    } else {
        console.log("Sequential verification not implemented yet");
    }
}

function setCircuit(msg: WorkerMessage) {
    const circuit = msg.payload as Circuit;
    console.log("Setting circuit", circuit);

    simulation.set_circuit(circuit);

    const response: WorkerResponse = {
        id: msg.id,
        action: msg.action,
        payload: undefined,
        err: undefined
    }
    postMessage(response);
}

function insertDefinitions(msg: WorkerMessage) {
    const defs = msg.payload as ComponentDefinition[];
    console.log("Inserting definitions into registry: ", defs);

    for (const def of defs) {
        update_registry(def);
    }

    const response: WorkerResponse = {
        id: msg.id,
        action: msg.action,
        payload: undefined,
        err: undefined
    }
    postMessage(response);
}

function startSimulation(msg: WorkerMessage) {
    console.log("Starting simulation");
    // Initialize the simulation only if the sim is stopped
    // Otherwise we resume loop from the paused state
    if (state == SimulationState.STOPPED) {
        simulation.init();
    }
    state = SimulationState.RUNNING;
    startTime = performance.now();
    simulate();

    const response: WorkerResponse = {
        id: msg.id,
        action: msg.action,
        payload: undefined,
        err: undefined,
    }

    postMessage(response);
}

function pauseSimulation(msg: WorkerMessage) {
    console.log("Pausing simulation");
    state = SimulationState.PAUSED;
    const response: WorkerResponse = {
        id: msg.id,
        action: msg.action,
        payload: undefined,
        err: undefined
    }
    postMessage(response);
}

function stopSimulation(msg: WorkerMessage) {
    console.log("Stopping simulation");
    state = SimulationState.STOPPED;
    const response: WorkerResponse = {
        id: msg.id,
        action: msg.action,
        payload: undefined,
        err: undefined
    };
    postMessage(response)

}

function stepSimulation(msg: WorkerMessage) {
    console.log("Stepping simulation");

    // Initialize simulation if not started
    if (state == SimulationState.STOPPED) {
        simulation.init();
    }

    state = SimulationState.PAUSED;
    simulation.tick();

    const circuitState = getCircuitState();
    console.log("Circuit state", circuitState);
    const stateMsg: WorkerResponse = {
        action: "circuitStateUpdate",
        payload: circuitState,
        err: undefined,
        id: undefined
    };

    const response: WorkerResponse = {
        id: msg.id,
        action: msg.action,
        payload: undefined,
        err: undefined,
    };

    postMessage(stateMsg);
    postMessage(response);

}

function insertUserEvent(msg: WorkerMessage) {
    const event = msg.payload as UserEvent;
    simulation.insert_input_event(event);
    const response: WorkerResponse = {
        id: msg.id,
        action: msg.action,
        payload: undefined,
        err: undefined,
    };

    postMessage(response);
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
                err: undefined,
                id: undefined,
            };
            postMessage(message)
        }
        simulate();
    }, 10);
}

function getCircuitState(): Map<number, any> {
    return new Map(Object.entries(simulation.circuit_state()).map(val => [parseInt(val[0]), val[1]]));
}   