import {BranchSummaryBranch, StatusResult} from "simple-git";

export function isCurrent(branch: BranchSummaryBranch, status: StatusResult): boolean {
    return branch.name === status.current
}
