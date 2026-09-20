import {observer} from "mobx-react";
import {State} from "../State";
import {ReactElement, useState} from "react";
import {RepositoryPath} from "./RepositoryPath";
import {Hidden} from "../Flag/Hidden";
import {preventDefault} from "../Util/PreventDefault";
import {setInputValue} from "../Util/SetInputValue";

export const SwitchRepository = observer(({state}: { state: State }): ReactElement => {
    const [path, setPath] = useState('')
    const paths = state.repositoryPathsStorage
        .getValue()
        .slice()
        .map((path: string): ReactElement => <RepositoryPath path={path} state={state} key={path}/>)

    return (
        <Hidden label='Switch repository' flag={state.switchingRepository}>
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
        </Hidden>
    )
})
