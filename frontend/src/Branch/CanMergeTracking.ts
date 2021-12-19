import {BranchSummaryBranch} from "simple-git";
import {StatusSummary} from "simple-git/src/lib/responses/StatusSummary";
import {isCurrent} from "./IsCurrent";

export function canMergeTracking(branch: BranchSummaryBranch, status: StatusSummary): boolean {
    return isCurrent(branch, status)
        && null !== status.tracking
        && 0 !== status.behind
}
