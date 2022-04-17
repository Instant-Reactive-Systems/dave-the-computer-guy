/* tslint:disable */
/* eslint-disable */
/**
*/
export class Config {
  free(): void;
/**
* @param {number} max_delay
* @returns {Config}
*/
  static new(max_delay: number): Config;
/**
*/
  max_delay: number;
}
/**
* Simulation context
*
* A single tick does not necessarily correspond to a single time unit.
*/
export class Simulation {
  free(): void;
/**
* Create a new simulation context.
* @param {Config} config
* @returns {Simulation}
*/
  static new(config: Config): Simulation;
/**
* Processes the timing wheel.
*/
  tick(): void;
/**
* Initializes the simulation by inserting events from source components.
*/
  init(): void;
/**
* Returns a JSON object containing the circuit state.
* @returns {any}
*/
  circuit_state(): any;
/**
* @param {any} circuit
*/
  set_circuit(circuit: any): void;
/**
* @param {any} registry
*/
  set_registry(registry: any): void;
/**
* @param {any} definition
*/
  update_registry(definition: any): void;
/**
* @param {any} event
*/
  insert_input_event(event: any): void;
}
