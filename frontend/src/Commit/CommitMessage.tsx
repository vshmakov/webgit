import {observer} from "mobx-react";
import {SectionCommitPrefix} from "./SectionCommitPrefix";
import {LocalStorageInput} from "../LocalStorage/LocalStorageInput";
import React, {ReactElement} from "react";
import {EmptyCommitMessage} from "./EmptyCommitMessage";
import {RepositoryProps} from "../Repository/RepositoryProps";
import {StatusProps} from "../Repository/StatusProps";

export const CommitMessage = observer(({repository, status}: RepositoryProps & StatusProps): ReactElement => {
    if (repository.allowEmptyCommit.isChecked) {
        return (
            <div>{EmptyCommitMessage}</div>
        )
    }

    return (
        <div>
            <span>{repository.useBranchAsCommitMessagePrefix.isChecked ? `${status.current}:` : ""}</span>
            <SectionCommitPrefix repository={repository}/>
            <LocalStorageInput title="" storage={repository.commitMessageStorage} required={true}/>
        </div>
    )
})
