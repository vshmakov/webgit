import {BranchSummary, BranchSummaryBranch, LogResult, StatusResult} from "simple-git";
import {BranchesState} from "./BranchesState";
import {InMemoryFlag} from "./InMemoryFlag";
import {LocalStorage} from "./LocalStorage";
import {LocalStorageKey} from "./LocalStorageKey";
import {Loader} from "./Loader";
import {makeAutoObservable} from "mobx";
import {request} from "./Request";
import {Method} from "./Method";
import {FileStatusResult} from "simple-git/typings/response";
import {LocalStorageFlag} from "./LocalStorageFlag";
import {BlockableFlag} from "./BlockableFlag";

export class RepositoryState {
    public status: StatusResult | null = null
    public branches: BranchesState | null = null
    public commitHistory: LogResult | null = null
    public commitMessageStorage: LocalStorage<string> = new LocalStorage<string>(LocalStorageKey.CommitMessage, '', this.path)
    public readonly precommitCommandStorage = new LocalStorage<string>(LocalStorageKey.PrecommitCommand, '', this.path)
    public readonly bitbucketRepositoryPathStorage = new LocalStorage<string>(LocalStorageKey.BitbucketRepositoryPath, '', this.path)
    public readonly jiraPathStorage = new LocalStorage<string>(LocalStorageKey.JiraPath, '', this.path)
    public readonly jiraUserStorage = new LocalStorage<string>(LocalStorageKey.JiraUser, '', this.path)
    public readonly jiraTokenStorage = new LocalStorage<string>(LocalStorageKey.JiraToken, '', this.path)
    public readonly jiraIssueSummariesStorage = new LocalStorage<{ [key: string]: string | null }>(LocalStorageKey.JiraIssueSummaries, {}, this.path)
    public readonly useBranchAsCommitMessagePrefix = new LocalStorageFlag(new LocalStorage<boolean>(LocalStorageKey.UseBranchAsCommitMessagePrefix, false, this.path))
    public readonly useSectionCommitMessagePrefix = new LocalStorageFlag(new LocalStorage<boolean>(LocalStorageKey.UseSectionCommitMessagePrefix, false, this.path))
    public sectionCommitMessagePrefix: LocalStorage<string> = new LocalStorage<string>(LocalStorageKey.SectionCommitMessagePrefix, '', this.path)
    private readonly request = request.bind(null, this.path)
    public readonly statusLoader = new Loader<StatusResult>(LocalStorageKey.StatusCalledAt, this.path, this.requestStatus.bind(this))
    public readonly fetchLoader = new Loader<void>(LocalStorageKey.FetchCalledAt, this.path, this.requestFetch.bind(this))
    public newBranchName: string = ''
    public readonly isBranchCreation = new InMemoryFlag(false)
    public readonly isDisabled = new InMemoryFlag(false)
    private readonly loadedIssueSummaries: string[] = []
    public readonly cleanAfterCommit = new BlockableFlag(
        LocalStorageFlag.createByKey(LocalStorageKey.CleanAfterCommit, false, this.path),
        (): boolean => !this.stageAllFilesBeforeCommit.isChecked
    )
    public readonly stageAllFilesBeforeCommit = new BlockableFlag(
        LocalStorageFlag.createByKey(LocalStorageKey.StageAllFilesBeforeCommit, false, this.path),
        this.checkStatus((status: StatusResult): boolean => 0 !== status.staged.length)
    )
    public readonly allowEmptyCommit = new BlockableFlag(
        new InMemoryFlag(false),
        this.checkStatus((status: StatusResult): boolean => 0 !== status.files.length)
    )

    public constructor(public readonly path: string) {
        makeAutoObservable(this)
        this.loadStatus()
        this.loadBranches()
    }

    private checkStatus(callback: (status: StatusResult) => boolean): () => boolean {
                return (): boolean => null !== this.status ? callback(this.status) : false
    }

    private async loadCommitHistory(): Promise<void> {
        const response = await this.request(Method.Get, '/commit/history')
        this.setCommitHistory(await response.json())
    }

    private setCommitHistory(commitHistory: LogResult): void {
        this.commitHistory = commitHistory
    }

    public getBranchName(branch: BranchSummaryBranch): string {
        const name = branch.name;
        const summaries = this.jiraIssueSummariesStorage.getValue()
        const summary = summaries[name]

        if (summary) {
            return `${name}: ${summary}`
        }

        if (undefined === summary) {
            this.loadIssueSummary(name)
        }

        return name
    }

    private async loadIssueSummary(key: string): Promise<void> {
        const path = this.jiraPathStorage.getValue()
        const user = this.jiraUserStorage.getValue()
        const token = this.jiraTokenStorage.getValue()

        if ('' === path || '' === user || '' === token || this.loadedIssueSummaries.includes(key)) {
            return
        }

        this.addLoadedIssueSummary(key);
        const params = {
            path: path,
            user: user,
            token: token,
            key: key,
        }
        const search = new URLSearchParams(params).toString()
        const response = await this.request(Method.Get, `/jira/issue-summary?${search}`)
        const summary = await response.json()
        const summaries = this.jiraIssueSummariesStorage.getValue()
        summaries[key] = summary
        this.jiraIssueSummariesStorage.setValue(summaries)
    }

    private addLoadedIssueSummary(key: string): void {
        this.loadedIssueSummaries.push(key)
    }

    public async loadStatus(): Promise<void> {
        this.loadCommitHistory()
        this.setStatus(await this.statusLoader.load())
    }

    private async requestStatus(): Promise<StatusResult> {
        const response = await this.request(Method.Get, '/status')

        return await response.json()
    }

    private setStatus(status: StatusResult): void {
        this.status = status
        this.sectionCommitMessagePrefix = new LocalStorage(LocalStorageKey.SectionCommitMessagePrefix, '', JSON.stringify([this.path, status.current]))
        this.commitMessageStorage = new LocalStorage(LocalStorageKey.CommitMessage, '', JSON.stringify([this.path, status.current]))
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
            message: this.getCommitMessage(),
            stage: this.stageAllFilesBeforeCommit.isChecked,
            cleanAfterCommit: this.cleanAfterCommit.isChecked,
            command: this.precommitCommandStorage.getValue(),
        })
        await this.loadStatus()
    }

    private getCommitMessage(): string {
        let message = this.commitMessageStorage.getValue()

        if (this.useSectionCommitMessagePrefix.isChecked) {
            message = `[${this.sectionCommitMessagePrefix.getValue()}] ${message}`
        }

        if (this.useBranchAsCommitMessagePrefix.isChecked) {
            message = `${this.status?.current}: ${message}`
        }

        return message
    }

    public async checkoutBranch(branch: BranchSummaryBranch): Promise<void> {
        this.isDisabled.check()
        await this.request(Method.Put, '/branch/checkout', branch)
        await this.loadStatus()
        this.isDisabled.uncheck()
        const current = this.status?.current

        if (current) {
            this.branches?.addHistory(current)
        }
    }

    public async mergeBranchIntoCurrent(branch: BranchSummaryBranch): Promise<void> {
        await this.request(Method.Put, '/branch/merge-into-current', branch)
        await this.loadStatus()
    }

    public async declineFile(file: FileStatusResult): Promise<void> {
        await this.request(Method.Put, '/file/decline', file)
        await this.loadStatus()
    }

    public async stage(file: FileStatusResult): Promise<void> {
        await this.request(Method.Put, '/file/stage', file)
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
        this.branches?.addHistory(this.newBranchName)
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
