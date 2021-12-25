import {observer} from "mobx-react";
import React, {ReactElement} from "react";
import {isPrevious} from "./IsPrevious";
import {withSound} from "../Util/WithSound";
import {BranchProps} from "./BranchProps";
import {RepositoryProps} from "../Repository/RepositoryProps";

export const MergeBranchIntoCurrentButton = observer(({
                                                          branch,
                                                          repository,
                                                      }: BranchProps & RepositoryProps): ReactElement => {
    const {status, branches} = repository

    return (
        <button
            type="button"
            onClick={() => withSound(repository.mergeBranchIntoCurrent(branch))}
            accessKey={isPrevious(branch, branches) ? "m" : undefined}>
            Merge into {status.current}
        </button>
    )
})
