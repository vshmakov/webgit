import {BranchSummaryBranch, StatusResult} from "simple-git";
import {isCurrent} from "./IsCurrent";

export function canMergeTracking(branch: BranchSummaryBranch, status: StatusResult): boolean {
    return isCurrent(branch, status)
        && null !== status.tracking
        && 0 !== status.behind
}
