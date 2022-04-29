import { getContext } from "svelte"

export const loadService = (serviceName: string) => {
    getContext(`service.${serviceName}`)
}