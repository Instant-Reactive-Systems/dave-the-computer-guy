import type { Component } from '$lib/models/component';
import type { UserEvent } from '$lib/models/user_event';
import type { fabric } from 'fabric'

export interface RenderableComponent {
    component: Component;
    pins: fabric.Object[];

    buildFabricObject(): fabric.Object;
    onClick(): UserEvent;
    update(state: any): void;
}

