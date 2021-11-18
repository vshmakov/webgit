import {observer} from "mobx-react";
import {State} from "./State";
import React, {ReactElement, useState} from "react";
import {compareAlphabetically} from "./CompareAlphabetically";
import {RepositoryPath} from "./RepositoryPath";
import {Toggle} from "./Toggle";
import {preventDefault} from "./PreventDefault";
import {setInputValue} from "./SetInputValue";

export const SwitchRepository = observer(({state}: { state: State }): ReactElement => {
    const [path, setPath] = useState('')
    const paths = state.repositoryPathsStorage
        .getValue()
        .slice()
        .sort(compareAlphabetically)
        .map((path: string): ReactElement => <RepositoryPath path={path} state={state} key={path}/>)

    return (
        <Toggle label='Switch repository'>
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
                <table>
                    <thead>
                    <tr>
                        <th></th>
                        <th>Path</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {paths}
                    </tbody>
                </table>
            </form>
        </Toggle>
    )
})
