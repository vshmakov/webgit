export function sameWith<T>(compare: T): (value: T) => boolean {
    return (value: T): boolean => compare === value
}
