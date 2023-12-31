import {observer} from "mobx-react";
import React, {ReactElement} from "react";
import {isCurrent} from "./IsCurrent";
import {HideButton} from "./HideButton";
import {MergeBranchIntoCurrentButton} from "./MergeBranchIntoCurrentButton";
import {getTracking} from "./GetTracking";
import {BranchProps} from "./BranchProps";
import {canMergeTracking} from "./CanMergeTracking";
import {MergeTrackingButton} from "./MergeTrackingButton";
import {canPush} from "./CanPush";
import {PushButton} from "./PushButton";
import {CreatePullRequestLink} from "./CreatePullRequestLink";
import {IndexProps} from "./IndexProps";
import {CheckoutRadio} from "./CheckoutRadio";
import {RepositoryProps} from "../Repository/RepositoryProps";
import {isPrevious} from "./IsPrevious";
import {RebaseTrackingButton} from "./RebaseTrackingButton";
import {RebaseCurrentToBranch} from "./RebaseCurrentToBranch";

export const Branch = observer(({
                                    branch,
                                    index,
                                    repository
                                }: BranchProps & IndexProps & RepositoryProps): ReactElement => {
    const {status, branches} = repository
    const url = repository.remoteState.getCreatePullRequestUrl(branch)

    return (
        <tr>
            <td>
                <CheckoutRadio branch={branch} index={index} repository={repository}/>
            </td>
            <td>
                {repository.getBranchName(branch)}
                {' ' + getTracking(branch, status)}
            </td>
            <td>
                {isCurrent(branch, status) && null !== url && branches.showHidden.isChecked
                    ? <CreatePullRequestLink url={url} branch={branch}/>
                    : null}
                {branches.showHidden.isChecked ? <HideButton branch={branch} repository={repository}/> : null}
                {isPrevious(branch, branches) ? [
                    <RebaseCurrentToBranch branch={branch} repository={repository}/>,
                    <MergeBranchIntoCurrentButton branch={branch} repository={repository}/>,
                ] : null}
                {canMergeTracking(branch, status) ? [
                    <RebaseTrackingButton repository={repository}/>,
                    <MergeTrackingButton repository={repository}/>,
                ] : null}
                {canPush(branch, status) ? <PushButton repository={repository}/> : null}
            </td>
        </tr>
    )
})
