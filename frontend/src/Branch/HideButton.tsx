import {observer} from "mobx-react";
import React, {ReactElement} from "react";
import {BranchesProps} from "./BranchesProps";
import {BranchProps} from "./BranchProps";

export const HideButton = observer(({branch, branches}: BranchProps & BranchesProps): ReactElement => {
    return (
        <button type="button" onClick={(): void => branches.toggleHide(branch.name)}>
            {!branches.hiddenStorage.getValue().includes(branch.name) ? "Hide" : "Show"}
        </button>
    )
})
