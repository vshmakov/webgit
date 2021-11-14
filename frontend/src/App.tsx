import React, {FormEvent, ReactElement, useEffect} from 'react';
import './App.css';
import {makeAutoObservable} from "mobx"
import {observer} from "mobx-react"
import {BranchSummary, BranchSummaryBranch, StatusResult} from "simple-git";
import {FileStatusResult} from "simple-git/typings/response";

async function withAudio(promice: Promise<void>): Promise<void> {
    await promice
    const audio = new Audio('/audio.mp3')
    audio.volume = 0.5
    await audio.play()
}

class LocalStorage<T> {
    public constructor(private readonly key: string, private value: T) {
        const localStorageValue = localStorage.getItem(this.key)

        if (null !== localStorageValue) {
            this.value = JSON.parse(localStorageValue)
        }

        makeAutoObservable(this)
    }

    public getValue(): T {
        return this.value
    }

    public setValue(value: T): void {
        localStorage.setItem(this.key, JSON.stringify(value))
        this.value = value
    }
}

enum Method {
    Get = 'get',
    Post = 'post',
    Put = 'put',
}

async function request(method: Method, path: string, body: any = null): Promise<Response> {
    return fetch(path, {
        method: method,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: null !== body ? JSON.stringify(body) : null
    })
}

class Flag {
    public constructor(public isChecked: boolean) {
        makeAutoObservable(this)
    }

    public toggle(): void {
        this.isChecked = !this.isChecked
    }
}

async function getStatus(): Promise<StatusResult> {
    const response = await request(Method.Get, '/status')

    return await response.json();
}

async function getBranchSummary(): Promise<BranchSummary> {
    const response = await request(Method.Get, '/branches')

    return await response.json();
}

class State {
    public showHiddenBranches: Flag = new Flag(false)
    public stageAllFilesBeforeCommit: Flag = new Flag(true)
    public hiddenBranchesStorage: LocalStorage<string[]> = new LocalStorage<string[]>('hidden-branches-v2', [])
    public commitMessageStorage: LocalStorage<string> = new LocalStorage<string>('commit-message-v1', '')
    public precommitCommandStorage: LocalStorage<string> = new LocalStorage<string>('precommit-command-v1', '')
    public newBranchName: string = ''

    public constructor(
        public status: StatusResult,
        public branchSummary: BranchSummary,
    ) {
        makeAutoObservable(this)
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

        return this.localBranches
            .filter((branch: BranchSummaryBranch): boolean => this.showHiddenBranches.isChecked || !hiddenBranches.includes(branch.name))
            .sort((branch1: BranchSummaryBranch, branch2: BranchSummaryBranch): number => branch1.name.toLowerCase() < branch2.name.toLowerCase() ? -1 : 1)
    }

    public get hiddenBranches(): BranchSummaryBranch[] {
        const hiddenBranches = this.hiddenBranchesStorage.getValue()

        return this.localBranches
            .filter((branch: BranchSummaryBranch): boolean => hiddenBranches.includes(branch.name))
    }

    private get localBranches(): BranchSummaryBranch[] {
        return Object.values(this.branchSummary.branches)
            .filter((branch: BranchSummaryBranch): boolean => !branch.name.startsWith('remotes/origin/'))
    }

    public async loadStatus(): Promise<void> {
        this.setStatus(await getStatus())
    }

    private setStatus(status: StatusResult): void {
        this.status = status
    }

    public async loadBranches(): Promise<void> {
        const loadStatus = this.loadStatus()
        const branchSummary = await getBranchSummary()
        await loadStatus
        this.setBranchSummary(branchSummary)
    }

    private setBranchSummary(branchSummary: any): void {
        this.branchSummary = branchSummary
    }

