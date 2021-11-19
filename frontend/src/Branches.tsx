import {observer} from "mobx-react";
import React, {ReactElement} from "react";
import {LoadedRepositoryProps} from "./LoadedRepositoryProps";
import {Toggle} from "./Toggle";
import {preventDefault} from "./PreventDefault";
import {withSound} from "./WithSound";
import {BranchSummaryBranch} from "simple-git";

export const Branches = observer(class extends React.Component<LoadedRepositoryProps> {
    public render(): ReactElement {
        const {repository, branches} = this.props

        return (
            <div>
                <h3>Branches</h3>
                <form>
                    <label key={JSON.stringify(repository)}>
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
                </form>
                <Toggle label='Create' flag={repository.isBranchCreation}>
                    <form onSubmit={preventDefault(() => withSound(repository.createBranch()))}>
                        <input
                            type="text"
                            value={repository.newBranchName}
                            onChange={(event) => repository.newBranchName = event.target.value}
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

    private getCreateBitbucketPullRequestLink(branch: BranchSummaryBranch): ReactElement | null {
        if (branch.name !== this.props.status.current) {
            return null
        }

        const path = this.props
            .repository
            .bitbucketRepositoryPathStorage
            .getValue()

        if (null === path) {
            return null
        }

        return (
            <a href={`${path}/pull-requests/new?source=${branch.name}&t=1`} role='button'>
                Create bitbucket pull request
            </a>
        )
    }

    private renderBranch(branch: BranchSummaryBranch, index: number): ReactElement {
        const {repository} = this.props

        return (
            <tr key={branch.name}>
                <td>
                    <input
                        type='radio'
                        name='current-branch'
                        checked={this.isCurrentBranch(branch)}
                        onChange={() => withSound(this.props.repository.checkoutBranch(branch))}
                        accessKey={(index + 1).toString()}
                        disabled={repository.isDisabled.isChecked}/>
                </td>
                <td>
                    {repository.getBranchName(branch)} {this.getTracking(branch)}
                </td>
                <td>
                    {this.getMergeIntoCurrentButton(branch)}
                    {this.getMergeTrackingButton(branch)}
                    {this.getPushButton(branch)}
                    {this.getHideButton(branch)}
                    {this.getCreateBitbucketPullRequestLink(branch)}
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

        const {repository} = this.props

        return (
            <button
                type='button'
                onClick={() => withSound(repository.mergeBranchIntoCurrent(branch))}
                accessKey={this.isPreviousBranch(branch) ? 'm' : undefined}>
                Merge into {repository.status?.current}
            </button>
        )
    }

    private isPreviousBranch(branch: BranchSummaryBranch): boolean {
        const history = this.props
            .branches
            .historyStorage
            .getValue();
        const index = history.indexOf(branch.name)

        if (-1 === index) {
            return false
        }

        return index === history.length - 2
    }

    private getPushButton(branch: BranchSummaryBranch): ReactElement | null {
        if (!this.canPush(branch)) {
            return null
        }

        const {repository, status} = this.props

        return (
            <button type='button' onClick={() => withSound(repository.push())} accessKey='p'>
                Push {null === status.tracking ? 'with upstream' : null}
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

        const {repository} = this.props

        return (
            <button type='button' onClick={() => withSound(repository.mergeTrackingBranch())} accessKey='l'>
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
