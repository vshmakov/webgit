import {observer} from "mobx-react";
import {RepositoryState} from "./RepositoryState";
import React, {ReactElement, useEffect} from "react";
import {withSound} from "./WithSound";
import {getCalledAgo} from "./GetCalledAgo";
import {Branches} from "./Branches";
import {Commit} from "./Commit";
import {Files} from "./Files";
import {getFilePathParts} from "./GetFilePathParts";
import {capitalizeFirstLetter} from "./CapitalizeFirstLetter";

export const Repository = observer(({repository}: { repository: RepositoryState }): ReactElement => {
    useEffect((): () => void => {
        const id = setInterval((): void => {
            repository.statusLoader.calculateAgo()
            repository.fetchLoader.calculateAgo()
        }, 1000)

        return (): void => {
            clearInterval(id)
        }
    })
    const {status, branches} = repository

    if (null === status || null === branches
    ) {
        return (
            <div>
                Loading...
            </div>
        )
    }

    return (
        <div>
            <div>
                <h2>{capitalizeFirstLetter(getFilePathParts(repository.path).name)} repository</h2>
                <button onClick={() => withSound(repository.fetch())} accessKey='t'>
                    Fetch {getCalledAgo(repository.fetchLoader.ago)}
                </button>
                <button onClick={() => withSound(repository.loadStatus())} accessKey='s'>
                    Status {getCalledAgo(repository.statusLoader.ago)}
                </button>
            </div>
            <Branches state={repository} status={status} branches={branches}/>
            <Commit state={repository} status={status} branches={branches}/>
            <Files state={repository} status={status} branches={branches}/>
        </div>
    )
})


