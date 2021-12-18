import {makeAutoObservable} from "mobx";
import {LocalStorageKey} from "./LocalStorageKey";

export class LocalStorage<T> {
    private readonly key: string

    public constructor(key: LocalStorageKey, private value: T, domain: string = '') {
        this.key = JSON.stringify([key, domain])
        const localStorageValue = localStorage.getItem(this.key)

        if (null !== localStorageValue) {
            this.value = JSON.parse(localStorageValue)
        }

        makeAutoObservable(this)
    }

    public getValue(): T {
        return this.value
    }

    public setValue(value: T): void {
        localStorage.setItem(this.key, JSON.stringify(value))
        this.value = value
    }
}
