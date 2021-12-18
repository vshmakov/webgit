import {observer} from "mobx-react";
import {State} from "./State";
import React, {ReactElement} from "react";
import {useNavigate} from "react-router-dom";
import {getPathUrl} from "./Util/GetPathUrl";
import {getFilePathParts} from "./File/GetFilePathParts";
import {capitalizeFirstLetter} from "./String/CapitalizeFirstLetter";

export const RepositoryPath = observer(({path, state}: { path: string, state: State }): ReactElement => {
    const navigate = useNavigate()
    const {name, directory} = getFilePathParts(path)

    return (
        <tr>
            <td>
                <input
                    type="radio"
                    checked={path === state.currentRepositoryPathStorage.getValue()}
                    onChange={() => navigate(getPathUrl(path))}/>
            </td>
            <td>{capitalizeFirstLetter(name)}</td>
            <td>{directory}</td>
            <td>
                <button type='button' onClick={() => state.removeRepositoryPath(path)}>
                    Remove
                </button>
            </td>
        </tr>
    )
})
