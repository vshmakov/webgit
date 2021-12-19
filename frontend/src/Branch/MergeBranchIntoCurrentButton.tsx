import {observer} from "mobx-react";
import React, {ReactElement} from "react";
import {isPrevious} from "./IsPrevious";
import {BranchSummaryBranch} from "simple-git";
import {LoadedRepositoryProps} from "../Repository/LoadedRepositoryProps";
import {withSound} from "../Util/WithSound";

interface Props extends LoadedRepositoryProps {
    branch: BranchSummaryBranch
}

export const MergeBranchIntoCurrentButton = observer(({branch, repository, branches, status}: Props): ReactElement => {
    return (
        <button
            type="button"
            onClick={() => withSound(repository.mergeBranchIntoCurrent(branch))}
            accessKey={isPrevious(branch, branches) ? "m" : undefined}>
            Merge into {status.current}
        </button>
    )
})
