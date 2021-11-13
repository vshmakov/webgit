import React, {useEffect} from 'react';
import './App.css';
import {makeAutoObservable} from "mobx"
import {observer} from "mobx-react"
import {BranchSummary, BranchSummaryBranch, StatusResult} from "simple-git";

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

class State {
    public status: StatusResult | null = null
    public branchSummary: BranchSummary | null = null
    public showHiddenBranches: boolean = false
    public hiddenBranchesStorage: LocalStorage<string[]> = new LocalStorage<string[]>('hidden-branches-v2', [])

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

    public toggleShowHiddenBranches(): void {
        this.showHiddenBranches = !this.showHiddenBranches
    }

    public get files(): string[] {
        return [
            'file1',
            'file2'
        ]
    }

    public get sortedBranches(): BranchSummaryBranch[] {
        const hiddenBranches = this.hiddenBranchesStorage.getValue()

        return this.localBranches
            .filter((branch: BranchSummaryBranch): boolean => this.showHiddenBranches || !hiddenBranches.includes(branch.name))
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
        await  loadStatus
        this.setBranchSummary(await response.json());
    }

    private setBranchSummary(branchSummary: any): void {
        this.branchSummary = branchSummary
    }

    public async checkoutBranch(branch: BranchSummaryBranch): Promise<void> {
        await fetch('/branch/checkout', {
            method: 'put',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(branch)
        })
        await this.loadBranches()
    }
}

const state = new State()

const Branches = observer(class extends React.Component<{ state: State }> {
    public render() {
        const {state} = this.props;

        return (
            <form>
                <label key={JSON.stringify(state)}>
                    <input
                        type="checkbox"
                        checked={state.showHiddenBranches}
                        onChange={(): void => state.toggleShowHiddenBranches()}/>
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
        );
    }

    private renderBranch(branch: BranchSummaryBranch) {
        return (
            <tr key={branch.name}>
                <td>
                    <input
                        type='radio'
                        name='current-branch'
                        checked={branch.current}
                        onChange={() => this.props.state.checkoutBranch(branch)}/>
                </td>
                <td>
                    {branch.name} {this.getTracking(branch)}
                </td>
                <td>
                    <button type='button' onClick={(): void => state.toggleHideBranch(branch.name)}>
                        {!state.hiddenBranchesStorage.getValue().includes(branch.name) ? 'Hide' : 'Show'}
                    </button>
                </td>
            </tr>
        )
    }

    private getTracking(branch: BranchSummaryBranch): string {
        const status = this.props.state.status

        if (null === status || branch.name !== status.current) {
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
            <form>
                <table>
                    <thead>
                    <tr>
                        <th>File</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {state.files.map(this.renderFile.bind(this))}
                    </tbody>
                </table>
            </form>
        );
    }

    private renderFile(file: string) {
        return (
            <tr key={file}>
                <td>
                    {file}
                </td>
                <td></td>
            </tr>
        )
    }
})

function App() {
    useEffect((): void => {
        state.loadBranches()
    })

    return (
        <div>
            <h1>Repository</h1>
            <h2>Branches</h2>
            <Branches state={state}/>
            <h2>Files</h2>
            <Files state={state}/>
        </div>
    );
}

export default App;
