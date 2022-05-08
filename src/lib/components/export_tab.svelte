<script lang="ts">
	import _ from 'lodash';
	import { circuitStore } from '$lib/stores/circuit';
	import { createEventDispatcher, getContext } from 'svelte';
	import type { Circuit } from '$lib/models/circuit';
	import type { ComponentRef } from '$lib/models/component_ref';
	import {
		CIRCUIT_BUILDER_SERVICE,
		COMPONENT_DEFINITION_LOADER_SERVICE
	} from '$lib/services/service';
	import type { ComponentDefinitionLoaderService } from '$lib/services/component_definition_loader_service';
	import ValidationErrorViewer from '$lib/components/overlays/simulator/validation_error_viewer.svelte';
	import type { TableEntry, Entry } from '$lib/models/entry';
	import { ValidationError, ValidationErrorType } from '$lib/models/validation_error';
	import type { Connector } from '$lib/models/connector';
	import { copy } from '$lib/util/common';
	import type { CircuitBuilderService } from '$lib/services/circuit_builder_serivce';
	import {
		defaultComponentDefinition,
		type ComponentDefinition
	} from '$lib/models/component_definition';

	const dispatch = createEventDispatcher();
	const defLoader: ComponentDefinitionLoaderService = getContext(
		COMPONENT_DEFINITION_LOADER_SERVICE
	);
	const circuitBuilder: CircuitBuilderService = getContext(CIRCUIT_BUILDER_SERVICE);
	const { open } = getContext('simple-modal');

	let name: string = '';
	let description: string = '';
	let outputEntries: TableEntry[] = [];
	let inputEntries: TableEntry[] = [];

	function defaultEntry(): TableEntry {
		return {
			pinName: '',
			pinPosition: 'left',
			componentId: '0',
			pinId: '0'
		};
	}

	function onExport() {
		const circuit = $circuitStore;
		circuitBuilder.deductConnections(circuit).then((circ) => {
			const mapEntries = (entry: TableEntry) => {
				return {
					pinName: entry.pinName,
					pinPosition: entry.pinPosition,
					componentId: Number.parseInt(entry.componentId),
					pinId: Number.parseInt(entry.pinId)
				};
			};

			type InsertedPin = {
				name: string;
				index: number;
			};

			const outs = outputEntries.map(mapEntries);
			const ins = inputEntries.map(mapEntries);
			let errors: ValidationError[] = [];
			let insertedPins: InsertedPin[] = [];
			let def = defaultComponentDefinition();
			def.name = name;
			def.description = description;
			def.circuit = circ;
			def.pinMapping = { input: [], output: [] };

			let i = 0;
			for (const entry of outs) {
				const componentRef = getComponent(circ, entry.componentId);
				if (componentRef == null) {
					const err = new ValidationError(
						ValidationErrorType.ComponentNotFound,
						`Component with id '${entry.componentId}' does not exist in the circuit. Recheck your ID.`,
						i,
						'output'
					);

					errors.push(err);
					i += 1;
					continue;
				}

				const componentDef = defLoader.getDefinition(componentRef.definitionId);
				if (!pinExists(componentDef, entry.pinId)) {
					const err = new ValidationError(
						ValidationErrorType.PinNotFound,
						`Pin with id '${entry.pinId}' does not exist in the component definition. Recheck your ID.`,
						i,
						'output'
					);

					errors.push(err);
					i += 1;
					continue;
				}

				if (!pinTypeMatches(componentDef, entry.pinId, false)) {
					const err = new ValidationError(
						ValidationErrorType.PinTypeMismatch,
						`Pin with id '${entry.pinId}' is not an output pin. You cannot connect an input pin to an output pin of a transparent component.`,
						i,
						'output'
					);

					errors.push(err);
					i += 1;
					continue;
				}

				const connector: Connector = { componentId: entry.componentId, pin: entry.pinId };
				const found = insertedPins.find((x) => entry.pinName == x.name);
				if (found == null) {
					const index = def.pins.output.length;
					def.pins.output.push(entry.pinName);
					def.pinMapping.output.push([connector]);
					insertedPins.push({ name: entry.pinName, index });
					addToPinLocationMapping(entry, def);
				} else {
					def.pinMapping.output[found.index].push(connector);
				}

				i += 1;
			}

			i = 0;
			for (const entry of ins) {
				const componentRef = getComponent(circ, entry.componentId);
				if (componentRef == null) {
					const err = new ValidationError(
						ValidationErrorType.ComponentNotFound,
						`Component with id '${entry.componentId}' does not exist in the circuit. Recheck your ID.`,
						i,
						'input'
					);

					errors.push(err);
					i += 1;
					continue;
				}

				const componentDef = defLoader.getDefinition(componentRef.definitionId);
				if (!pinExists(componentDef, entry.pinId)) {
					const err = new ValidationError(
						ValidationErrorType.PinNotFound,
						`Pin with id '${entry.pinId}' does not exist in the component definition. Recheck your ID.`,
						i,
						'input'
					);

					errors.push(err);
					i += 1;
					continue;
				}

				if (!pinTypeMatches(componentDef, entry.pinId, true)) {
					const err = new ValidationError(
						ValidationErrorType.PinTypeMismatch,
						`Pin with id '${entry.pinId}' is not an input pin. You cannot connect an output pin to an input pin of a transparent component.`,
						i,
						'input'
					);

					errors.push(err);
					i += 1;
					continue;
				}

				const connector: Connector = { componentId: entry.componentId, pin: entry.pinId };
				const found = insertedPins.find((x) => entry.pinName == x.name);
				if (found == null) {
					const index = def.pins.input.length;
					def.pins.input.push(entry.pinName);
					def.pinMapping.input.push([connector]);
					insertedPins.push({ name: entry.pinName, index });
					addToPinLocationMapping(entry, def);
				} else {
					def.pinMapping.input[found.index].push(connector);
				}

				i += 1;
			}

			if (errors.length != 0) {
				open(ValidationErrorViewer, { errors: errors });
				return;
			}

			dispatch('export', {
				definition: def
			});
		});
	}

	function onCancel() {
		dispatch('cancelExport');
	}

	function getComponent(circuit: Circuit, id: number): ComponentRef {
		return circuit.components.find((component) => component.id == id);
	}

	function pinExists(def: ComponentDefinition, id: number): boolean {
		return id >= 0 && id < def.pins.input.length + def.pins.output.length;
	}

	function pinTypeMatches(def: ComponentDefinition, id: number, input: boolean): boolean {
		if (input) {
			return id >= 0 && id < def.pins.input.length;
		} else {
			const mappedId = id - def.pins.input.length;
			return mappedId >= 0 && mappedId < def.pins.output.length;
		}
	}

	function addToPinLocationMapping(entry: Entry, def: ComponentDefinition) {
		switch (entry.pinPosition) {
			case 'left':
				def.metadata.pinLocationMapping.left.push({ name: entry.pinName, pin: entry.pinId });
				break;
			case 'right':
				def.metadata.pinLocationMapping.right.push({ name: entry.pinName, pin: entry.pinId });
				break;
			case 'top':
				def.metadata.pinLocationMapping.top.push({ name: entry.pinName, pin: entry.pinId });
				break;
			case 'bottom':
				def.metadata.pinLocationMapping.bottom.push({ name: entry.pinName, pin: entry.pinId });
				break;
		}
	}
