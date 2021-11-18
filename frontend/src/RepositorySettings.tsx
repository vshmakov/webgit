import {observer} from "mobx-react";
import React, {ReactElement} from "react";
import {RepositoryProps} from "./RepositoryProps";
import {Toggle} from './Toggle'
import {LocalStorageInput} from "./LocalStorageInput";

export const RepositorySettings = observer(({repository}: RepositoryProps): ReactElement => {
    return (
        <Toggle label='Settings'>
            <LocalStorageInput storage={repository.bitbucketRepositoryPathStorage}/>
        </Toggle>
    )
})
