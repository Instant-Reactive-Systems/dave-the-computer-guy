


export type WorkerMessage = {
    action: 'setCircuit' | 'startSimulation' | 'stopSimulation' | 'stepSimulation' | 'modifyCircuitState' | 'insertDefinition' | 'cancelSimulation',
    payload: ComponentDefinition | Circuit | InputComponentEvent
};

export type WorkerResponse = {
    action: 'circuitStateUpdate'
    payload: CircuitState
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
        case "modifyCircuitState":
            modifyCircuitState(payload as InputComponentEvent);
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

function measureFrequency() {
    console.log("Measuring frequency");
}

function startSimulation() {
    console.log("Starting simulation");
}


function stopSimulation() {
    console.log("Stoping simulation");
}

function cancelSimulation(){
    
}

function stepSimulation() {
    console.log("Stepping simulation");
}

function modifyCircuitState(InputComponentEvent: InputComponentEvent) {
    console.log("Modifying circuit state");
}

