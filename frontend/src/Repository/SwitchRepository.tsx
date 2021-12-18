import {observer} from "mobx-react";
import {State} from "../State";
import React, {ReactElement, useState} from "react";
import {compareAlphabetically} from "../Util/CompareAlphabetically";
import {RepositoryPath} from "./RepositoryPath";
import {Toggle} from "../Util/Toggle";
import {preventDefault} from "../Util/PreventDefault";
import {setInputValue} from "../Util/SetInputValue";
import {getFilePathParts} from "../File/GetFilePathParts";

export const SwitchRepository = observer(({state}: { state: State }): ReactElement => {
    const [path, setPath] = useState('')
    const paths = state.repositoryPathsStorage
        .getValue()
        .slice()
        .sort((path1: string, path2: string): number => compareAlphabetically(getFilePathParts(path1).name, getFilePathParts(path2).name))
        .map((path: string): ReactElement => <RepositoryPath path={path} state={state} key={path}/>)

    return (
        <Toggle label='Switch repository' flag={state.switchingRepository}>
            <div>
                <form onSubmit={preventDefault(() => {
                    state.addRepositoryPath(path);
                    setPath('')
                })}>
                    <input
                        type="text"
                        value={path}
                        onChange={setInputValue(setPath)}
                        required={true}/>
                    <button type="submit">
                        Add
                    </button>
                </form>
                <table>
                    <thead>
                    <tr>
                        <th></th>
                        <th>Repository</th>
                        <th>Directory</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {paths}
                    </tbody>
                </table>
            </div>
        </Toggle>
    )
})
