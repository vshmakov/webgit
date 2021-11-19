import {makeAutoObservable} from "mobx";
import {Flag} from "./Flag";

export class InMemoryFlag implements Flag {
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
