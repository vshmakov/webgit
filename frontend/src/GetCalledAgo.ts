export function getCalledAgo(ago: number | null): string {
    if (null === ago) {
        return ''
    }

    const totalMinutes = Math.floor(ago / 60 / 1000)

    if (5 > totalMinutes) {
        return ''
    }

    const hours = Math.floor(totalMinutes / 60)
    const timeParts = []

    if (0 !== hours) {
        timeParts.push(`${hours}h`)
    }

    const minutes = totalMinutes % 60;
    timeParts.push(`${Math.floor(minutes / 5) * 5}m`)

    return `(${timeParts.join(' ')} ago)`
}
