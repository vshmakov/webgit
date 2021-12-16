import {observer} from "mobx-react";
import React, {ReactElement} from "react";
import {LoadedRepositoryProps} from "./LoadedRepositoryProps";
import {preventDefault} from "./PreventDefault";
import {withSound} from "./WithSound";
import {LocalStorageInput} from "./LocalStorageInput";
import {SectionCommitPrefix} from "./SectionCommitPrefix";
import {CommitSettings} from "./CommitSettings";
import {Logs} from "./Logs";

export const Commit = observer(({repository, status, branches}: LoadedRepositoryProps): ReactElement => {
    return (
        <div>
            <form onSubmit={preventDefault(() => withSound(repository.commit()))}>
                <h3>Commit</h3>
                <span>{repository.useBranchAsCommitMessagePrefix.isChecked ? `${status.current}:` : ''}</span>
                <SectionCommitPrefix repository={repository}/>
                <LocalStorageInput title='' storage={repository.commitMessageStorage} required={true}/>
                <button type='submit'>
                    Commit
                </button>
                <CommitSettings repository={repository} status={status} branches={branches}/>
            </form>
            <Logs repository={repository}/>
        </div>
    )
})
