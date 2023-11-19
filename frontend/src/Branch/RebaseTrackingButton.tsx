import {observer} from "mobx-react";
import React, {ReactElement} from "react";
import {RepositoryProps} from "../Repository/RepositoryProps";
import {withSound} from "../Util/WithSound";

export const RebaseTrackingButton = observer(({repository}: RepositoryProps): ReactElement => {
    return <button
        type="button"
        onClick={() => withSound(repository.rebaseTrackingBranch())}
        accessKey="r">
        Rebase tracking
    </button>;
})
