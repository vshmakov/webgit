import {RepositoryState} from "./RepositoryState";
import {StatusSummary} from "simple-git/src/lib/responses/StatusSummary";
import {BranchesState} from "./BranchesState";

export interface RepositoryProps {
    state: RepositoryState
    status: StatusSummary
    branches: BranchesState
}
