interface Preventable {
    preventDefault(): void
}

export function preventDefault(callback: () => void): (event: Preventable) => void {
    return (event: Preventable): void => {
        event.preventDefault()
        callback()
    }
}
