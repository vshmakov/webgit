import {LocalStorage} from "./LocalStorage";
import {LocalStorageKey} from "./LocalStorageKey";
import {makeAutoObservable} from "mobx";

export class Loader<T> {
    private readonly calledAtStorage = new LocalStorage<number | null>(this.localStorageKey, null)
    public ago: number | null = null

    public constructor(private readonly localStorageKey: LocalStorageKey, private readonly callback: () => Promise<T>) {
        makeAutoObservable(this)
    }

    public async load(): Promise<T> {
        const result = await this.callback()
        this.calledAtStorage.setValue(new Date().getTime())

        return result
    }

    public calculateAgo(): void {
        const value = this.calledAtStorage.getValue()

        if (null === value) {
            return
        }

        this.ago = new Date().getTime() - value
    }
}
