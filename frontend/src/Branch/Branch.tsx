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
import {CreateBitbucketPullRequestLink} from "./CreateBitbucketPullRequestLink";
import {IndexProps} from "./IndexProps";

export const Branch = observer(({
                                    branch,
                                    index,
                                    repository,
                                    branches,
                                    status
                                }: BranchProps & IndexProps & LoadedRepositoryProps): ReactElement => {
    const branchNumber = index + 1
    const path = repository.bitbucketRepositoryPathStorage.getValue()

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
                {isCurrent(branch, status) && '' !== path
                    ? <CreateBitbucketPullRequestLink bitbucketRepositoryPath={path} branch={branch}/>
                    : null}
            </td>
        </tr>
    )
})
