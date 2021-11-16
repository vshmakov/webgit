import React, {FormEvent, ReactElement, useEffect} from 'react';
import './App.css';
import {makeAutoObservable} from "mobx"
import {observer} from "mobx-react"
import {BranchSummary, BranchSummaryBranch, StatusResult} from "simple-git";
import {FileStatusResult} from "simple-git/typings/response";
import {withSound} from "./WithSound";
import {LocalStorage} from "./LocalStorage";
import {Method} from "./Method";
import {request} from "./Request";
import {Flag} from "./Flag";
import {LocalStorageKey} from "./LocalStorageKey";
import {StatusSummary} from "simple-git/src/lib/responses/StatusSummary";

class Loader<T> {
    private readonly calledAtStorage = new LocalStorage<number | null>(this.localStorageKey, null)
    public ago: number | null = null

    public constructor(private readonly localStorageKey: LocalStorageKey, private readonly callback: () => Promise<T>) {
        makeAutoObservable(this)
    }

    public async load(): Promise<T> {
        const result = await this.callback()
        this.calledAtStorage.setValue(new Date().getTime())

        return result
    }

    public calculateAgo(): void {
        const value = this.calledAtStorage.getValue()

        if (null === value) {
            return
        }

        this.ago = new Date().getTime() - value
    }
}

class BranchesState {
    public readonly hiddenStorage = new LocalStorage<string[]>(LocalStorageKey.HiddenBranches, [])
    public showHidden: Flag = new Flag(false)

    public constructor(private readonly summary: BranchSummary) {
        makeAutoObservable(this)
    }

    public get sorted(): BranchSummaryBranch[] {
        const hidden = this.hiddenStorage.getValue()

        return this.branches
            .filter((branch: BranchSummaryBranch): boolean => this.showHidden.isChecked || !hidden.includes(branch.name))
            .sort((branch1: BranchSummaryBranch, branch2: BranchSummaryBranch): number => branch1.name.toLowerCase() < branch2.name.toLowerCase() ? -1 : 1)
    }

    public get hidden(): BranchSummaryBranch[] {
        const hiddenBranches = this.hiddenStorage.getValue()

        return this.branches
            .filter((branch: BranchSummaryBranch): boolean => hiddenBranches.includes(branch.name))
    }

    private get branches(): BranchSummaryBranch[] {
        return Object.values(this.summary.branches)
    }

    public toggleHide(branch: string): void {
        let hidden = this.hiddenStorage.getValue()

        if (hidden.includes(branch)) {
            hidden = hidden.filter((hiddenBranch: string): boolean => branch !== hiddenBranch)
        } else {
            hidden.push(branch)
        }

        this.hiddenStorage.setValue(hidden)
    }
}

class RepositoryState {
    public status: StatusResult | null = null
    public branches: BranchesState | null = null
    public readonly stageAllFilesBeforeCommit: Flag = new Flag(true)
    public readonly commitMessageStorage = new LocalStorage<string>(LocalStorageKey.CommitMessage, '')
    public readonly precommitCommandStorage = new LocalStorage<string>(LocalStorageKey.PrecommitCommand, '')
    public readonly bitbucketRepositoryPathStorage = new LocalStorage<string>(LocalStorageKey.BitbucketRepositoryPath, '')
    public readonly statusLoader: Loader<StatusResult> = new Loader<StatusResult>(LocalStorageKey.StatusCalledAt, this.requestStatus)
    public readonly fetchLoader: Loader<void> = new Loader<void>(LocalStorageKey.FetchCalledAt, this.requestFetch)
    public newBranchName: string = ''
    public readonly isBranchCreation = new Flag(false)

    public constructor() {
        makeAutoObservable(this)
        this.loadStatus()
        this.loadBranches()
    }

    public async loadStatus(): Promise<void> {
        this.setStatus(await this.statusLoader.load())
    }

    private async requestStatus(): Promise<StatusResult> {
        const response = await request(Method.Get, '/status')

        return await response.json()
    }

    private setStatus(status: StatusResult): void {
        this.status = status
    }

