import type { Component } from "$lib/models/component";
import { GenericComponentRenderable } from "./generic_renderable_component";
import { LedRenderable } from "./led_renderable";
import { NandRenderable } from "./nand_renderable";
import type { RenderableComponent } from "./renderable_component";
import { SwitchRenderable } from "./switch_renderable";


const COMPONENT_FACTORY_MAP = new Map<number, (x: number, y: number, component: Component) => RenderableComponent>();

COMPONENT_FACTORY_MAP.set(-1, (x: number, y: number, component: Component) => new NandRenderable(x, y, component));
COMPONENT_FACTORY_MAP.set(-6, (x: number, y: number, component: Component) => new SwitchRenderable(x, y, component));
COMPONENT_FACTORY_MAP.set(-7, (x: number, y: number, component: Component) => new LedRenderable(x, y, component));

export function createComponent(x: number, y: number, component: Component): RenderableComponent {
    if (component.definition.id >= 0) {
        return new GenericComponentRenderable(x, y, component);
    } else {
        let compFactoryFunction = COMPONENT_FACTORY_MAP.get(component.definition.id)
        if (compFactoryFunction == undefined) {
            return new GenericComponentRenderable(x, y, component);
        } else {
            return compFactoryFunction(x, y, component);
        }
    }


}
