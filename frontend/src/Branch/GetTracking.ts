import {BranchSummaryBranch} from "simple-git";
import {StatusSummary} from "simple-git/src/lib/responses/StatusSummary";
import {isCurrent} from "./IsCurrent";

export function getTracking(branch: BranchSummaryBranch, status: StatusSummary): string {
    if (!isCurrent(branch, status)) {
        return ''
    }

    const parts = []

    if (0 !== status.ahead) {
        parts.push(`${status.ahead} ->`)
    }

    if (0 !== status.behind) {
        parts.push(`<- ${status.behind}`)
    }

    if (null !== status.tracking) {
        parts.push(`(${status.tracking})`)
    }

    return parts.join(' ')
}
