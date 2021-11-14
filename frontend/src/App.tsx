import React, {FormEvent, useEffect} from 'react';
import './App.css';
import {makeAutoObservable} from "mobx"
import {observer} from "mobx-react"
import {BranchSummary, BranchSummaryBranch, StatusResult} from "simple-git";
import {FileStatusResult} from "simple-git/typings/response";

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

async function request(path: string, method: 'get' | 'put', body: any = null): Promise<Response> {
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

class State {
    public status: StatusResult | null = null
    public branchSummary: BranchSummary | null = null
    public showHiddenBranches: Flag = new Flag(false)
    public stageAllFilesBeforeCommit: Flag = new Flag(true)
    public hiddenBranchesStorage: LocalStorage<string[]> = new LocalStorage<string[]>('hidden-branches-v2', [])
    public commitMessageStorage: LocalStorage<string> = new LocalStorage<string>('commit-message-v1', '')


    public constructor() {
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

    public get files(): FileStatusResult[] {
        const status = this.status

        if (null === status) {
            return []
        }

        return status.files
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
        if (null === this.branchSummary) {
            return []
        }

        return Object.values(this.branchSummary.branches)
            .filter((branch: BranchSummaryBranch): boolean => !branch.name.startsWith('remotes/origin/'))
    }

    public async loadStatus(): Promise<void> {
        const response = await fetch('/status')
        this.setStatus(await response.json());
    }

    private setStatus(status: StatusResult): void {
        this.status = status
    }

    public async loadBranches(): Promise<void> {
        const loadStatus = this.loadStatus()
        const response = await fetch('/branches')
        await loadStatus
        this.setBranchSummary(await response.json());
    }

    private setBranchSummary(branchSummary: any): void {
        this.branchSummary = branchSummary
    }

    public async fetch(): Promise<void> {
        await request('/fetch', 'put')
        await this.loadStatus()
    }

    public async commit(): Promise<void> {
        await request('/commit', 'put', {
            message: this.commitMessageStorage.getValue(),
            stage: this.stageAllFilesBeforeCommit.isChecked,
        })
        await this.loadStatus()
    }

    public async checkoutBranch(branch: BranchSummaryBranch): Promise<void> {
        await request('/branch/checkout', 'put', branch)
        await this.loadStatus()
    }

    public async mergeBranchIntoCurrent(branch: BranchSummaryBranch): Promise<void> {
        await request('/branch/merge-into-current', 'put', branch)
        await this.loadStatus()
    }

    public async checkoutFile(file: FileStatusResult): Promise<void> {
        await request('/file/checkout', 'put', file)
        await this.loadStatus()
    }

    public async mergeTrackingBranch(): Promise<void> {
        await request('/branch/merge-tracking', 'put')
        await this.loadStatus()
    }

    public async push(): Promise<void> {
        await request('/branch/push', 'put')
        await this.loadStatus()
    }
}

const state = new State()

const Branches = observer(class extends React.Component<{ state: State }> {
    public render() {
        const {state} = this.props;

        return (
            <form>
                <h2>Branches</h2>
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
        )
            ;
    }

    private renderBranch(branch: BranchSummaryBranch) {
        return (
            <tr key={branch.name}>
                <td>
                    <input
                        type='radio'
                        name='current-branch'
                        checked={this.isCurrentBranch(branch)}
                        onChange={() => this.props.state.checkoutBranch(branch)}/>
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

    private getMergeIntoCurrentButton(branch: BranchSummaryBranch) {
        if (this.isCurrentBranch(branch)) {
            return null
        }

        return (
            <button type='button' onClick={() => state.mergeBranchIntoCurrent(branch)}>
                Merge into {this.props.state.status?.current}
            </button>
        )
    }

    private getPushButton(branch: BranchSummaryBranch) {
        if (!this.canPush(branch)) {
            return null
        }

        return (
            <button type='button' onClick={() => state.push()}>
                Push
            </button>
        )
    }

    private canPush(branch: BranchSummaryBranch): boolean {
        const status = this.props.state.status

        return null !== status
            && this.isCurrentBranch(branch)
            && null !== status.tracking
            && 0 !== status.ahead
    }

    private getMergeTrackingButton(branch: BranchSummaryBranch) {
        if (!this.canMergeTrackingBranch(branch)) {
            return null
        }

        return (
            <button type='button' onClick={() => state.mergeTrackingBranch()}>
                Merge tracking
            </button>
        )
    }

    private canMergeTrackingBranch(branch: BranchSummaryBranch): boolean {
        const status = this.props.state.status

        return null !== status
            && this.isCurrentBranch(branch)
            && null !== status.tracking
            && 0 !== status.behind
    }

    private isCurrentBranch(branch: BranchSummaryBranch): boolean {
        return branch.name === this.props.state.status?.current
    }

    private getTracking(branch: BranchSummaryBranch): string {
        const status = this.props.state.status

        if (null === status || !this.isCurrentBranch(branch)) {
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
    public render() {
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
                    {state.files.map(this.renderFile.bind(this))}
                    </tbody>
                </table>
            </div>
        )
            ;
    }

    private renderFile(file: FileStatusResult) {
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
                        onClick={() => this.props.state.checkoutFile(file)}>
                        Decline
                    </button>
                </td>
            </tr>
        )
    }
})

const Commit = observer(class extends React.Component<{ state: State }> {
    public render() {
        const {state} = this.props;

        return (
            <form onSubmit={this.submitHandler.bind(this)}>
                <h2>Commit</h2>
                <label>
                    <input
                        type="checkbox"
                        checked={state.stageAllFilesBeforeCommit.isChecked}
                        onChange={(): void => state.stageAllFilesBeforeCommit.toggle()}/>
                    Stage all files
                </label>
                <input
                    type="text"
                    value={state.commitMessageStorage.getValue()}
                    onChange={(event) => state.commitMessageStorage.setValue(event.target.value)}
                    required={true}/>
                <button type='submit'>
                    Commit
                </button>
            </form>
        );
    }

    private submitHandler(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault()
        this.props.state.commit()
    }
})

function App() {
    useEffect((): void => {
        state.loadBranches()
    })
    useEffect(() => {
        const handle = setInterval((): void => {
            state.fetch()
        }, 2 * 60 * 1000)

        return (): void => {
            clearInterval(handle)
        }
    })

    return (
        <div>
            <h1>Repository</h1>
            <Branches state={state}/>
            <Commit state={state}/>
            <Files state={state}/>
        </div>
    );
}

export default App;