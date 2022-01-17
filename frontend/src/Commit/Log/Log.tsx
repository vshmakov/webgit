import {observer} from "mobx-react";
import React, {ReactElement} from "react";
import {withSound} from "../../Util/WithSound";
import {RepositoryProps} from "../../Repository/RepositoryProps";
import {LogProps} from "./LogProps";
import {Message} from "./Message";

export const Log = observer(({log, repository}: LogProps & RepositoryProps): ReactElement => {
    return (
        <tr>
            <td>
                <Message log={log} repository={repository}/>
            </td>
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
