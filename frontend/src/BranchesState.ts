import {LocalStorage} from "./LocalStorage";
import {LocalStorageKey} from "./LocalStorageKey";
import {Flag} from "./Flag";
import {BranchSummary, BranchSummaryBranch} from "simple-git";
import {makeAutoObservable} from "mobx";

export class BranchesState {
    public readonly hiddenStorage = new LocalStorage<string[]>(LocalStorageKey.HiddenBranches, [])
    public showHidden: Flag = new Flag(false)

    public constructor(private readonly summary: BranchSummary) {
        makeAutoObservable(this)
    }

    public get sorted(): BranchSummaryBranch[] {
        const hidden = this.hiddenStorage.getValue()

        return this.branches
            .filter((branch: BranchSummaryBranch): boolean => this.showHidden.isChecked || !hidden.includes(branch.name))
            .sort((branch1: BranchSummaryBranch, branch2: BranchSummaryBranch): number => branch1.name.toLowerCase() < branch2.name.toLowerCase() ? -1 : 1)
    }

    public get hidden(): BranchSummaryBranch[] {
        const hiddenBranches = this.hiddenStorage.getValue()

        return this.branches
            .filter((branch: BranchSummaryBranch): boolean => hiddenBranches.includes(branch.name))
    }

    private get branches(): BranchSummaryBranch[] {
        return Object.values(this.summary.branches)
    }

    public toggleHide(branch: string): void {
        let hidden = this.hiddenStorage.getValue()

        if (hidden.includes(branch)) {
            hidden = hidden.filter((hiddenBranch: string): boolean => branch !== hiddenBranch)
        } else {
            hidden.push(branch)
        }

        this.hiddenStorage.setValue(hidden)
    }
}
