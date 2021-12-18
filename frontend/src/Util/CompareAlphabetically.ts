import {compare} from "./Compare";

export function compareAlphabetically(value1: string, value2: string): number {
    return compare(value1.toLowerCase(), value2.toLowerCase())
}
