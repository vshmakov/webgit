import {observer} from "mobx-react";
import React, {ReactElement} from "react";
import {RepositoryProps} from "../Repository/RepositoryProps";
import {withSound} from "../Util/WithSound";

export const RebaseWithTrackingButton = observer(({repository}: RepositoryProps): ReactElement => {
    return <button
        type="button"
        onClick={() => withSound(repository.rebaseTrackingBranch())}
        accessKey="r">
        Rebase with tracking
    </button>;
})
