import {observer} from "mobx-react";
import React, {ReactElement} from "react";
import {BranchProps} from "./BranchProps";
import {RepositoryProps} from "../Repository/RepositoryProps";

export const HideButton = observer(({branch, repository}: BranchProps & RepositoryProps): ReactElement => {
    const {branches} = repository

    return (
        <button type="button" onClick={(): void => branches.toggleHide(branch.name)}>
            {!branches.hiddenStorage.getValue().includes(branch.name) ? "Hide" : "Show"}
        </button>
    )
})
