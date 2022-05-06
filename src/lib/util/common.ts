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

export function makeArray<T>(len: number, value: T): Array<T> {
    const array = Array(len);
    for (let i = 0; i < array.length; ++i) {
        array[i] = _.cloneDeep(value);
    }
    return array;
}

