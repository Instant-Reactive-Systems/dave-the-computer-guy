import * as wasm from './digisim_bg.wasm';

const heap = new Array(32).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 36) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

const lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;

let cachedTextDecoder = new lTextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachegetUint8Memory0 = null;
function getUint8Memory0() {
    if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

let WASM_VECTOR_LEN = 0;

const lTextEncoder = typeof TextEncoder === 'undefined' ? (0, module.require)('util').TextEncoder : TextEncoder;

let cachedTextEncoder = new lTextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length);
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len);

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3);
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachegetInt32Memory0 = null;
function getInt32Memory0() {
    if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== wasm.memory.buffer) {
        cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachegetInt32Memory0;
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
    return instance.ptr;
}
/**
*/
export class Config {

    static __wrap(ptr) {
        const obj = Object.create(Config.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_config_free(ptr);
    }
    /**
    */
    get max_delay() {
        const ret = wasm.__wbg_get_config_max_delay(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set max_delay(arg0) {
        wasm.__wbg_set_config_max_delay(this.ptr, arg0);
    }
    /**
    * @param {number} max_delay
    * @returns {Config}
    */
    static new(max_delay) {
        const ret = wasm.config_new(max_delay);
        return Config.__wrap(ret);
    }
}
/**
* Simulation context
*
* A single tick does not necessarily correspond to a single time unit.
*/
export class Simulation {

    static __wrap(ptr) {
        const obj = Object.create(Simulation.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_simulation_free(ptr);
    }
    /**
    * Create a new simulation context.
    * @param {Config} config
    * @returns {Simulation}
    */
    static new(config) {
        _assertClass(config, Config);
        var ptr0 = config.ptr;
        config.ptr = 0;
        const ret = wasm.simulation_new(ptr0);
        return Simulation.__wrap(ret);
    }
    /**
    * Processes the timing wheel.
    */
    tick() {
        wasm.simulation_tick(this.ptr);
    }
    /**
    * Initializes the simulation by inserting events from source components.
    */
    init() {
        wasm.simulation_init(this.ptr);
    }
    /**
    * Returns a JSON object containing the circuit state.
    * @returns {any}
    */
    circuit_state() {
        const ret = wasm.simulation_circuit_state(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {any} circuit
    */
    set_circuit(circuit) {
        wasm.simulation_set_circuit(this.ptr, addHeapObject(circuit));
    }
    /**
    * @param {any} registry
    */
    set_registry(registry) {
        wasm.simulation_set_registry(this.ptr, addHeapObject(registry));
    }
    /**
    * @param {any} definition
    */
    update_registry(definition) {
        wasm.simulation_update_registry(this.ptr, addHeapObject(definition));
    }
    /**
    * @param {any} event
    */
    insert_input_event(event) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.simulation_insert_input_event(retptr, this.ptr, addHeapObject(event));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

export function __wbindgen_object_drop_ref(arg0) {
    takeObject(arg0);
};

export function __wbindgen_string_new(arg0, arg1) {
    const ret = getStringFromWasm0(arg0, arg1);
    return addHeapObject(ret);
};

export function __wbindgen_json_parse(arg0, arg1) {
    const ret = JSON.parse(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
};

export function __wbindgen_json_serialize(arg0, arg1) {
    const obj = getObject(arg1);
    const ret = JSON.stringify(obj === undefined ? null : obj);
    const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

export function __wbindgen_throw(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

