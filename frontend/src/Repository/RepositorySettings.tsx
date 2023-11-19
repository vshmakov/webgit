import {observer} from "mobx-react";
import React, {ReactElement} from "react";
import {RepositoryProps} from "./RepositoryProps";
import {Hidden} from '../Flag/Hidden'
import {LocalStorageInput} from "../LocalStorage/LocalStorageInput";
import {Checkbox} from "../Flag/Checkbox";

export const RepositorySettings = observer(({repository}: RepositoryProps): ReactElement => {
    return (
        <Hidden label='Settings'>
            <div>
                <LocalStorageInput title='Create pull request url template'
                                   storage={repository.remoteState.createPullRequestUrlTemplate}/>
                <LocalStorageInput title='Jira path' storage={repository.jiraPathStorage}/>
                <LocalStorageInput title='Jira user' storage={repository.jiraUserStorage}/>
                <LocalStorageInput title='Jira token' storage={repository.jiraTokenStorage}/>
                <Checkbox
                    label='Use branch name as commit message prefix'
                    flag={repository.useBranchAsCommitMessagePrefix}/>
                <Checkbox
                    label='Use section commit prefix'
                    flag={repository.useSectionCommitMessagePrefix}/>
            </div>
        </Hidden>
    )
})
