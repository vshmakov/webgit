export function compare<T>(value1: T, value2: T): number {
    if (value1 === value2) {
        return 0
    }

    return value1 < value2 ? -1 : 1
}
