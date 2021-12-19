import {BranchSummaryBranch} from "simple-git";
import {StatusSummary} from "simple-git/src/lib/responses/StatusSummary";

export function isCurrent(branch: BranchSummaryBranch, status: StatusSummary): boolean {
    return branch.name === status.current
}