    private async loadBranches(): Promise<void> {
        const status = this.loadStatus()
        const response = await request(Method.Get, '/branches')
        const branchSummary = response.json()
        this.setBranchs(await branchSummary)
        await status
    }

    private setBranchs(branchSummary: BranchSummary): void {
        this.branches = new BranchesState(branchSummary)
    }

    public async commit(): Promise<void> {
        await request(Method.Post, '/commit', {
            message: this.commitMessageStorage.getValue(),
            stage: this.stageAllFilesBeforeCommit.isChecked,
            command: this.precommitCommandStorage.getValue(),
        })
        await this.loadStatus()
    }

    public async checkoutBranch(branch: BranchSummaryBranch): Promise<void> {
        await request(Method.Put, '/branch/checkout', branch)
        await this.loadStatus()
    }

    public async mergeBranchIntoCurrent(branch: BranchSummaryBranch): Promise<void> {
        await request(Method.Put, '/branch/merge-into-current', branch)
        await this.loadStatus()
    }

    public async declineFile(file: FileStatusResult): Promise<void> {
        await request(Method.Put, '/file/decline', file)
        await this.loadStatus()
    }

    public async mergeTrackingBranch(): Promise<void> {
        await request(Method.Put, '/branch/merge-tracking')
        await this.loadStatus()
    }

    public async push(): Promise<void> {
        await request(Method.Put, '/branch/push')
        await this.loadStatus()
    }

    public async createBranch(): Promise<void> {
        await request(Method.Post, '/branch/create', {
            name: this.newBranchName
        })
        await this.loadBranches()
        this.cleanBranchCreation();
    }

    private cleanBranchCreation() {
        this.newBranchName = ''
        this.isBranchCreation.isChecked = false
    }

    public async fetch(): Promise<void> {
        await this.fetchLoader.load()
        await this.loadStatus()
    }

    private async requestFetch(): Promise<void> {
        await request(Method.Put, '/fetch');
    }
}

interface ToggleProps {
    label: string
    flag?: Flag
    children: ReactElement
}

interface ToggleState {
    flag: Flag
}

const Toggle = observer(class extends React.Component<ToggleProps, ToggleState> {
    readonly state: ToggleState = {
        flag: this.props.flag || new Flag(false)
    }

    public render(): ReactElement {
        return (
            <div>
                <div>
                    <label>
                        <input
                            type="checkbox"
                            checked={this.state.flag.isChecked}
                            onChange={() => this.state.flag.toggle()}/>
                        {this.props.label}
                    </label>
                </div>
                <div>
                    {this.state.flag.isChecked ? this.props.children : null}
                </div>
            </div>
        )
    }
})

interface RepositoryProps {
    state: RepositoryState
    status: StatusSummary
    branches: BranchesState
}

