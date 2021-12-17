import {observer} from "mobx-react";
import {LoadedRepositoryProps} from "./LoadedRepositoryProps";
import {SectionCommitPrefix} from "./SectionCommitPrefix";
import {LocalStorageInput} from "./LocalStorageInput";
import React from "react";

export const CommitMessage = observer(({repository, status}: LoadedRepositoryProps) => {
    if (repository.allowEmptyCommit.isChecked){
        return (
            <div>Empty commit</div>
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
