import _ from "lodash";
import type { WiringRenderingEntry, Circuit } from "./models/circuit";
import type { Connection } from "./models/connection";
import type { Connector } from "./models/connector";
import type { ConnectorLink, Wire } from "./models/wire";


declare var self: DedicatedWorkerGlobalScope;


export type WorkerMessage = {
    id: number;
    action: 'deductConnections';
    payload: Circuit;
};

export type WorkerResponse = {
    action: 'deductConnections';
    id: number;
    payload: Circuit;
    err: string;
};

export default onmessage = (msg: MessageEvent<WorkerMessage>) => {
    const { id, action, payload } = msg.data;
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



function findWiresConnectedToOutputConnectors(wires: Wire[]): [Wire, Connector[]][] {
    const wiresWithOutputConnectors: [Wire, Connector[]][] = [];
    for (const wire of wires) {
        const outputConnectors: Connector[] = wire.links
            .filter((link) => link.type == 'pin' && (link.value as ConnectorLink).type == 'output')
            .map((link) => (link.value as ConnectorLink).conn);
        if (outputConnectors.length != 0) {
            wiresWithOutputConnectors.push([wire, outputConnectors]);
        }
    }
    return wiresWithOutputConnectors;
}

function addWiringRenderingData(circuit: Circuit, conn: Connector, connectedWireIds: Set<number>,) {
    const entry: WiringRenderingEntry = {
        wires: [],
        connectors: [],
        junctions: []
    };
    const wires = circuit.metadata.rendering.wires;

    entry.wires = Array.from(connectedWireIds);
    entry.connectors = [...new Set(Array.from(connectedWireIds)
        .map(id => wires[id])
        .flatMap(wire => {
            return wire.links
                .filter(link => link.type == "pin")
                .map(link => (link.value as ConnectorLink).conn)
        })
        .filter(conn => conn != undefined)
    )]

    entry.junctions = circuit.metadata.rendering.junctions.filter(junction => connectedWireIds.has(junction.sourceWire));
    circuit.metadata.rendering.wiringRendering.set(`${conn.componentId}-${conn.pin}`, entry)

}

function deductConnectionsFromWires(circuit: Circuit): Circuit {
    const start = performance.now();

    circuit.metadata.rendering.wiringRendering = new Map();
    circuit.connections = [];

    const wires = circuit.metadata.rendering.wires;

    // First we find all the wires directly linked to output connectors
    const wiresWithOutputConnectors = findWiresConnectedToOutputConnectors(wires);


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

        const conn = wireOutpinPinsTuple[1][0];

        //Add entry to wiring rendering data, used for wire state rendering
        addWiringRenderingData(circuit, conn,ignoreIdSet)

    }

    const end = performance.now();
    console.log(`Deducting connections takes ${end - start}ms`);
    
    return circuit;
}



function findAllConnectedInputConnectors(circuit: Circuit, wire: Wire, idsToIgnore: Set<number>): Connector[] {
    const connectors: Connector[] = [];

    //find all wires that this wire is connected to directly from itself

    for (const link of wire.links) {
        if (link.type == 'pin' && (link.value as ConnectorLink).type == 'input') {
            connectors.push((link.value as ConnectorLink).conn);
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


    //find all wires that connect directly to this wire

    const linkedWireIds = circuit.metadata.rendering.wires
        .filter((w) => w.links.some((link) => link.value == wire.id) && !idsToIgnore.has(w.id))
        .map((w) => w.id);
    linkedWireIds.forEach((id) => idsToIgnore.add(id));

    //find all wires which are indirectly connected to this wire
    for (const linkedWireId of linkedWireIds) {
        const linkedWire = circuit.metadata.rendering.wires[linkedWireId];
        connectors.push(...findAllConnectedInputConnectors(circuit, linkedWire, idsToIgnore));
    }


    const uniq = _.uniq(connectors);

    return uniq;
}

