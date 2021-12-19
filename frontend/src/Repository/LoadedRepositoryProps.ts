import {RepositoryState} from "./RepositoryState";
import {StatusSummary} from "simple-git/src/lib/responses/StatusSummary";
import {BranchesState} from "../Branch/BranchesState";
import {RepositoryProps} from "./RepositoryProps";
import {BranchesProps} from "../Branch/BranchesProps";

export interface LoadedRepositoryProps extends RepositoryProps, BranchesProps {
    status: StatusSummary
}
