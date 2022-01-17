import {observer} from "mobx-react";
import React, {ReactElement} from "react";
import {DefaultLogFields} from "simple-git";
import {withSound} from "../../Util/WithSound";
import {RepositoryProps} from "../../Repository/RepositoryProps";

interface Props {
    log: DefaultLogFields
}

export const Log = observer(({log, repository}: Props & RepositoryProps): ReactElement => {
    const {status} = repository

    return (
        <tr>
            <td>{log.message}</td>
            <td>{log.author_name}</td>
            <td>{log.date}</td>
            <td>{log.hash}</td>
            <td>
                <button onClick={() => withSound(repository.checkout(log.hash))}>
                    Checkout
                </button>
            </td>
        </tr>
    )
})
