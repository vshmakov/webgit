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

                <LocalStorageInput title='Jira path' storage={repository.timeTrackerState.jiraProvider.pathStorage}/>
                <LocalStorageInput title='Jira user' storage={repository.timeTrackerState.jiraProvider.userStorage}/>
                <LocalStorageInput title='Jira token' storage={repository.timeTrackerState.jiraProvider.tokenStorage}/>

                <LocalStorageInput title='Youtrack path'
                                   storage={repository.timeTrackerState.youtrackProvider.pathStorage}/>
                <LocalStorageInput title='Youtrack token'
                                   storage={repository.timeTrackerState.youtrackProvider.tokenStorage}/>

                <Checkbox
                    label='Use branch name as commit message prefix'
                    flag={repository.useBranchAsCommitMessagePrefix}/>
                <Checkbox
                    label='Use section commit prefix'
                    flag={repository.useSectionCommitMessagePrefix}/>
                <Checkbox
                    label='Push on commit'
                    flag={repository.pushOnCommit}/>
            </div>
        </Hidden>
    )
})
