import React, {ReactElement} from 'react';
import './App.css';
import {observer} from "mobx-react"
import {Repository} from "./Repository";
import {State} from "./State";
import {SwitchRepository} from "./SwitchRepository";
import {useLocation} from "react-router-dom";

export const App = observer(({state}: { state: State }): ReactElement => {
    const location = useLocation()
state.setCurrentRepositoryPathFromParameter(location.search)
    const {repository} = state

    return (
        <div>
            <div>
                <h1>Webgit</h1>
                <SwitchRepository state={state}/>
            </div>
            <div>
                {null !== repository ? <Repository repository={repository}/> : null}
            </div>
        </div>
    )
})
