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
import {CreateBitbucketPullRequestLink} from "./CreateBitbucketPullRequestLink";
import {IndexProps} from "./IndexProps";
import {CheckoutRadio} from "./CheckoutRadio";
import {RepositoryProps} from "../Repository/RepositoryProps";
import {isPrevious} from "./IsPrevious";

export const Branch = observer(({
                                    branch,
                                    index,
                                    repository
                                }: BranchProps & IndexProps & RepositoryProps): ReactElement => {
    const {status, branches} = repository
    const path = repository.bitbucketRepositoryPathStorage.getValue()

    return (
        <tr>
            <td>
                <CheckoutRadio branch={branch} index={index} repository={repository}/>
            </td>
            <td>
                {repository.getBranchName(branch)} {getTracking(branch, status)}
            </td>
            <td>
                {isCurrent(branch, status) && '' !== path && branches.showHidden.isChecked
                    ? <CreateBitbucketPullRequestLink bitbucketRepositoryPath={path} branch={branch}/>
                    : null}
                {branches.showHidden.isChecked ? <HideButton branch={branch} repository={repository}/> : null}
                {isPrevious(branch, branches) ?
                    <MergeBranchIntoCurrentButton branch={branch} repository={repository}/>
                    : null}
                {canMergeTracking(branch, status) ? <MergeTrackingButton repository={repository}/> : null}
                {canPush(branch, status) ? <PushButton repository={repository}/> : null}
            </td>
        </tr>
    )
})
