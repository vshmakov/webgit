import {BranchSummaryBranch, StatusResult} from "simple-git";
import {isCurrent} from "./IsCurrent";

export function canPush(branch: BranchSummaryBranch, status: StatusResult): boolean {
    const hasAheadCommits = null !== status.tracking
        && 0 !== status.ahead

    return isCurrent(branch, status)
        && (null === status.tracking || hasAheadCommits)
}
