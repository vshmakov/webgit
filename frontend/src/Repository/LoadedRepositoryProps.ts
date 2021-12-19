import {RepositoryProps} from "./RepositoryProps";
import {BranchesProps} from "../Branch/BranchesProps";
import {StatusProps} from "./StatusProps";

export interface LoadedRepositoryProps extends RepositoryProps, BranchesProps, StatusProps {
}
