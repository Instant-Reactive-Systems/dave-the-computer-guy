export type ActionType = 'circuit-save' | 'circuit-load' | 'circuit-new' | 'circuit-switch' |
    'undo' | 'redo' | 'sim-start' | 'sim-resume' | 'sim-pause' | 'wire-delete' |
    'component-delete' | 'sim-stop' | 'sim-step' | 'sim-start-step' | 'component-new' |
    'component-move' | 'wire-new' | 'circuit-export' | 'circuit-export-cancel' |
    'circuit-tab-remove' | 'undo-empty' | 'redo-empty';

export type Action = {
    type: ActionType,
    data: any,
};

export function actionToString(action?: Action): string {
    if (action == null) return 'No action performed yet.';

    switch (action.type) {
        case 'circuit-save': return `Saved circuit '${action.data.name}'.`;
        case 'circuit-load': return `Loaded circuit '${action.data.name}'.`;
        case 'circuit-new': return `Created new circuit.`;
        case 'circuit-switch': return `Switched to circuit tab '${action.data.name}'.`;
        case 'circuit-export': return `Exported circuit as component '${action.data.name}'.`;
        case 'circuit-export-cancel': return `Cancelled exporting the circuit.`;
        case 'circuit-tab-remove': return `Removed circuit tab '${action.data.name}'.`;
        case 'undo': return `Undo'd an action.`;
        case 'undo-empty': return `Nothing to undo.`;
        case 'redo': return `Redo'd an action.`;
        case 'redo-empty': return `Nothing to redo.`;
        case 'sim-start': return `Started the simulation.`;
        case 'sim-resume': return `Resumed the simulation.`;
        case 'sim-pause': return `Paused the simulation.`;
        case 'sim-stop': return `Stopped the simulation.`;
        case 'sim-step': return `Stepped a tick in the simulation.`;
        case 'sim-start-step': return `Started the simulation and stepped a tick.`;
        case 'wire-new': return `Created a wire segment.`;
        case 'wire-delete': return `Deleted a wire segment.`;
        case 'component-new': return `Added component to circuit.`;
        case 'component-delete': return `Deleted component of ID #${action.data.id} from circuit.`;
        case 'component-move': return `Moved component to (x: ${action.data.x}, y: ${action.data.y}).`;
        default: {}
    }

    return '';
}

