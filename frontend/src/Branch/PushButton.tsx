import {observer} from "mobx-react";
import React, {ReactElement} from "react";
import {RepositoryProps} from "../Repository/RepositoryProps";
import {withSound} from "../Util/WithSound";

export const PushButton = observer(({repository}: RepositoryProps): ReactElement => {
    const {status} = repository

    return (
        <button
            type="button"
            onClick={() => withSound(repository.push())}
            accessKey="p">
            Push {null === status.tracking ? "with upstream" : null}
        </button>
    )
})
