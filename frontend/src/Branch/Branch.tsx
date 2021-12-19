import {observer} from "mobx-react";
import React, {ReactElement} from "react";
import {LoadedRepositoryProps} from "../Repository/LoadedRepositoryProps";
import {withSound} from "../Util/WithSound";
import {BranchSummaryBranch} from "simple-git";

interface Props extends LoadedRepositoryProps {
    branch: BranchSummaryBranch
    index: number
}

export const Branch = observer(class extends React.Component<Props> {
    public render(): ReactElement {
        const {repository, branch, index} = this.props
        const branchNumber = index + 1

        return (
            <tr>
                <td>
                    <input
                        type='radio'
                        name='current-branch'
                        checked={this.isCurrentBranch()}
                        onChange={() => withSound(repository.checkoutBranch(branch))}
                        accessKey={branchNumber <= 9 ? branchNumber.toString() : undefined}
                        disabled={repository.isDisabled.isChecked}/>
                </td>
                <td>
                    {repository.getBranchName(branch)} {this.getTracking()}
                </td>
                <td>
                    {this.getHideButton()}
                    {this.getMergeIntoCurrentButton()}
                    {this.getMergeTrackingButton()}
                    {this.getPushButton()}
                    {this.getCreateBitbucketPullRequestLink()}
                </td>
            </tr>
        )
    }

    private getCreateBitbucketPullRequestLink(): ReactElement | null {
        const {branch, status, repository} = this.props

        if (branch.name !== status.current) {
            return null
        }

        const path = repository.bitbucketRepositoryPathStorage.getValue()

        if ('' === path) {
            return null
        }

        return (
            <a href={`${path}/pull-requests/new?source=${branch.name}&t=1`} role='button'>
                Create bitbucket pull request
            </a>
        )
    }

    private getHideButton(): ReactElement | null {
        const {branch, branches} = this.props

        if (!branches.showHidden.isChecked) {
            return null
        }

        return (
            <button type='button' onClick={(): void => branches.toggleHide(branch.name)}>
                {!branches.hiddenStorage.getValue().includes(branch.name) ? 'Hide' : 'Show'}
            </button>
        )
    }

    private getMergeIntoCurrentButton(): ReactElement | null {
        if (this.isCurrentBranch()) {
            return null
        }

        const {branch, repository, status} = this.props

        return (
            <button
                type='button'
                onClick={() => withSound(repository.mergeBranchIntoCurrent(branch))}
                accessKey={this.isPreviousBranch() ? 'm' : undefined}>
                Merge into {status.current}
            </button>
        )
    }

    private isPreviousBranch(): boolean {
        const {branch, branches} = this.props
        const history = branches.historyStorage.getValue();
        const index = history.indexOf(branch.name)

        if (-1 === index) {
            return false
        }

        return index === history.length - 2
    }

    private getPushButton(): ReactElement | null {
        if (!this.canPush()) {
            return null
        }

        const {repository, status} = this.props

        return (
            <button type='button' onClick={() => withSound(repository.push())} accessKey='p'>
                Push {null === status.tracking ? 'with upstream' : null}
            </button>
        )
    }

    private canPush(): boolean {
        const {status} = this.props

        const hasAheadCommits = null !== status.tracking
            && 0 !== status.ahead

        return this.isCurrentBranch()
            && (null === status.tracking || hasAheadCommits)
    }

    private getMergeTrackingButton(): ReactElement | null {
        if (!this.canMergeTrackingBranch()) {
            return null
        }

        const {repository} = this.props

        return (
            <button type='button' onClick={() => withSound(repository.mergeTrackingBranch())} accessKey='l'>
                Merge tracking
            </button>
        )
    }

    private canMergeTrackingBranch(): boolean {
        const {status} = this.props

        return this.isCurrentBranch()
            && null !== status.tracking
            && 0 !== status.behind
    }

    private isCurrentBranch(): boolean {
        const {branch, status} = this.props

        return branch.name === status.current
    }

    private getTracking(): string {
        const {status} = this.props

        if (!this.isCurrentBranch()) {
            return ''
        }

        const parts = []

        if (0 !== status.ahead) {
            parts.push(`${status.ahead} ->`)
        }

        if (0 !== status.behind) {
            parts.push(`<- ${status.behind}`)
        }

        if (null !== status.tracking) {
            parts.push(`(${status.tracking})`)
        }

        return parts.join(' ')
    }
})
