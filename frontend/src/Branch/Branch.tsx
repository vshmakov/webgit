import {observer} from "mobx-react";
import React, {ReactElement} from "react";
import {LoadedRepositoryProps} from "../Repository/LoadedRepositoryProps";
import {withSound} from "../Util/WithSound";
import {BranchSummaryBranch} from "simple-git";
import {isCurrent} from "./IsCurrent";
import {HideButton} from "./HideButton";
import {MergeBranchIntoCurrentButton} from "./MergeBranchIntoCurrentButton";
import {getTracking} from "./GetTracking";

interface Props extends LoadedRepositoryProps {
    branch: BranchSummaryBranch
    index: number
}

export const Branch = observer(class extends React.Component<Props> {
    public render(): ReactElement {
        const {repository, branches, branch, status, index} = this.props
        const branchNumber = index + 1

        return (
            <tr>
                <td>
                    <input
                        type='radio'
                        name='current-branch'
                        checked={isCurrent(branch, status)}
                        onChange={() => withSound(repository.checkoutBranch(branch))}
                        accessKey={branchNumber <= 9 ? branchNumber.toString() : undefined}
                        disabled={repository.isDisabled.isChecked}/>
                </td>
                <td>
                    {repository.getBranchName(branch)} {getTracking(branch, status)}
                </td>
                <td>
                    {branches.showHidden.isChecked ? <HideButton branch={branch} branches={branches}/> : null}
                    {!isCurrent(branch, status)
                        ? < MergeBranchIntoCurrentButton branch={branch} repository={repository} branches={branches}
                                                         status={status}/>
                        : null}
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
        const {branch, status} = this.props

        const hasAheadCommits = null !== status.tracking
            && 0 !== status.ahead

        return isCurrent(branch, status)
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
        const {branch, status} = this.props

        return isCurrent(branch, status)
            && null !== status.tracking
            && 0 !== status.behind
    }
})