    public async fetch(): Promise<void> {
        await request(Method.Put, '/fetch')
        await this.loadStatus()
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

    public async checkoutFile(file: FileStatusResult): Promise<void> {
        await request(Method.Put, '/file/checkout', file)
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

const Branches = observer(class extends React.Component<{ state: State }> {
    public render(): ReactElement {
        const {state} = this.props;

        return (
            <div>
                <h2>Branches</h2>
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
            </div>
        )
            ;
    }

    private submitHandler(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault()
        this.props.state.createBranch()
    }

    private renderBranch(branch: BranchSummaryBranch): ReactElement {
        const {state} = this.props

        return (
            <tr key={branch.name}>
                <td>
                    <input
                        type='radio'
                        name='current-branch'
                        checked={this.isCurrentBranch(branch)}
                        onChange={() => withAudio(this.props.state.checkoutBranch(branch))}/>
                </td>
                <td>
                    {branch.name} {this.getTracking(branch)}
                </td>
                <td>
                    {this.getMergeIntoCurrentButton(branch)}
                    {this.getMergeTrackingButton(branch)}
                    {this.getPushButton(branch)}
                    <button type='button' onClick={(): void => state.toggleHideBranch(branch.name)}>
                        {!state.hiddenBranchesStorage.getValue().includes(branch.name) ? 'Hide' : 'Show'}
                    </button>
                </td>
            </tr>
        )
    }

    private getMergeIntoCurrentButton(branch: BranchSummaryBranch): ReactElement | null {
        if (this.isCurrentBranch(branch)) {
            return null
        }

        const {state} = this.props

        return (
            <button type='button' onClick={() => withAudio(state.mergeBranchIntoCurrent(branch))}>
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
            <button type='button' onClick={() => withAudio(state.push())}>
                Push
            </button>
        )
    }

    private canPush(branch: BranchSummaryBranch): boolean {
        const {status} = this.props.state

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
            <button type='button' onClick={() => withAudio(state.mergeTrackingBranch())}>
                Merge tracking
            </button>
        )
    }

    private canMergeTrackingBranch(branch: BranchSummaryBranch): boolean {
        const {status} = this.props.state

        return this.isCurrentBranch(branch)
            && null !== status.tracking
            && 0 !== status.behind
    }

    private isCurrentBranch(branch: BranchSummaryBranch): boolean {
        return branch.name === this.props.state.status.current
    }

    private getTracking(branch: BranchSummaryBranch): string {
        const {status} = this.props.state

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

const Files = observer(class extends React.Component<{ state: State }> {
    public render(): ReactElement {
        const {state} = this.props;

        return (
            <div>
                <h2>Files</h2>
                <table>
                    <thead>
                    <tr>
                        <th>File</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {state.status.files.map(this.renderFile.bind(this))}
                    </tbody>
                </table>
            </div>
        )
            ;
    }

    private renderFile(file: FileStatusResult): ReactElement {
        enum Status {
            A = 'Added',
            D = 'Deleted',
            M = 'Modified',
        }

        const index = file.index as keyof typeof Status
        const workingDir = file.working_dir as keyof typeof Status

        return (
            <tr key={file.path}>
                <td>
                    {file.path}
                </td>
                <td>
                    {Status[index] || index} {Status[workingDir] || workingDir}
                </td>
                <td>
                    <button
                        type='button'
                        onClick={() => withAudio(this.props.state.checkoutFile(file))}>
                        Decline
                    </button>
                </td>
            </tr>
        )
    }
})

const Commit = observer(class extends React.Component<{ state: State }> {
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
        withAudio(this.props.state.commit())
    }
})

const initialState = new class {
    public state: State | null = null

    public constructor() {
        makeAutoObservable(this)
    }

    public async loadState(): Promise<void> {
        const status = getStatus()
        const branchSummary = getBranchSummary()
        this.setState(new State(await status, await branchSummary))
    }

    private setState(state: State): void {
        this.state = state
    }
}()

const App = observer((): ReactElement => {
    useEffect((): void => {
        initialState.loadState()
    })

    const {state} = initialState

    if (null === state) {
        return (
            <div>
                Loading...
            </div>
        )
    }

    return (
        <div>
            <h1>Repository</h1>
            <Branches state={state}/>
            <Commit state={state}/>
            <Files state={state}/>
        </div>
    )
})

export default App;
