import {FormEvent} from "react";

export function onSubmit(callback: () => Promise<void>): (event: FormEvent<HTMLFormElement>) => void {
    return (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault()
        callback()
    }
}
