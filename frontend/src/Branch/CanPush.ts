import {BranchSummaryBranch} from "simple-git";
import {StatusSummary} from "simple-git/src/lib/responses/StatusSummary";
import {isCurrent} from "./IsCurrent";

export function canPush(branch: BranchSummaryBranch, status: StatusSummary): boolean {
    const hasAheadCommits = null !== status.tracking
        && 0 !== status.ahead

    return isCurrent(branch, status)
        && (null === status.tracking || hasAheadCommits)
}
