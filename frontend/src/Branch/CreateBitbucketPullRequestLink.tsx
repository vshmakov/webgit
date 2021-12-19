import {observer} from "mobx-react";
import React, {ReactElement} from "react";
import {BranchProps} from "./BranchProps";

interface Props extends BranchProps {
    bitbucketRepositoryPath: string,
}

export const CreateBitbucketPullRequestLink = observer(({bitbucketRepositoryPath, branch}: Props): ReactElement => {
    return (
        <a href={`${bitbucketRepositoryPath}/pull-requests/new?source=${branch.name}&t=1`}>
            Create bitbucket pull request
        </a>
    )
})
