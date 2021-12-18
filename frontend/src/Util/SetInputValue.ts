import {ChangeEvent} from "react";

export function setInputValue(callback: (value: string) => void): (event: ChangeEvent<HTMLInputElement>) => void {
    return (event: ChangeEvent<HTMLInputElement>): void => callback(event.target.value)
}
