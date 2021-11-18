import {BranchSummary, BranchSummaryBranch, StatusResult} from "simple-git";
import {BranchesState} from "./BranchesState";
import {Flag} from "./Flag";
import {LocalStorage} from "./LocalStorage";
import {LocalStorageKey} from "./LocalStorageKey";
import {Loader} from "./Loader";
import {makeAutoObservable} from "mobx";
import {request} from "./Request";
import {Method} from "./Method";
import {FileStatusResult} from "simple-git/typings/response";

export class RepositoryState {
    public status: StatusResult | null = null
    public branches: BranchesState | null = null
    public readonly stageAllFilesBeforeCommit: Flag = new Flag(true)
    public readonly commitMessageStorage = new LocalStorage<string>(LocalStorageKey.CommitMessage, '')
    public readonly precommitCommandStorage = new LocalStorage<string>(LocalStorageKey.PrecommitCommand, '')
    public readonly bitbucketRepositoryPathStorage = new LocalStorage<string>(LocalStorageKey.BitbucketRepositoryPath, '')
    private readonly request = request.bind(null, this.path)
    public readonly statusLoader = new Loader<StatusResult>(LocalStorageKey.StatusCalledAt, this.path, this.requestStatus.bind(this))
    public readonly fetchLoader = new Loader<void>(LocalStorageKey.FetchCalledAt, this.path, this.requestFetch.bind(this))
    public newBranchName: string = ''
    public readonly isBranchCreation = new Flag(false)
    public readonly isDisabled = new Flag(false)

    public constructor(public readonly path: string) {
        makeAutoObservable(this)
        this.loadStatus()
        this.loadBranches()
    }

    public async loadStatus(): Promise<void> {
        this.setStatus(await this.statusLoader.load())
    }

    private async requestStatus(): Promise<StatusResult> {
        const response = await this.request(Method.Get, '/status')

        return await response.json()
    }

    private setStatus(status: StatusResult): void {
        this.status = status
    }

    private async loadBranches(): Promise<void> {
        const status = this.loadStatus()
        const response = await this.request(Method.Get, '/branches')
        const branchSummary = response.json()
        this.setBranchs(await branchSummary)
        await status
    }

    private setBranchs(branchSummary: BranchSummary): void {
        this.branches = new BranchesState(this.path, branchSummary)
    }

    public async commit(): Promise<void> {
        await this.request(Method.Post, '/commit', {
            message: this.commitMessageStorage.getValue(),
            stage: this.stageAllFilesBeforeCommit.isChecked,
            command: this.precommitCommandStorage.getValue(),
        })
        await this.loadStatus()
    }

    public async checkoutBranch(branch: BranchSummaryBranch): Promise<void> {
        this.isDisabled.check()
        await this.request(Method.Put, '/branch/checkout', branch)
        await this.loadStatus()
        this.branches?.addHistory(branch.name)
        this.isDisabled.uncheck()
    }

    public async mergeBranchIntoCurrent(branch: BranchSummaryBranch): Promise<void> {
        await this.request(Method.Put, '/branch/merge-into-current', branch)
        await this.loadStatus()
    }

    public async declineFile(file: FileStatusResult): Promise<void> {
        await this.request(Method.Put, '/file/decline', file)
        await this.loadStatus()
    }

    public async mergeTrackingBranch(): Promise<void> {
        await this.request(Method.Put, '/branch/merge-tracking')
        await this.loadStatus()
    }

    public async push(): Promise<void> {
        await this.request(Method.Put, '/branch/push')
        await this.loadStatus()
    }

    public async createBranch(): Promise<void> {
        await this.request(Method.Post, '/branch/create', {
            name: this.newBranchName
        })
        await this.loadBranches()
        this.cleanBranchCreation();
    }

    private cleanBranchCreation() {
        this.newBranchName = ''
        this.isBranchCreation.uncheck()
    }

    public async fetch(): Promise<void> {
        await this.fetchLoader.load()
        await this.loadStatus()
    }

    private async requestFetch(): Promise<void> {
        await this.request(Method.Put, '/fetch');
    }
}
