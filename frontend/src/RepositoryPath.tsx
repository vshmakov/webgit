import {observer} from "mobx-react";
import {State} from "./State";
import React, {ReactElement} from "react";

export const RepositoryPath = observer(({path, state}: { path: string, state: State }): ReactElement => {
    return (
        <tr>
            <td>
                <input
                    type="radio"
                    checked={path === state.currentRepositoryPathStorage.getValue()}
                    onChange={() => state.chooseRepository(path)}/>
            </td>
            <td>{path}</td>
            <td>
                <button type='button' onClick={() => state.removeRepositoryPath(path)}>
                    Remove
                </button>
            </td>
        </tr>
    )
})
