import {Flag} from "./Flag";
import {LocalStorage} from "./LocalStorage";

export class LocalStorageFlag implements Flag {
    public constructor(private readonly localStorage: LocalStorage<boolean>) {
    }

    public get isChecked(): boolean {
        return this.localStorage.getValue()
    }

    public toggle(): void {
        this.localStorage.setValue(
            !this.localStorage.getValue()
        )
    }
}
