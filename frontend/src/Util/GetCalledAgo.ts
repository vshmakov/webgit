export function getCalledAgo(ago: number | null): string {
    if (null === ago) {
        return ''
    }

    const totalMinutes = Math.floor(ago / 60 / 1000 / 5) * 5

    if (0 === totalMinutes) {
        return ''
    }

    const hours = Math.floor(totalMinutes / 60)
    const days = Math.floor(hours / 24)
    const timeParts = []

    if (0 !== days) {
        timeParts.push(`${days}D`)
    }

    if (0 !== hours) {
        timeParts.push(`${hours % 24}H`)
    }

    const minutes = totalMinutes % 60;

    if (0 === days) {
        timeParts.push(`${minutes}M`)
    }

    return `(${timeParts.join(' ')} ago)`
}
