export function compareAlphabetically(value1: string, value2: string): number {
    return value1.toLowerCase() < value2.toLowerCase() ? -1 : 1
}
