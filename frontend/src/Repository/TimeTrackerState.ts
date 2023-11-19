import {BranchSummaryBranch, LogResult, StatusResult} from "simple-git";
import {BranchesState} from "../Branch/BranchesState";
import {InMemoryFlag} from "../Flag/InMemoryFlag";
import {LocalStorage} from "../LocalStorage/LocalStorage";
import {LocalStorageKey} from "../LocalStorage/LocalStorageKey";
import {Loader} from "../Http/Loader";
import {makeAutoObservable} from "mobx";
import {request} from "../Http/Request";
import {Method} from "../Http/Method";
import {FileStatusResult} from "simple-git/typings/response";
import {LocalStorageFlag} from "../Flag/LocalStorageFlag";
import {BlockableFlag} from "../Flag/BlockableFlag";
import {disable} from "../Flag/Disable";
import {EmptyCommitMessage} from "../Commit/EmptyCommitMessage";
import {enable} from "../Flag/Enable";
import {RequestRepository} from "./RequestRepository";
import {requestStatus} from "./RequestStatus";
import {requestBranches} from "./RequestBranches";
import {getBranchNameParts} from "../Branch/getBranchNameParts";
import {loadWachIndex} from "./LoadWachIndex";
import {RemoteState} from "./RemoteState";

export class TimeTrackerState {
    public readonly jiraPathStorage = new LocalStorage<string>(LocalStorageKey.JiraPath, '', this.path)
    public readonly jiraUserStorage = new LocalStorage<string>(LocalStorageKey.JiraUser, '', this.path)
    public readonly jiraTokenStorage = new LocalStorage<string>(LocalStorageKey.JiraToken, '', this.path)
    public readonly jiraIssueSummariesStorage = new LocalStorage<{ [key: string]: string | null }>(LocalStorageKey.JiraIssueSummaries, {}, this.path)

    public constructor(
        private readonly path: string,
    ) {
    }
}
