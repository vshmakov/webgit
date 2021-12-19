import {observer} from "mobx-react";
import {RepositoryState} from "./RepositoryState";
import React, {ReactElement, useEffect} from "react";
import {withSound} from "../Util/WithSound";
import {getCalledAgo} from "../Util/GetCalledAgo";
import {Branches} from "../Branch/Branches";
import {Commit} from "../Commit/Commit";
import {Files} from "../File/Files";
import {RepositorySettings} from "./RepositorySettings";
import {EmptyCallback} from "../Util/EmptyCallback";
import {RepositoryProps} from "./RepositoryProps";
import {getRepositoryName} from "./GetRepositoryName";

export const Repository = observer(({repository}: RepositoryProps): ReactElement => {
    useEffect((): EmptyCallback => calculateLoadersAgo(repository))
    const {status, branches} = repository

    if (null === status || null === branches) {
        return (
            <div>
                Loading...
            </div>
        )
    }

    return (
        <div>
            <div>
                <h2>{getRepositoryName(repository.path)} repository</h2>
                <div>
                    <button onClick={() => withSound(repository.fetch())} accessKey='t'>
                        Fetch {getCalledAgo(repository.fetchLoader.ago)}
                    </button>
                    <button onClick={() => withSound(repository.loadStatus())} accessKey='s'>
                        Status {getCalledAgo(repository.statusLoader.ago)}
                    </button>
                </div>
                <div>
                    <RepositorySettings repository={repository}/>
                </div>
            </div>
            <Branches repository={repository} status={status} branches={branches}/>
            <Commit repository={repository} status={status}/>
            <Files repository={repository} status={status}/>
        </div>
    )
})

function calculateLoadersAgo(repository: RepositoryState): EmptyCallback {
    const id = setInterval((): void => {
        repository.statusLoader.calculateAgo()
        repository.fetchLoader.calculateAgo()
    }, 60 * 1000)

    return (): void => clearInterval(id)
}
