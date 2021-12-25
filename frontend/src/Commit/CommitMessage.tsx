import {observer} from "mobx-react";
import {SectionCommitPrefix} from "./SectionCommitPrefix";
import {LocalStorageInput} from "../LocalStorage/LocalStorageInput";
import React, {ReactElement} from "react";
import {EmptyCommitMessage} from "./EmptyCommitMessage";
import {RepositoryProps} from "../Repository/RepositoryProps";

export const CommitMessage = observer(({repository}: RepositoryProps): ReactElement => {
    if (repository.allowEmptyCommit.isChecked) {
        return (
            <div>{EmptyCommitMessage}</div>
        )
    }

    const {status} = repository

    return (
        <div>
            <span>{repository.useBranchAsCommitMessagePrefix.isChecked ? `${status.current}:` : ""}</span>
            <SectionCommitPrefix repository={repository}/>
            <LocalStorageInput title="" storage={repository.commitMessageStorage} required={true}/>
        </div>
    )
})
