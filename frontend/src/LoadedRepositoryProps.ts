import {RepositoryState} from "./RepositoryState";
import {StatusSummary} from "simple-git/src/lib/responses/StatusSummary";
import {BranchesState} from "./Branch/BranchesState";
import {RepositoryProps} from "./RepositoryProps";

export interface LoadedRepositoryProps extends RepositoryProps {
    status: StatusSummary
    branches: BranchesState
}
