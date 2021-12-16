import {Flag} from "./Flag";

export class BlockableFlag implements Flag {
    public constructor(
        private readonly flag: Flag,
        public readonly isBlocked: () => boolean,
    ) {
    }

    public get isChecked(): boolean {
        return this.flag.isChecked && !this.isBlocked()
    }

    public toggle(): void {
        this.flag.toggle()
    }

}
