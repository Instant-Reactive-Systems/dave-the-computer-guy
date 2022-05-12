import _ from 'lodash';

export function assert(expr: boolean, msg: string|undefined = undefined) {
    if (!expr) throw new Error(msg || 'assertion failed');
}

export function todo(msg: string|undefined = undefined) {
    throw new Error(msg || 'reached code marked as \'todo\'');
}

export function unreachable(msg: string|undefined = undefined) {
    throw new Error(msg || 'unreachable reached');
}

export function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

export function makeArray<T>(len: number, factory: () => T): Array<T> {
    const array = Array(len);
    for (let i = 0; i < array.length; ++i) {
        array[i] = factory();
    }
    return array;
}

export function copy(obj: any){
    return _.cloneDeep(obj);
}

export function toBinaryArray(arr: boolean[]): number[] {
    return arr.map((v) => v ? 1 : 0);
}

