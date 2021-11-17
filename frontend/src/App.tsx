import React, {ReactElement, useEffect} from 'react';
import './App.css';
import {makeAutoObservable} from "mobx"
import {observer} from "mobx-react"
import {BranchSummaryBranch} from "simple-git";
import {FileStatusResult} from "simple-git/typings/response";
import {withSound} from "./WithSound";
import {LocalStorage} from "./LocalStorage";
import {LocalStorageKey} from "./LocalStorageKey";
import {StatusSummary} from "simple-git/src/lib/responses/StatusSummary";
import {BranchesState} from "./BranchesState";
import {RepositoryState} from "./RepositoryState";
import {Toggle} from "./Toggle";
import {getCalledAgo} from "./GetCalledAgo";
import {onSubmit} from "./OnSubmit";

interface RepositoryProps {
    state: RepositoryState
    status: StatusSummary
    branches: BranchesState
}

const Branches = observer(class extends React.Component<RepositoryProps> {
    public render(): ReactElement {
        const {state, branches, status} = this.props

        return (
            <div>
                <h3>Branches</h3>
                <Toggle label='Create' flag={state.isBranchCreation}>
                    <form onSubmit={onSubmit(() => withSound(state.createBranch()))}>
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
                        <Toggle label={`Create pull request for ${status.current}`}>
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
                Create
            </a>
        )
    }

    private renderBranch(branch: BranchSummaryBranch, index: number): ReactElement {
        return (
            <tr key={branch.name}>
                <td>
                    <input
                        type='radio'
                        name='current-branch'
                        checked={this.isCurrentBranch(branch)}
                        onChange={() => withSound(this.props.state.checkoutBranch(branch))}
                        accessKey={(index + 1).toString()}/>
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
            <button type='button' onClick={() => withSound(state.push())} accessKey='p'>
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
            <button type='button' onClick={() => withSound(state.mergeTrackingBranch())} accessKey='l'>
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
            <form onSubmit={onSubmit(() => withSound(state.commit()))}>
                <h3>Commit</h3>
                <input
                    type="text"
                    value={state.commitMessageStorage.getValue()}
                    onChange={(event) => state.commitMessageStorage.setValue(event.target.value)}
                    required={true}
                    accessKey='c'/>
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

    const {status, branches} = repository

    if (null === status || null === branches
    ) {
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
                <button onClick={() => withSound(repository.fetch())} accessKey='t'>
                    Fetch {getCalledAgo(repository.fetchLoader.ago)}
                </button>
                <button onClick={() => withSound(repository.loadStatus())} accessKey='s'>
                    Status {getCalledAgo(repository.statusLoader.ago)}
                </button>
            </div>
            <Branches state={repository} status={status} branches={branches}/>
            <Commit state={repository} status={status} branches={branches}/>
            <Files state={repository} status={status} branches={branches}/>
        </div>
    )
})

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