</script>

<div class="wrapper">
	<header>
		<h1>Export circuit as component</h1>
	</header>
	<main>
		<section class="common">
			<div>
				<label>
					<span>Name:</span>
					<input on:keydown|stopPropagation placeholder="e.g. 'my component'" bind:value={name} />
				</label>
			</div>
			<div>
				<label>
					<span>Description:</span>
					<input
						on:keydown|stopPropagation
						placeholder="e.g. 'does stuff'"
						bind:value={description}
					/>
				</label>
			</div>
		</section>
		<section class="pins">
			<h2>Output pins</h2>
			<table>
				<thead>
					<tr>
						<td>Pin name</td>
						<td>Pin position</td>
						<td>Component ID</td>
						<td>Pin ID</td>
					</tr>
				</thead>
				<tbody>
					{#each outputEntries as entry (entry)}
						<tr class="non-empty-table">
							<td
								on:keydown|stopPropagation
								contenteditable="true"
								bind:innerHTML={entry.pinName}
							/>
							<td>
								<select bind:value={entry.pinPosition} class="pin-position">
									<option value="left">left</option>
									<option value="right">right</option>
									<option value="top">top</option>
									<option value="bottom">bottom</option>
								</select>
							</td>
							<td
								on:keydown|stopPropagation
								contenteditable="true"
								bind:innerHTML={entry.componentId}
							/>
							<td on:keydown|stopPropagation contenteditable="true" bind:innerHTML={entry.pinId} />
						</tr>
					{:else}
						<tr class="empty-table">
							<td colspan="4">No entries.</td>
						</tr>
					{/each}
				</tbody>
			</table>
			<ul class="button-row">
				<li>
					<button
						title="Add entry"
						on:click={() => (outputEntries = [...outputEntries, defaultEntry()])}>+</button
					>
				</li>
				<li>
					<button
						title="Remove entry"
						on:click={() => {
							outputEntries.pop();
							outputEntries = outputEntries;
						}}>-</button
					>
				</li>
			</ul>
		</section>
		<section class="pins">
			<h2>Input pins</h2>
			<table>
				<thead>
					<tr>
						<td>Pin name</td>
						<td>Pin position</td>
						<td>Component ID</td>
						<td>Pin ID</td>
					</tr>
				</thead>
				<tbody>
					{#each inputEntries as entry (entry)}
						<tr class="non-empty-table">
							<td
								on:keydown|stopPropagation
								contenteditable="true"
								bind:innerHTML={entry.pinName}
							/>
							<td>
								<select bind:value={entry.pinPosition} class="pin-position">
									<option value="left">left</option>
									<option value="right">right</option>
									<option value="top">top</option>
									<option value="bottom">bottom</option>
								</select>
							</td>
							<td
								on:keydown|stopPropagation
								contenteditable="true"
								bind:innerHTML={entry.componentId}
							/>
							<td on:keydown|stopPropagation contenteditable="true" bind:innerHTML={entry.pinId} />
						</tr>
					{:else}
						<tr class="empty-table">
							<td colspan="4">No entries.</td>
						</tr>
					{/each}
				</tbody>
			</table>
			<ul class="button-row">
				<li>
					<button
						title="Add entry"
						on:click={() => (inputEntries = [...inputEntries, defaultEntry()])}
						>+</button
					>
				</li>
				<li>
					<button
						title="Remove entry"
						on:click={() => {
							inputEntries.pop();
							inputEntries = inputEntries;
						}}>-</button
					>
				</li>
			</ul>
		</section>
		<section class="export-buttons">
			<ul class="button-row">
				<li>
					<button on:click={onCancel}>Cancel</button>
				</li>
				<li>
					<button on:click={onExport}>Export</button>
				</li>
			</ul>
		</section>
	</main>
</div>

<style>
	.wrapper {
		@apply mx-2 py-2 h-full overflow-y-auto;
	}

	main {
		@apply space-y-4;
	}

	header {
		@apply text-xl font-bold pb-2 mb-4 border-b border-slate-300;
	}

	h2 {
		@apply text-lg font-bold;
	}

	.common {
		@apply space-y-2;
	}

	.common > div > label {
		@apply space-x-2;
	}

	.common > div > label > input {
		@apply border-b border-slate-300;
	}

	section {
		@apply space-y-2;
	}

	.pins > table {
		@apply w-full border-collapse table-fixed border border-slate-300;
	}

	.pins > table > thead {
		@apply text-center font-medium border-b border-slate-300;
	}

	.pins > .non-empty-table > tbody tr {
		@apply border-b border-slate-200;
	}

	.pins > table td:not(:last-child) {
		@apply border-r border-slate-200;
	}

	.pins > .non-empty-table > tbody td {
		@apply px-2;
	}

	.button-row {
		@apply space-x-2 flex;
	}

	.button-row > li {
		@apply flex-1 text-center border border-blue-400 rounded-sm hover:bg-blue-400 hover:text-white;
	}

	.button-row > li > button {
		@apply w-full;
	}

	.export-buttons > ul {
		@apply mt-8;
	}

	.empty-table > td {
		@apply w-full text-center;
	}

	.pin-position {
		@apply w-full appearance-none bg-transparent;
	}
</style>
