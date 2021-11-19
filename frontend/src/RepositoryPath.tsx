import {observer} from "mobx-react";
import {State} from "./State";
import React, {ReactElement} from "react";
import { useNavigate} from "react-router-dom";

export const RepositoryPath = observer(({path, state}: { path: string, state: State }): ReactElement => {
    const navigate = useNavigate()

    return (
        <tr>
            <td>
                <input
                    type="radio"
                    checked={path === state.currentRepositoryPathStorage.getValue()}
                    onChange={() => navigate(`?path=${encodeURIComponent(path)}`)}/>
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
