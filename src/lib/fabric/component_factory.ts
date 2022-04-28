import type { Component } from "$lib/models/component";
import { GenericComponentRenderable } from "./generic_renderable_component";
import { LedRenderable } from "./led_renderable";
import { NandRenderable } from "./nand_renderable";
import type { RenderableComponent } from "./renderable_component";
import { SwitchRenderable } from "./switch_renderable";



const PREBUILT_COMPONENTS = new Map<number, (x: number, y: number, component: Component) => RenderableComponent>();

PREBUILT_COMPONENTS.set(-1, (x: number, y: number, component: Component) => new NandRenderable(x, y, component));
PREBUILT_COMPONENTS.set(-6, (x: number, y: number, component: Component) => new SwitchRenderable(x, y, component));
PREBUILT_COMPONENTS.set(-7, (x: number, y: number, component: Component) => new LedRenderable(x, y, component));

export function createComponent(x: number, y: number, component: Component): RenderableComponent {
    if (component.definition.id >= 0) {
        return new GenericComponentRenderable(x, y, component);
    } else {
        let producer = PREBUILT_COMPONENTS.get(component.definition.id);

        // Some prebuilt components don't have special rendering
        // so we render them as generic components
        if (producer == undefined) {
            return new GenericComponentRenderable(x, y, component);
        } else {
            return producer(x, y, component);
        }
    }
}

