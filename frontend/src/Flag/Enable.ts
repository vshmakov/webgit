import {Flag} from "./Flag";

export function enable(flag: Flag): void {
    if (!flag.isChecked) {
        flag.toggle()
    }
}
