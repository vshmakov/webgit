import {observer} from "mobx-react";
import {BranchProps} from "./BranchProps";
import {IndexProps} from "./IndexProps";
import {RepositoryProps} from "../Repository/RepositoryProps";
import React, {ReactElement} from "react";
import {isCurrent} from "./IsCurrent";
import {withSound} from "../Util/WithSound";
import {BranchSummaryBranch} from "simple-git";

export const CheckoutRadio = observer(({
                                           branch,
                                           index,
                                           repository
                                       }: BranchProps & IndexProps & RepositoryProps): ReactElement => {
    return (
        <input
            type="radio"
            name="current-branch"
            checked={isCurrent(branch, repository.status)}
            onChange={() => withSound(repository.checkout(branch.name))}
            accessKey={getAccessKey(branch, index)}
            disabled={repository.isDisabled.isChecked}/>
    )
})

function getAccessKey(branch: BranchSummaryBranch, index: number): string | undefined {
    if (['development'].includes(branch.name)) {
        return 'v'
    }

    const branchNumber = index + 1

    return branchNumber <= 9 ? branchNumber.toString() : undefined;
}
