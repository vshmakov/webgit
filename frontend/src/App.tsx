import React, {ReactElement, useEffect} from 'react';
import {observer} from "mobx-react"
import {Repository} from "./Repository";
import {State} from "./State";
import {SwitchRepository} from "./SwitchRepository";
import {NavigateFunction, useLocation, useNavigate} from "react-router-dom";
import {getPathUrl} from "./Util/GetPathUrl";

export const App = observer(({state}: { state: State }): ReactElement => {
    const navigate = useNavigate()
    const location = useLocation()
    useEffect((): void => setPath(location.search, state, navigate), [location, navigate, state])
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

function setPath(search: string, state: State, navigate: NavigateFunction): void {
    const searchParams = new URLSearchParams(search)
    const parameterPath = searchParams.get('path')

    if (null !== parameterPath) {
        state.setCurrentRepositoryPathFromParameter(parameterPath)

        return
    }

    const localStoragePath = state.currentRepositoryPathStorage.getValue()

    if (null !== localStoragePath) {
        navigate(getPathUrl(localStoragePath))
    }
}
