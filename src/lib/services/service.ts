import { getContext, setContext } from "svelte";




export function loadService(serviceName: string): any{
    return getContext(`service.${serviceName}`);
}

export function addService(serviceName: string, service: any){
    setContext(`service.${serviceName}`,service);
}

