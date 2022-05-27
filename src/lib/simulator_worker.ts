import type { Circuit } from "./models/circuit";
import type { ComponentDefinition } from "./models/component_definition";
import type { UserEvent } from "./models/user_event";
import { todo, assert, unreachable } from '$lib/util/common';
import init, { set_panic_hook, Simulation, Settings, test_combinational, update_registry } from "digisim";
import type { VerificationData } from "./models/quest";
import type { ValidationReport } from "./models/component_validation";
import { defaultSimulationSettings, type SimulationSettings } from "./models/simulation_settings";

export type WorkerAction = 'setCircuit' | 'setSettings' | 'start' | 'pause' | 'stop' | 'step' | 'insertUserEvent' | 'insertDefinitions' | 'verifyComponent';
export type WorkerResponseAction = 'circuitStateUpdate' | WorkerAction /*used for worker promises*/;

export type VerifyComponentPayload = {
    definition: ComponentDefinition,
    verificationData: VerificationData
}

export type WorkerPayload = ComponentDefinition[] | Circuit | UserEvent | VerifyComponentPayload | SimulationSettings;
export type WorkerResponsePayload = Map<number, any> | ValidationReport;

export type WorkerMessage = {
    id: number,
    action: WorkerAction,
    payload: WorkerPayload,
};

export type WorkerResponse = {
    id: number,
    err: string,
    action: WorkerResponseAction,
    payload: WorkerResponsePayload,
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

    const defaultSettings = defaultSimulationSettings();
    simulation = Simulation.new(Settings.new(defaultSettings.maxDelay));
    simulatorInitted = true;
    for (const msg of unprocessedMessageQueue) {
        processMessage(msg)
    }
    unprocessedMessageQueue = [];
});

declare var self: DedicatedWorkerGlobalScope;
export default onmessage = (msg: MessageEvent<WorkerMessage>) => {
    if (!simulatorInitted) {
        switch (msg.data.action) {
            case 'insertDefinitions':
            case 'setSettings': {
                unprocessedMessageQueue.push(msg.data);
                break;
            }
            default: break;
        }

        return;
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
        case 'setSettings':
            setSettings(msg);
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
        const result = test_combinational(definition, verificationData.restrictions);
        console.log("Got validation report", result);
        const validationReport: ValidationReport = {
            errors: result.errors,
            passed: result.errors.length == 0
        };
        const res = createResponse(msg, validationReport);
        postMessage(res);
    } else {
        console.log("Sequential verification not implemented yet");
    }
}

function setCircuit(msg: WorkerMessage) {
    const circuit = msg.payload as Circuit;
    console.log("Setting circuit", circuit);

    simulation.set_circuit(circuit);

    const res = createResponse(msg);
    postMessage(res);
}

function setSettings(msg: WorkerMessage) {
    const settings = msg.payload as SimulationSettings;
    console.log('Setting settings', settings);

    simulation.set_settings(settings);

    const res = createResponse(msg);
    postMessage(res);
}

function insertDefinitions(msg: WorkerMessage) {
    const defs = msg.payload as ComponentDefinition[];
    console.log("Inserting definitions into registry: ", defs);

    for (const def of defs) {
        update_registry(def);
    }

    const res = createResponse(msg);
    postMessage(res);
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

    const res = createResponse(msg);
    postMessage(res);
}

function pauseSimulation(msg: WorkerMessage) {
    console.log("Pausing simulation");
    state = SimulationState.PAUSED;

    const res = createResponse(msg);
    postMessage(res);
}

function stopSimulation(msg: WorkerMessage) {
    console.log("Stopping simulation");
    state = SimulationState.STOPPED;
    const stateMsg = createCircuitStateMessage(null);
    postMessage(stateMsg);
    const res = createResponse(msg);
    postMessage(res);
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

    const res = createResponse(msg);
    const stateMsg = createCircuitStateMessage(circuitState);

    postMessage(stateMsg);
    postMessage(res);
}

function insertUserEvent(msg: WorkerMessage) {
    const event = msg.payload as UserEvent;
    simulation.insert_input_event(event);

    const res = createResponse(msg);
    postMessage(res);
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
            const msg = createCircuitStateMessage(circuitState);
            postMessage(msg);
        }
        simulate();
    }, 10);
}

function getCircuitState(): Map<number, any> {
    return new Map(Object.entries(simulation.circuit_state()).map(val => [parseInt(val[0]), val[1]]));
}

function createResponse(msg: WorkerMessage, payload?: WorkerResponsePayload): WorkerResponse {
    return {
        id: msg.id,
        action: msg.action,
        payload,
        err: undefined,
    };
}

function createCircuitStateMessage(circuitState: Map<number, any>): WorkerResponse {
    return {
        action: 'circuitStateUpdate',
        payload: circuitState,
        id: undefined,
        err: undefined,
    };
}

