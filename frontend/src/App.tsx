import React, {ReactElement, useEffect} from 'react';
import './App.css';
import {observer} from "mobx-react"
import {Repository} from "./Repository";
import {State} from "./State";
import {SwitchRepository} from "./SwitchRepository";
import {useLocation, useNavigate} from "react-router-dom";
import {getPathUrl} from "./GetPathUrl";

export const App = observer(({state}: { state: State }): ReactElement => {
    const navigate = useNavigate()
    const location = useLocation()
    useEffect(():void=>{
        const search = location.search;
        const searchParams = new URLSearchParams(search)
        const parameterPath = searchParams.get('path')
        const localStoragePath = state.currentRepositoryPathStorage.getValue()

        if (null === parameterPath) {
            if (null !== localStoragePath) {
                navigate(getPathUrl(localStoragePath))
            }
        } else {
            state.setCurrentRepositoryPathFromParameter(parameterPath)
        }
    }, [location, navigate, state])

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
