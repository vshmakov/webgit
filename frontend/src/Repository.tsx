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
import {RepositorySettings} from "./RepositorySettings";
import {EmptyCallback} from "./EmptyCallback";
import {RepositoryProps} from "./RepositoryProps";

export const Repository = observer(({repository}: RepositoryProps): ReactElement => {
    useEffect(getCalculateLoadersAgoEffect(repository))
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
            <Branches state={repository} status={status} branches={branches}/>
            <Commit state={repository} status={status} branches={branches}/>
            <Files state={repository} status={status} branches={branches}/>
        </div>
    )
})

function getCalculateLoadersAgoEffect(repository: RepositoryState): EmptyCallback {
    return (): EmptyCallback => {
        const id = setInterval((): void => {
            repository.statusLoader.calculateAgo()
            repository.fetchLoader.calculateAgo()
        }, 1000)

        return (): void => {
            clearInterval(id)
        }
    };
}
