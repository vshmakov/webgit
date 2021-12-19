import {observer} from "mobx-react";
import React, {ReactElement} from "react";
import {BranchSummaryBranch} from "simple-git";
import {BranchesState} from "./BranchesState";

interface Props {
    branch: BranchSummaryBranch
    branches: BranchesState
}

export const HideButton = observer(({branch, branches}: Props): ReactElement => {
    return (
        <button type="button" onClick={(): void => branches.toggleHide(branch.name)}>
            {!branches.hiddenStorage.getValue().includes(branch.name) ? "Hide" : "Show"}
        </button>
    )
})
