import {Flag} from "./Flag";
import {LocalStorage} from "./LocalStorage";
import {LocalStorageKey} from "./LocalStorageKey";

export class LocalStorageFlag implements Flag {
    public constructor(private readonly localStorage: LocalStorage<boolean>) {
    }

    public static createByKey(key: LocalStorageKey, value: boolean, domain: string): LocalStorageFlag {
        return new LocalStorageFlag(new LocalStorage(key, value, domain))
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
