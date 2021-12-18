import {Flag} from "./Flag";

export function disable(flag: Flag): void {
    if (flag.isChecked) {
        flag.toggle()
    }
}
