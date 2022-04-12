import { Component } from  '../models/component'
import { fabric }  from 'fabric'
class GenericComponentRenderable implements RenderableComponent{
    component: Component;
    fabricObject: fabric.Object;
    canvas: fabric.Canvas;
    static readonly BASE_SIZE = 100;

    constructor(top:number, left: number,component: Component){
        this.component = component;
    }
    
    render(canvas: fabric.Canvas) {
        
    }

    setState(state: any): void {
        
    }
    
    onClick(): void {
        
    }

    left: number;

    top: number;

    pinSelectedListener: (component: Component, pin: fabric.Group) => void;


    calculateDimensions(){
        const BASE_HEIGHT_SIZE = GenericComponentRenderable.BASE_SIZE;
        const BASE_WIDTH_SIZE = GenericComponentRenderable.BASE_SIZE;
        let height = BASE_HEIGHT_SIZE + Math.max(this.pins.left.length, this.pins.right.length) * (BASE_HEIGHT_SIZE / 4);
        let width = BASE_WIDTH_SIZE + Math.max(this.pins.top.length, this.pins.bottom.length) * (BASE_WIDTH_SIZE / 4);
        return {
            height:height,
            width: width
        }
    }

    createPins(componentHeight: number, componentWidth: number){
        let pins = {
            "top": [],
            "bottom": [],
            "left": [],
            "right": []
        };
        const pinLocationMapping = this.component.definition.metadata.pinLocationMapping;
        for (const namePinPair of pinLocationMapping.left) {
            const baseOffset = componentHeight / (pinLocationMapping.left.length + 1)
            const line = new fabric.Line([0, 0, 40, 0], { stroke: 'black' });
            const pinIndex = pinLocationMapping.left.indexOf(namePinPair);
            const pinOffset = (pinIndex + 1) * baseOffset;
            const lineText = new fabric.Text(namePinPair.name, {
                originY: "bottom",
                fontSize: 18,
            });
            const pinConnectionPoint = new fabric.Circle({
                left: line.left - 2,
                top: line.top - 4,
                fill: "black",
                radius: 4,
            })

            let pinGroup = new fabric.Group([line, lineText, pinConnectionPoint], {
                left: - 40,
                top: (pinOffset - lineText.height)
            })
            pinGroup.data = {
                "type": "pin",
                "value": namePinPair.pin,
                "component": this.component.id, 
            }
            pins.left.push(pinGroup);
        }
        for (const pin of this.pins.right) {
            const baseOffset = componentHeight / (this.pins.right.length + 1)
            const line = new fabric.Line([0, 0, 40, 0], { stroke: 'black' });
            const pinIndex = this.pins.right.indexOf(pin);
            const pinOffset = (pinIndex + 1) * baseOffset;
            const lineText = new fabric.Text(pin, {
                originY: "bottom",
                fontSize: 18,
                left: line.width - 10

            });
            const pinConnectionPoint = new fabric.Circle({
                left: line.left + line.width - 2,
                top: line.top - 4,
                fill: "black",
                radius: 4,
            })
            let pinGroup = new fabric.Group([line, lineText, pinConnectionPoint], {
                left: componentWidth,
                top: (pinOffset - lineText.height)
            })
            pinGroup.data = {
                "type": "pin",
                "value": pin,
                "component": this.component.id, 
            }
            pins.right.push(pinGroup);

        }
        for (const pin of this.pins.bottom) {
            const baseOffset = componentWidth / (this.pins.bottom.length + 1)
            const line = new fabric.Line([0, 0, 0, -40], { stroke: 'black' });
            const pinIndex = this.pins.bottom.indexOf(pin);
            const pinOffset = (pinIndex + 1) * baseOffset;
            const lineText = new fabric.Text(pin, {
                fontSize: 18,
                originX: "right",
                left: -20,
                top: -15,
                angle: 270
            });
            const pinConnectionPoint = new fabric.Circle({
                left: line.left + line.width - 4,
                top: line.top + line.height,
                fill: "black",
                radius: 4,
            })
            let pinGroup = new fabric.Group([line, lineText, pinConnectionPoint], {
                left: (pinOffset - lineText.height),
                top: componentHeight
            })
            pinGroup.data = {
                "type": "pin",
                "value": pin,
                "component": this.component.id, 
            }
            pins.bottom.push(pinGroup);
        }

        for (const pin of this.pins.top) {
            const baseOffset = componentWidth / (this.pins.top.length + 1)
            const line = new fabric.Line([0, 0, 0, -40], { stroke: 'black' });
            const pinIndex = this.pins.top.indexOf(pin);
            const pinOffset = (pinIndex + 1) * baseOffset;
            const lineText = new fabric.Text(pin, {
                fontSize: 18,
                originX: "right",
                left: -10,
                top: -line.height,
            });
            const pinConnectionPoint = new fabric.Circle({
                left: line.left - 4,
                top: line.top - 4,
                fill: "black",
                radius: 4,
            })
            let pinGroup = new fabric.Group([line, lineText, pinConnectionPoint], {
                left: (pinOffset - lineText.height),
                top: -(line.height)
            })
            pinGroup.data = {
                "type": "pin",
                "value": pin,
                "component": this.component.id, 
            }
            pins.top.push(pinGroup);
        }

        return pins;
    }

    buildFabricObject():fabric.Object {
     

        let dimensions = this.calculateDimensions();
        let componentOutline = new fabric.Rect({
            height:dimensions.height,
            width: dimensions.width,
            fill: "transparent",
            stroke: "black",
            strokeWidth: 1,
            strokeUniform: true,
            hasControls: false,
            hasBorders: false,
        });

        let componentText = new fabric.Text(this.component.definition.name, {
            originX: 'center', originY: 'center',
            left: 0.5 * componentOutline.width, top: 0.5 * componentOutline.height,
            fontSize: 40
        });

       
        let pins = this.createPins(componentOutline.height,componentOutline.width);

        this.fabricObject = new fabric.Group([componentOutline, componentText, ...pins.left, ...pins.right, ...pins.bottom, ...pins.top], {
            left: this.left,
            top: this.top,
            subTargetCheck: true,

        })
        this.fabricObject.setControlsVisibility({
            mt: false, 
            mb: false, 
            ml: false, 
            mr: false, 
            bl: false,
            br: false, 
            tl: false, 
            tr: false,
            mtr: false, 
       });
       this.fabricObject.data = {
           type: 'GenericRenderableComponent',
           ref:this
       }
       return this.fabricObject;
    }

}