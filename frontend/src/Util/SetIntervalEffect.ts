import {EmptyCallback} from "./EmptyCallback";

export function setIntervalEffect(callback: EmptyCallback, interval: number): EmptyCallback {
    const id = setInterval(callback, interval)

    return (): void => clearInterval(id)
}
