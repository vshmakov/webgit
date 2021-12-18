import {Flag} from "./Flag";

export class BlockableFlag implements Flag {
    public constructor(
        private readonly flag: Flag,
        public readonly isBlocked: () => boolean,
    ) {
    }

    public get isChecked(): boolean {
        return !this.isBlocked() && this.flag.isChecked
    }

    public toggle(): void {
        if (!this.isBlocked()) {
            this.flag.toggle()
        }
    }
}
