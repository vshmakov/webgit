import {makeAutoObservable} from "mobx";

export class Flag {
    public constructor(public isChecked: boolean) {
        makeAutoObservable(this)
    }

    public toggle(): void {
        this.isChecked = !this.isChecked
    }

    public check(): void {
        this.isChecked = true
    }

    public uncheck(): void {
        this.isChecked = false
    }
}
