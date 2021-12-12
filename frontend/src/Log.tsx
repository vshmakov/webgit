import {observer} from "mobx-react";
import React, {ReactElement} from "react";
import {DefaultLogFields} from "simple-git";

interface Props {
    log: DefaultLogFields
}

export const Log = observer(({log}: Props): ReactElement => {
    return (
        <tr>
            <td>{log.message}</td>
            <td>{log.author_name}</td>
            <td>{log.date}</td>
        </tr>
    )
})
