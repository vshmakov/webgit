import {observer} from "mobx-react";
import {BranchProps} from "./BranchProps";
import {IndexProps} from "./IndexProps";
import {RepositoryProps} from "../Repository/RepositoryProps";
import React, {ReactElement} from "react";
import {isCurrent} from "./IsCurrent";
import {withSound} from "../Util/WithSound";

export const CheckoutRadio = observer(({
                                           branch,
                                           index,
                                           repository
                                       }: BranchProps & IndexProps & RepositoryProps): ReactElement => {
    const branchNumber = index + 1

    return (
        <input
            type="radio"
            name="current-branch"
            checked={isCurrent(branch, repository.status)}
            onChange={() => withSound(repository.checkout(branch.name))}
            accessKey={branchNumber <= 9 ? branchNumber.toString() : undefined}
            disabled={repository.isDisabled.isChecked}/>
    )
})
