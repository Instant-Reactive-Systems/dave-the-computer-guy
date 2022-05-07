import _ from "lodash";
import type { WiringRenderingEntry, Circuit } from "./models/circuit";
import type { Connection } from "./models/connection";
import type { Connector } from "./models/connector";
import type { DirectLink, Wire } from "./models/wire";


declare var self: DedicatedWorkerGlobalScope;


export type WorkerMessage = {
    id: number,
    action: 'deductConnections',
    payload: Circuit,
};

export type WorkerResponse = {
    action: 'deductConnections'
    id: number,
    payload: Circuit,
    err: string
}

export default onmessage = (msg: MessageEvent<WorkerMessage>) => {
    const action = msg.data.action;
    const id = msg.data.id;
    const payload = msg.data.payload;
    switch (action) {
        case "deductConnections":
            const rebuiltCircuit = deductConnectionsFromWires(payload as Circuit);
            const resp: WorkerResponse = {
                id: id,
                action: 'deductConnections',
                payload: rebuiltCircuit,
                err: null
            };
            postMessage(resp)
            break;
    }
}

function deductConnectionsFromWires(circuit: Circuit): Circuit {
    circuit.metadata.rendering.wiringRendering = new Map();
    const start = performance.now();
    circuit.connections = [];
    const wires = circuit.metadata.rendering.wires;
    //find wires that are connected to output pins

    const wiresWithOutputConnectors = [];
    for (const wire of wires) {
        const outputConnectors: DirectLink[] = wire.links
            .filter((link) => link.type == 'pin' && (link.value as any).type == 'output')
            .map((link) => (link.value as any).conn);
        if (outputConnectors.length != 0) {
            wiresWithOutputConnectors.push([wire, outputConnectors]);
        }
    }

    for (const wireOutpinPinsTuple of wiresWithOutputConnectors) {
        const wire = wireOutpinPinsTuple[0] as Wire;
        const outputConnectors = wireOutpinPinsTuple[1];
        const ignoreIdSet: Set<number> = new Set();
        ignoreIdSet.add(wire.id);
        const inputConnectors = findAllConnectedInputConnectors(circuit, wire, ignoreIdSet);
        for (const connector of outputConnectors) {
            let connection = circuit.connections.find((conn) => _.isEqual(connector, conn.from));
            if (connection == undefined) {
                const connection: Connection = {
                    from: connector,
                    to: [...inputConnectors]
                }
                circuit.connections.push(connection);
            } else {
                connection.to = _.uniq([...connection.to, ...inputConnectors]);
            }
        }

        const entry:WiringRenderingEntry = {
            wires: [],
            connectors: [],
            junctions: []
        } 
        const conn = wireOutpinPinsTuple[1][0];
        entry.wires = Array.from(ignoreIdSet);
        entry.connectors = [...new Set(Array.from(ignoreIdSet)
            .map(id => wires[id])
            .flatMap(wire => 
                wire.links
                .filter(link => link.type == "pin")
                .map(link => (link.value as any).conn as Connector)
            )
            .filter(conn => conn != undefined)
        )]

        entry.junctions = circuit.metadata.rendering.junctions.filter(junction => ignoreIdSet.has(junction.sourceWire));
        console.log("Entry is",entry);        
        circuit.metadata.rendering.wiringRendering.set(JSON.stringify(conn), entry)
    }
    const end = performance.now();

    console.log(`Deducting connections takes ${end - start}ms`);
    return circuit;
}



function findAllConnectedInputConnectors(circuit: Circuit, wire: Wire, idsToIgnore: Set<number>): Connector[] {
    console.log('Called');
    const connectors: Connector[] = [];
    console.log('Ids to ignore', idsToIgnore);

    //find all wires or pins this component is connected to
    let start = performance.now();

    for (const link of wire.links) {
        if (link.type == 'pin' && (link.value as any).type == 'input') {
            connectors.push((link.value as any).conn);
        } else if (link.type == 'wire' && !idsToIgnore.has(link.value as number)) {
            idsToIgnore.add(link.value as number);
            connectors.push(
                ...findAllConnectedInputConnectors(
                    circuit,
                    circuit.metadata.rendering.wires[link.value as number],
                    idsToIgnore
                )
            );
        }
    }


    start = performance.now();
    const linkedWireIds = (circuit.metadata.rendering.wires as Wire[])
        .filter((w) => w.links.some((link) => link.value == wire.id) && !idsToIgnore.has(w.id))
        .map((w) => w.id);
    linkedWireIds.forEach((id) => idsToIgnore.add(id as number));

    //find all wires which are connected to this wire
    for (const linkedWireId of linkedWireIds) {
        const linkedWire = circuit.metadata.rendering.wires[linkedWireId as number];
        connectors.push(...findAllConnectedInputConnectors(circuit, linkedWire, idsToIgnore));
    }


    const uniq = _.uniq(connectors);

    return uniq;
}

