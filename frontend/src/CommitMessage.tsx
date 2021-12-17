import {observer} from "mobx-react";
import {LoadedRepositoryProps} from "./LoadedRepositoryProps";
import {SectionCommitPrefix} from "./SectionCommitPrefix";
import {LocalStorageInput} from "./LocalStorageInput";
import React, {ReactElement} from "react";
import {EmptyCommitMessage} from "./EmptyCommitMessage";

export const CommitMessage = observer(({repository, status}: LoadedRepositoryProps): ReactElement => {
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
