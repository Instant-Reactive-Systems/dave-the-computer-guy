import type { Circuit } from "./models/circuit";
import type { ComponentDefinition } from "./models/component_definition";
import type { UserEvent } from "./models/user_event";



export type WorkerMessage = {
    action: 'setCircuit' | 'startSimulation' | 'stopSimulation' | 'stepSimulation' | 'insertUserEvent' | 'insertDefinition' | 'cancelSimulation',
    payload: ComponentDefinition | Circuit | UserEvent
};

export type WorkerResponse = {
    action: 'circuitStateUpdate'
    payload: Map<number,any>
}





declare var self: DedicatedWorkerGlobalScope;
export default onmessage = (msg: MessageEvent<WorkerMessage>) => {
    const action = msg.data.action;
    const payload = msg.data.payload;
    switch (action) {
        case "setCircuit":
            setCircuit(payload as Circuit);
            break;
        case "startSimulation":
            startSimulation();
            break;
        case "stopSimulation":
            stopSimulation();
            break;
        case "cancelSimulation":
            cancelSimulation();
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
}

function insertDefinition(definition: ComponentDefinition){
    console.log("Inserting definition");
}



function startSimulation() {
    console.log("Starting simulation");
}


function stopSimulation() {
    console.log("Stoping simulation");
}

function cancelSimulation(){
    console.log("Canceling simulation");
}

function stepSimulation() {
    console.log("Stepping simulation");
}

function insertUserEvent(event:UserEvent) {
    console.log("Inserting user event");
}

