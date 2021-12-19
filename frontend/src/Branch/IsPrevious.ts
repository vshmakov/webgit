import {BranchSummaryBranch} from "simple-git";
import {BranchesState} from "./BranchesState";

export  function isPrevious(branch: BranchSummaryBranch, branches: BranchesState): boolean {
    const history = branches.historyStorage.getValue();
    const index = history.indexOf(branch.name)

    if (-1 === index) {
        return false
    }

    return index === history.length - 2
}
