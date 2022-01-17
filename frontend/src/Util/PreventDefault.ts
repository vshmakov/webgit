import {FormEvent} from "react";

export function preventDefault(callback: () => void): (event: FormEvent<HTMLFormElement>) => void {
    return (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault()
        callback()
    }
}
