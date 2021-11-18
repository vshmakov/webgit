import {makeAutoObservable} from "mobx";

export class Flag {
    public constructor(private flag: boolean) {
        makeAutoObservable(this)
    }

    public get isChecked(): boolean {
        return this.flag
    }

    public toggle(): void {
        this.flag = !this.flag
    }

    public check(): void {
        this.flag = true
    }

    public uncheck(): void {
        this.flag = false
    }
}
