import { LocalStorage } from "../LocalStorage/LocalStorage"
import { LocalStorageKey } from "../LocalStorage/LocalStorageKey"
import { BranchSummary, BranchSummaryBranch } from "simple-git"
import { makeAutoObservable } from "mobx"
import { sameWith } from "../Util/SameWith"
import { not } from "../Util/Not"
import { compareAlphabetically } from "../Util/CompareAlphabetically"
import { compare } from "../Util/Compare"

export class BranchesState {
  public readonly hiddenStorage = new LocalStorage<string[]>(
    LocalStorageKey.HiddenBranches,
    [],
    this.path
  )
  public readonly historyStorage = new LocalStorage<string[]>(
    LocalStorageKey.BranchHistory,
    [],
    this.path
  )

  public constructor(
    private readonly path: string,
    private readonly summary: BranchSummary
  ) {
    makeAutoObservable(this)
  }

  public get sorted(): BranchSummaryBranch[] {
    const hidden = this.hiddenStorage.getValue()
    const history = this.historyStorage.getValue()

    return this.branches
      .filter(
        (branch: BranchSummaryBranch): boolean => !hidden.includes(branch.name)
      )
      .sort(
        (branch1: BranchSummaryBranch, branch2: BranchSummaryBranch): number =>
          compareAlphabetically(branch1.name, branch2.name)
      )
      .sort(
        (branch1: BranchSummaryBranch, branch2: BranchSummaryBranch): number =>
          -compare(history.indexOf(branch1.name), history.indexOf(branch2.name))
      )
  }

  public get hidden(): BranchSummaryBranch[] {
    const hiddenBranches = this.hiddenStorage.getValue()

    return this.branches.filter((branch: BranchSummaryBranch): boolean =>
      hiddenBranches.includes(branch.name)
    )
  }

  public get branches(): BranchSummaryBranch[] {
    return Object.values(this.summary.branches)
  }

  public addHistory(branch: string): void {
    const history = this.historyStorage.getValue().filter(not(sameWith(branch)))
    history.push(branch)
    this.historyStorage.setValue(history)
  }
}
