import {observer} from "mobx-react";
import React, {ReactElement} from "react";
import {withSound} from "../Util/WithSound";
import {BranchProps} from "./BranchProps";
import {RepositoryProps} from "../Repository/RepositoryProps";

export const RebaseCurrentToBranch = observer(({
                                                          branch,
                                                          repository,
                                                      }: BranchProps & RepositoryProps): ReactElement => {
    const {status} = repository

    return (
        <button
            type="button"
            onClick={() => withSound(repository.rebaseCurrentToBranch(branch))}
            accessKey="b">
            Rebase {status.current} to
        </button>
    )
})
