import {observer} from "mobx-react";
import React, {ReactElement} from "react";
import {RepositoryProps} from "./RepositoryProps";
import {Toggle} from './Toggle'
import {LocalStorageInput} from "./LocalStorageInput";
import {Checkbox} from "./Checkbox";

export const RepositorySettings = observer(({repository}: RepositoryProps): ReactElement => {
    return (
        <Toggle label='Settings'>
            <div>
                <LocalStorageInput storage={repository.bitbucketRepositoryPathStorage}/>
                <LocalStorageInput storage={repository.jiraPathStorage}/>
                <Checkbox
                    label='Use branch name as commit message prefix'
                    flag={repository.useBranchAsCommitMessagePrefix}/>
            </div>
        </Toggle>
    )
})
