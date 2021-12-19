import {observer} from "mobx-react";
import React, {ReactElement} from "react";
import {isPrevious} from "./IsPrevious";
import {withSound} from "../Util/WithSound";
import {BranchProps} from "./BranchProps";
import {LoadedRepositoryProps} from "../Repository/LoadedRepositoryProps";

export const MergeBranchIntoCurrentButton = observer(({
                                                          branch,
                                                          repository,
                                                          branches,
                                                          status
                                                      }: BranchProps & LoadedRepositoryProps): ReactElement => {
    return (
        <button
            type="button"
            onClick={() => withSound(repository.mergeBranchIntoCurrent(branch))}
            accessKey={isPrevious(branch, branches) ? "m" : undefined}>
            Merge into {status.current}
        </button>
    )
})
