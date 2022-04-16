export class Event{
    source: string;
    type: string;
    payload: any;

    constructor(source:string, type:string, payload:any){
        this.source = source;
        this.type = type;
        this.payload = payload;
    }
}