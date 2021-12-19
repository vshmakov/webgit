import {observer} from "mobx-react";
import React, {ReactElement} from "react";
import {LoadedRepositoryProps} from "../Repository/LoadedRepositoryProps";
import {withSound} from "../Util/WithSound";
import {isCurrent} from "./IsCurrent";
import {HideButton} from "./HideButton";
import {MergeBranchIntoCurrentButton} from "./MergeBranchIntoCurrentButton";
import {getTracking} from "./GetTracking";
import {BranchProps} from "./BranchProps";
import {canMergeTracking} from "./CanMergeTracking";
import {MergeTrackingButton} from "./MergeTrackingButton";
import {canPush} from "./CanPush";
import {PushButton} from "./PushButton";

interface Props extends BranchProps, LoadedRepositoryProps {
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
                    {canMergeTracking(branch, status) ? <MergeTrackingButton repository={repository}/> : null}
                    {canPush(branch, status) ? <PushButton repository={repository} status={status}/> : null}
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
})
