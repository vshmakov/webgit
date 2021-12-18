export function not<T>(callback: (value: T) => boolean): (value: T) => boolean {
    return (value: T): boolean => !callback(value)
}
