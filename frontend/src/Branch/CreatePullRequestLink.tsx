import {observer} from "mobx-react";
import React, {ReactElement} from "react";
import {BranchProps} from "./BranchProps";

interface Props extends BranchProps {
    url: string,
}

export const CreatePullRequestLink = observer(({url, branch}: Props): ReactElement => {
    return (
        <a href={url}>
            Create pull request
        </a>
    )
})
