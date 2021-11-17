export function and(callback1: () => void, callback2: () => void): void {
    callback1()
    callback2()
}

export function not<T>(callback: (value: T) => boolean): (value: T) => boolean {
    return (value: T): boolean => !callback(value)
}
