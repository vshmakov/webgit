import {observer} from "mobx-react";
import {Toggle} from "./Toggle";
import {Checkbox} from "./Checkbox";
import {LocalStorageInput} from "./LocalStorageInput";
import React, {ReactElement} from "react";
import {LoadedRepositoryProps} from "./LoadedRepositoryProps";
import {Flag} from "./Flag";

export const CommitSettings = observer(({repository, status}: LoadedRepositoryProps): ReactElement => {
    const hasStagedFiles = 0 !== status.staged.length
    const stageFlag: Flag = {
        isChecked: repository.stageAllFilesBeforeCommit && !hasStagedFiles,
        toggle(): void {
            repository.stageAllFilesBeforeCommit.toggle()
        }
    }

    return (
        <Toggle label={"AdditionalSettings"}>
            <div>
                <Checkbox label="Stage all files" flag={stageFlag} disabled={hasStagedFiles}/>
                <Checkbox label='Clean after commit' flag={repository.cleanAfterCommit}/>
                <LocalStorageInput title="Precommit command" storage={repository.precommitCommandStorage}/>
            </div>
        </Toggle>
    )
})
