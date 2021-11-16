import React, {FormEvent, ReactElement} from 'react';
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
    private calledAtStorage: LocalStorage<number | null> = new LocalStorage<number | null>(this.localStorageKey, null)
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

async function getStatus(): Promise<StatusResult> {
    const response = await request(Method.Get, '/status')

    return await response.json()
}

async function getBranchSummary(): Promise<BranchSummary> {
    const response = await request(Method.Get, '/branches')

    return await response.json()
}

async function fetchRemote(): Promise<void> {
    await request(Method.Put, '/fetch');
}

class RepositoryState {
    public status: StatusResult | null = null
    public showHiddenBranches: Flag = new Flag(false)
    public stageAllFilesBeforeCommit: Flag = new Flag(true)
    public hiddenBranchesStorage: LocalStorage<string[]> = new LocalStorage<string[]>(LocalStorageKey.HiddenBranches, [])
    public commitMessageStorage: LocalStorage<string> = new LocalStorage<string>(LocalStorageKey.CommitMessage, '')
    public precommitCommandStorage: LocalStorage<string> = new LocalStorage<string>(LocalStorageKey.PrecommitCommand, '')
    public newBranchName: string = ''

    public constructor(
        private branchSummary: BranchSummary,
        public readonly statusLoader: Loader<StatusResult>,
        public readonly fetchLoader: Loader<void>,
    ) {
        makeAutoObservable(this)
        this.loadStatus()
    }

    public toggleHideBranch(branch: string): void {
        let hiddenBranches = this.hiddenBranchesStorage.getValue()

        if (hiddenBranches.includes(branch)) {
            hiddenBranches = hiddenBranches.filter((hiddenBranch: string): boolean => branch !== hiddenBranch)
        } else {
            hiddenBranches.push(branch)
        }

        this.hiddenBranchesStorage.setValue(hiddenBranches)
    }

    public get sortedBranches(): BranchSummaryBranch[] {
        const hiddenBranches = this.hiddenBranchesStorage.getValue()

        return this.branches
            .filter((branch: BranchSummaryBranch): boolean => this.showHiddenBranches.isChecked || !hiddenBranches.includes(branch.name))
            .sort((branch1: BranchSummaryBranch, branch2: BranchSummaryBranch): number => branch1.name.toLowerCase() < branch2.name.toLowerCase() ? -1 : 1)
    }

    public get hiddenBranches(): BranchSummaryBranch[] {
        const hiddenBranches = this.hiddenBranchesStorage.getValue()

        return this.branches
            .filter((branch: BranchSummaryBranch): boolean => hiddenBranches.includes(branch.name))
    }

    private get branches(): BranchSummaryBranch[] {
        return Object.values(this.branchSummary.branches)
    }

    public async loadStatus(): Promise<void> {
        this.setStatus(await this.statusLoader.load())
    }

    private setStatus(status: StatusResult): void {
        this.status = status
    }

    public async loadBranches(): Promise<void> {
        const status = this.loadStatus()
        const branchSummary = getBranchSummary()
        this.setBranchSummary(await branchSummary)
        await status
    }

    private setBranchSummary(branchSummary: BranchSummary): void {
        this.branchSummary = branchSummary
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
        this.cleanNewBranchName();
    }

    private cleanNewBranchName() {
        this.newBranchName = ''
    }

    async fetch(): Promise<void> {
        await this.fetchLoader.load()
        await this.loadStatus()
    }
}

interface ToggleProps {
    label: string
    children: ReactElement
}

interface ToggleState {
    flag: Flag
}

const Toggle = observer(class extends React.Component<ToggleProps, ToggleState> {
    readonly state: ToggleState = {
        flag: new Flag(false)
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
}

const Branches = observer(class extends React.Component<RepositoryProps> {
    public render(): ReactElement {
        const {state} = this.props;

        return (
            <div>
                <h2>Branches</h2>
                <Toggle label='Create'>
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
                            checked={state.showHiddenBranches.isChecked}
                            onChange={(): void => state.showHiddenBranches.toggle()}/>
                        Show hidden ({state.hiddenBranches.length})
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
                        {state.sortedBranches.map(this.renderBranch.bind(this))}
                        </tbody>
                    </table>
                </form>
            </div>
        )
            ;
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
        const {state} = this.props

        if (!state.showHiddenBranches.isChecked) {
            return null
        }

        return (
            <button type='button' onClick={(): void => state.toggleHideBranch(branch.name)}>
                {!state.hiddenBranchesStorage.getValue().includes(branch.name) ? 'Hide' : 'Show'}
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
        const {state, status} = this.props;

        return (
            <div>
                <h2>Files</h2>
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
                <h2>Commit</h2>
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

const Repository = observer(class extends React.Component<RepositoryProps> {
    public render(): ReactElement {
        const {state} = this.props;

        return (
            <div>
                <h1>Repository</h1>
                <button onClick={() => withSound(state.fetch())}>
                    Fetch {this.getCalledAgo(state.fetchLoader.ago)}
                </button>
                <button onClick={() => withSound(state.loadStatus())}>
                    Status {this.getCalledAgo(state.statusLoader.ago)}
                </button>
            </div>
        );
    }

    private getCalledAgo(ago: number | null): string {
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
})

const state = new class {
    public repository: RepositoryState | null = null
    public readonly statusLoader: Loader<StatusResult> = new Loader<StatusResult>(LocalStorageKey.StatusCalledAt, getStatus)
    public readonly fetchLoader: Loader<void> = new Loader<void>(LocalStorageKey.FetchCalledAt, fetchRemote)

    public constructor() {
        makeAutoObservable(this)
    }

    public async loadRepository(): Promise<void> {
        const branchSummary = getBranchSummary()
        this.setRepository(new RepositoryState(
            await branchSummary,
            this.statusLoader,
            this.fetchLoader
        ))
    }

    private setRepository(repository: RepositoryState): void {
        this.repository = repository
    }
}()

const App = observer((): ReactElement => {
    const {repository} = state
    const status = repository?.status

    if (null === repository || !status) {
        return (
            <div>
                Loading...
            </div>
        )
    }

    return (
        <div>
            <Repository state={repository} status={status}/>
            <Branches state={repository} status={status}/>
            <Commit state={repository} status={status}/>
            <Files state={repository} status={status}/>
        </div>
    )
})

export default App;

state.loadRepository()

setInterval((): void => {
    state.statusLoader.calculateAgo()
    state.fetchLoader.calculateAgo()
}, 1000)