const Branches = observer(class extends React.Component<RepositoryProps> {
    public render(): ReactElement {
        const {state, branches} = this.props

        return (
            <div>
                <h3>Branches</h3>
                <Toggle label='Create' flag={state.isBranchCreation}>
                    <form onSubmit={this.submitHandler.bind(this)}>
                        <input
                            type="text"
                            value={state.newBranchName}
                            onChange={(event) => state.newBranchName = event.target.value}
                            required={true}/>
                        <button type="submit">
                            Create
                        </button>
                    </form>
                </Toggle>
                <form>
                    <label key={JSON.stringify(state)}>
                        <input
                            type="checkbox"
                            checked={branches.showHidden.isChecked}
                            onChange={(): void => branches.showHidden.toggle()}/>
                        Show hidden ({branches.hidden.length})
                    </label>
                    <table>
                        <thead>
                        <tr>
                            <th></th>
                            <th>Branch</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {branches.sorted.map(this.renderBranch.bind(this))}
                        </tbody>
                    </table>
                    <div>
                        <Toggle label='Create pull request for current branch'>
                            <form>
                                <input
                                    type="text"
                                    value={state.bitbucketRepositoryPathStorage.getValue()}
                                    onChange={(event): void => state.bitbucketRepositoryPathStorage.setValue(event.target.value)}/>
                                {this.getCreateBitbucketPullRequestLink()}
                            </form>
                        </Toggle>
                    </div>
                </form>
            </div>
        )
            ;
    }

    private getCreateBitbucketPullRequestLink(): ReactElement | null {
        const path = this.props.state.bitbucketRepositoryPathStorage.getValue()

        if (null === path) {
            return null
        }

        const branch = this.props.status.current

        return (
            <a href={`${path}/pull-requests/new?source=${branch}&t=1`}>
                Create for {branch}
            </a>
        )
    }

    private submitHandler(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault()
        withSound(this.props.state.createBranch())
    }

    private renderBranch(branch: BranchSummaryBranch): ReactElement {
        return (
            <tr key={branch.name}>
                <td>
                    <input
                        type='radio'
                        name='current-branch'
                        checked={this.isCurrentBranch(branch)}
                        onChange={() => withSound(this.props.state.checkoutBranch(branch))}/>
                </td>
                <td>
                    {branch.name} {this.getTracking(branch)}
                </td>
                <td>
                    {this.getMergeIntoCurrentButton(branch)}
                    {this.getMergeTrackingButton(branch)}
                    {this.getPushButton(branch)}
                    {this.getHideButton(branch)}
                </td>
            </tr>
        )
    }

    private getHideButton(branch: BranchSummaryBranch): ReactElement | null {
        const {branches} = this.props

        if (!branches.showHidden.isChecked) {
            return null
        }

        return (
            <button type='button' onClick={(): void => branches.toggleHide(branch.name)}>
                {!branches.hiddenStorage.getValue().includes(branch.name) ? 'Hide' : 'Show'}
            </button>
        )
    }

    private getMergeIntoCurrentButton(branch: BranchSummaryBranch): ReactElement | null {
        if (this.isCurrentBranch(branch)) {
            return null
        }

        const {state} = this.props

        return (
            <button type='button' onClick={() => withSound(state.mergeBranchIntoCurrent(branch))}>
                Merge into {state.status?.current}
            </button>
        )
    }

    private getPushButton(branch: BranchSummaryBranch): ReactElement | null {
        if (!this.canPush(branch)) {
            return null
        }

        const {state} = this.props

        return (
            <button type='button' onClick={() => withSound(state.push())}>
                Push
            </button>
        )
    }

    private canPush(branch: BranchSummaryBranch): boolean {
        const {status} = this.props

        const hasAheadCommits = null !== status.tracking
            && 0 !== status.ahead

        return this.isCurrentBranch(branch)
            && (null === status.tracking || hasAheadCommits)
    }

    private getMergeTrackingButton(branch: BranchSummaryBranch): ReactElement | null {
        if (!this.canMergeTrackingBranch(branch)) {
            return null
        }

        const {state} = this.props

        return (
            <button type='button' onClick={() => withSound(state.mergeTrackingBranch())}>
                Merge tracking
            </button>
        )
    }

    private canMergeTrackingBranch(branch: BranchSummaryBranch): boolean {
        const {status} = this.props

        return this.isCurrentBranch(branch)
            && null !== status.tracking
            && 0 !== status.behind
    }

    private isCurrentBranch(branch: BranchSummaryBranch): boolean {
        return branch.name === this.props.status.current
    }

    private getTracking(branch: BranchSummaryBranch): string {
        const {status} = this.props

        if (!this.isCurrentBranch(branch)) {
            return ''
        }

        let tracking = ''

        if (0 !== status.ahead) {
            tracking += `${status.ahead} -> `
        }

        if (0 !== status.behind) {
            tracking += ` <- ${status.behind}`
        }

        if (null !== status.tracking) {
            tracking += ` (${status.tracking})`
        }

        return tracking
    }
})

