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
import {setIntervalEffect} from "../Util/SetIntervalEffect";

export const Repository = observer(({repository}: RepositoryProps): ReactElement => {
    useEffect((): EmptyCallback => setIntervalEffect(calculateAgo.bind(null, repository), 60 * 1000))
    useEffect((): EmptyCallback => setIntervalEffect((): void => {
        repository.checkChangedStatus()
    }, 500))

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
            <Branches repository={repository}/>
            <Commit repository={repository}/>
            <Files repository={repository}/>
        </div>
    )
})

function calculateAgo(repository: RepositoryState): void {
    repository.statusLoader.calculateAgo()
    repository.fetchLoader.calculateAgo()
}
