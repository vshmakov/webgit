import {LocalStorage} from "./LocalStorage";
import {LocalStorageKey} from "./LocalStorageKey";
import {Flag} from "./Flag";
import {BranchSummary, BranchSummaryBranch} from "simple-git";
import {makeAutoObservable} from "mobx";
import {sameWith} from "./SameWith";
import {not} from "./Not";
import {compareAlphabetically} from "./CompareAlphabetically";

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
            .sort((branch1: BranchSummaryBranch, branch2: BranchSummaryBranch): number => compareAlphabetically(branch1.name, branch2.name))
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
            hidden = hidden.filter(not(sameWith(branch)))
        } else {
            hidden.push(branch)
        }

        this.hiddenStorage.setValue(hidden)
    }
}