const Files = observer(class extends React.Component<RepositoryProps> {
    public render(): ReactElement {
        const {status} = this.props;

        return (
            <div>
                <h3>Files</h3>
                <table>
                    <thead>
                    <tr>
                        <th>File</th>
                        <th>Directory</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {status.files.map(this.renderFile.bind(this))}
                    </tbody>
                </table>
            </div>
        )
            ;
    }

    private renderFile(file: FileStatusResult): ReactElement {
        const Status = {
            A: 'Added',
            D: 'Deleted',
            M: 'Modified',
            "?": "New",
        }

        const workingDir = file.working_dir as keyof typeof Status

        const {name, directory} = this.splitFileName(file)

        return (
            <tr key={file.path}>
                <td>                    {name}                </td>
                <td>{directory}</td>
                <td>
                    {Status[workingDir] || workingDir}
                </td>
                <td>
                    <button
                        type='button'
                        onClick={() => withSound(this.props.state.declineFile(file))}>
                        Decline
                    </button>
                </td>
            </tr>
        )
    }

    private splitFileName(file: FileStatusResult): { name: string, directory: string } {
        const parts = file.path.split('/')

        return {
            name: parts.pop() || '',
            directory: parts.join('/')
        }
    }
})

const Commit = observer(class extends React.Component<RepositoryProps> {
    public render(): ReactElement {
        const {state} = this.props;

        return (
            <form onSubmit={this.submitHandler.bind(this)}>
                <h3>Commit</h3>
                <input
                    type="text"
                    value={state.commitMessageStorage.getValue()}
                    onChange={(event) => state.commitMessageStorage.setValue(event.target.value)}
                    required={true}/>
                <button type='submit'>
                    Commit
                </button>
                <Toggle label={'AdditionalSettings'}>
                    <div>
                        <label>
                            <input
                                type="checkbox"
                                checked={state.stageAllFilesBeforeCommit.isChecked}
                                onChange={(): void => state.stageAllFilesBeforeCommit.toggle()}/>
                            Stage all files
                        </label>
                        <input
                            type="text"
                            value={state.precommitCommandStorage.getValue()}
                            onChange={(event) => state.precommitCommandStorage.setValue(event.target.value)}/>
                    </div>
                </Toggle>
            </form>
        );
    }

    private submitHandler(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault()
        withSound(this.props.state.commit())
    }
})

const Repository = observer((props: { repository: RepositoryState }): ReactElement => {
    const {repository} = props

    useEffect((): () => void => {
        const id = setInterval((): void => {
            repository.statusLoader.calculateAgo()
            repository.fetchLoader.calculateAgo()
        }, 1000)

        return (): void => {
            clearInterval(id)
        }
    })

    const {status} = repository
    const {branches} = repository

    if (!status || !branches) {
        return (
            <div>
                Loading...
            </div>
        )
    }

    return (
        <div>
            <div>
                <h2>Repository</h2>
                <button onClick={() => withSound(repository.fetch())}>
                    Fetch {getCalledAgo(repository.fetchLoader.ago)}
                </button>
                <button onClick={() => withSound(repository.loadStatus())}>
                    Status {getCalledAgo(repository.statusLoader.ago)}
                </button>
            </div>
            <Branches state={repository} status={status} branches={branches}/>
            <Commit state={repository} status={status} branches={branches}/>
            <Files state={repository} status={status} branches={branches}/>
        </div>
    )
})

function getCalledAgo(ago: number | null): string {
    if (null === ago) {
        return ''
    }

    const totalMinutes = Math.floor(ago / 60 / 1000)
    const hours = Math.floor(totalMinutes / 60)
    const timeParts = []

    if (0 !== hours) {
        timeParts.push(`${hours}h`)
    }

    timeParts.push(`${totalMinutes % 60}m`)

    return `(${timeParts.join(' ')} ago)`
}

const state = new class {
    private readonly repositoryPathStorage = new LocalStorage<string | null>(LocalStorageKey.RepositoryPath, null)
    public repository: RepositoryState | null = null

    public constructor() {
        makeAutoObservable(this)
    }

    public loadRepository(): void {
        this.repository = new RepositoryState()
    }
}()

const App = observer((): ReactElement => {
    const {repository} = state

    if (null === repository) {
        return (
            <div></div>
        )
    }

    return (
        <div>
            <Repository repository={repository}/>
        </div>
    )
})

export default App;

state.repository = new RepositoryState()
