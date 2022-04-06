<script lang="ts">
    import { onMount } from "svelte";
    import { fabric } from "fabric";
    import {circuit as circuitStore}   from '$lib/stores/circuit'
    import {circuitState as circuitStateStore} from '$lib/stores/circuit_state'
    import { createEventDispatcher } from "svelte";
    import { CircuitModification } from "$lib/models/circuit_actions";
    import ELK from "elkjs/lib/elk-api.js";
    import { CircuitState } from "$lib/models/circuit_state";
    import { Circuit } from "$lib/models/circuit";
    import { ComponentDefinition } from "$lib/models/component_definition";
    import { Connection } from "$lib/models/connection";
    import { Grid } from "$lib/digisim/rendering/grid";
    import Scene from "svelthree/src/components/Scene.svelte";
    import { Component } from "$lib/digisim/rendering/component";
    import { dataset_dev, object_without_properties } from "svelte/internal";
    import { map } from "rxjs";

    let circuit = $circuitStore;
    let circuitState = $circuitStateStore
    let definitionMap: Map<number, ComponentDefinition> = null;
    let connections: Connection[] = null;
    let components = null;
    let drawingWire = false;
    let currentWireSegmentX = null;
    let currentWireSegmentY = null;
    let currentSegment = null;
    let savedSegments = [];
    let segmentMap: Map<string, fabric.Line[]> = new Map();
    $: {
        console.log("Triggered");
        console.log(circuitPayload);
        console.log(canvas);
        if (canvas != undefined && circuitPayload != undefined) {
            console.log("Here");
            circuit = circuitPayload.circuit;
            definitionMap = circuitPayload.definitions;
            connections = circuit.connections;
            components = circuit.components;
        }
    }
    let canvas: fabric.Canvas;
    let canvasElement;

    const dispatch = createEventDispatcher();

    onMount(() => {
        prepareCanvas();
        renderCircuit();
        return () => {
            canvas.dispose();
        };
    });

    function onComponentSelected(componentID: number) {
        dispatch("componentClicked", { componentID: componentID });
    }

    function onComponentDoubleClicked(componentID: number) {
        dispatch("componentDoubleClicked", { componentID: componentID });
    }

    function onComponentRightClicked(componentID: number) {
        //show tooltip for doing various actions on component
    }

    function onCircuitModified(modification: CircuitModification) {
        dispatch("circuitModified", { modification: modification });
    }

    function renderCircuit() {
        let component = new Component(200, 100, 1, {
            id: 1,
            name: "random",
            description: "blabal",
            type: "combinational",
            pins: {
                input: [1, 0],
                output: [1, 1],
            },
            pinLocationMapping: {
                top: ["G"],
                left: ["A", "B", "C"],
                right: ["D", "E", "F"],
                bottom: ["M"],
            },
        });

        let component1 = new Component(400, 300, 1, {
            id: 2,
            name: "random",
            description: "blabal",
            type: "combinational",
            pins: {
                input: [1, 0],
                output: [1, 1],
            },
            pinLocationMapping: {
                top: ["G"],
                left: ["A", "B", "C"],
                right: ["D", "E", "F"],
                bottom: ["M"],
            },
        });

        canvas.add(component.buildFabricComponent());
        canvas.add(component1.buildFabricComponent());
        canvas.requestRenderAll();
    }

    function resizeCanvas() {
        const parent = document.getElementById("canvas-wrapper");

        const containerWidth = parent.clientWidth;
        const containerHeight = parent.clientHeight;

        // const scale = containerWidth / canvas.getWidth();
        // const zoom  = canvas.getZoom() * scale;
        canvas.setDimensions({
            width: containerWidth,
            height: containerHeight,
        });
        // canvas.setViewportTransform([zoom, 0, 0, zoom, 0, 0]);
    }

    function prepareCanvas(): void {
        canvas = new fabric.Canvas(canvasElement);

        canvas.on("mouse:wheel", (opt) => {
            var delta = opt.e.deltaY;
            var zoom = canvas.getZoom();
            zoom *= 0.999 ** delta;
            if (zoom > 20) zoom = 20;
            if (zoom < 0.01) zoom = 0.01;
            canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
            opt.e.preventDefault();
            opt.e.stopPropagation();
        });

        canvas.on("mouse:down", (opt) => {
            console.log(opt);
            console.log("Objects:");

            if (opt.e.altKey === true) {
                canvas.isDragging = true;
                canvas.selection = false;
                canvas.lastPosX = opt.e.clientX;
                canvas.lastPosY = opt.e.clientY;
            }
            if (
                opt.subTargets[0] != undefined &&
                opt.subTargets[0].data != undefined &&
                opt.subTargets[0].data.type == "pin" &&
                !drawingWire
            ) {
                console.log("Started drawing wire");
                canvas.getObjects("component").forEach((obj) => {
                    obj.selectable = false;
                    console.log("Removing ", obj);
                    obj.lockMovementX = true;
                    obj.lockMovementY = true;
                });

                let matrix = (opt.subTargets[0] as fabric.Group)
                    .item(2)
                    .calcTransformMatrix();
                let x = matrix[4]; // translation in X
                let y = matrix[5];
                currentWireSegmentX = x;
                currentWireSegmentY = y;
                drawingWire = true;
                savedSegments = [];
            } else if (
                drawingWire &&
                currentSegment != null &&
                opt.subTargets != undefined &&
                opt.subTargets.length == 0
            ) {
                console.log("Saved");
                savedSegments.push(currentSegment);
                currentWireSegmentX = currentSegment.data[2];
                currentWireSegmentY = currentSegment.data[3];
                currentSegment = null;
            } else if (
                drawingWire &&
                currentSegment != null &&
                opt.subTargets[0].data.type == "pin"
            ) {
                console.log("triggered the wire end handler");
                let matrix = (opt.subTargets[0] as fabric.Group)
                    .item(2)
                    .calcTransformMatrix();
                let x = matrix[4]; // translation in X
                let y = matrix[5];
                canvas.remove(currentSegment);
                currentSegment = new fabric.Line(
                    [currentWireSegmentX, currentWireSegmentY, x, y],
                    {
                        stroke: "black",
                        strokeWidth: 2,
                        hasControls: false,
                        selectable: false,
                        data: [currentWireSegmentX, currentWireSegmentY, x, y],
                        type: "wire",
                    }
                );
                savedSegments.push(currentSegment);
                makeConnectionFromSavedSegments();
                canvas.add(currentSegment);
                currentSegment = null;
                drawingWire = false;
                canvas.getObjects("component").forEach((obj) => {
                    obj.selectable = true;
                    console.log("Removing ", obj);
                    obj.lockMovementX = false;
                    obj.lockMovementY = false;
                });
                console.log("Group", opt.subTargets[0] as fabric.Group);
                let pin = (opt.subTargets[0] as fabric.Group).data.value;
                let component = (opt.subTargets[0] as fabric.Group).data
                    .component;
                segmentMap.set(`${component}-${pin}`, savedSegments);
                savedSegments = [];
            }
        });

        function makeConnectionFromSavedSegments() {}

        document.onkeydown = function (e) {
            console.log("key:" + e.key);
            switch (e.key) {
                case "z":
                    console.log("triggered");
                    if (e.ctrlKey) {
                        canvas.getObjects("wire").forEach((wire) => {
                            canvas.remove(wire);
                        });
                        canvas.requestRenderAll();
                        drawingWire = false;
                        currentSegment = null;
                        canvas.getObjects("component").forEach((obj) => {
                            obj.selectable = false;
                            console.log("Removing ", obj);
                            obj.lockMovementX = true;
                            obj.lockMovementY = true;
                        });
                    }
                    break;
            }
        };

        canvas.on("mouse:move", (opt) => {
            if (canvas.isDragging) {
                canvas.viewportTransform[4] += opt.e.clientX - canvas.lastPosX;
                canvas.viewportTransform[5] += opt.e.clientY - canvas.lastPosY;
                canvas.requestRenderAll();
                canvas.lastPosX = opt.e.clientX;
                canvas.lastPosY = opt.e.clientY;
            } else if (drawingWire == true) {
                if (currentSegment != null) {
                    canvas.remove(currentSegment);
                }
                let x = currentWireSegmentX;
                let y = currentWireSegmentY;
                if (
                    Math.abs(canvas.getPointer(opt.e).y - y) >
                    Math.abs(canvas.getPointer(opt.e).x - x)
                ) {
                    y = canvas.getPointer(opt.e).y;
                } else {
                    x = canvas.getPointer(opt.e).x;
                }
                currentSegment = new fabric.Line(
                    [currentWireSegmentX, currentWireSegmentY, x, y],
                    {
                        stroke: "black",
                        strokeWidth: 2,
                        hasControls: false,
                        selectable: false,
                        data: [currentWireSegmentX, currentWireSegmentY, x, y],
                        type: "wire",
                    }
                );
                canvas.add(currentSegment);
            }
        });

        canvas.on("mouse:up", (_) => {
            // on mouse up we want to recalculate new interaction
            // for all objects, so we call setViewportTransform
            canvas.setViewportTransform(canvas.viewportTransform);
            canvas.isDragging = false;
            canvas.selection = true;
        });
        canvas.on("object:moving", function (event) {
            if (event.target.type == "component") {
                console.log("moving component");
                console.log(segmentMap);
                const id = event.target.data.id;
                for (let key in event.target.data.pins) {
                    for (let value of event.target.data.pins[key]) {
                        console.log("id", id);
                        console.log("value", value);
                        const segments = segmentMap.get(`${id}-${value}`);
                        console.log("Segments", segments);
                        if (segments != undefined) {
                            console.log("Removing segments");
                            console.log(segments);
                            for (let segment of segments) {
                                console.log("Removing segment ", segment);
                                canvas.remove(segment);
                                canvas.requestRenderAll();
                            }
                        }
                    }
                }
            } // fire this if finished
        });

        resizeCanvas();
    }
</script>

<svelte:window on:resize={resizeCanvas} />
<canvas bind:this={canvasElement} />

<style>
</style>