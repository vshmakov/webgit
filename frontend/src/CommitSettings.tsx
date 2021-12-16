import {observer} from "mobx-react";
import {Toggle} from "./Toggle";
import {Checkbox} from "./Checkbox";
import {LocalStorageInput} from "./LocalStorageInput";
import React, {ReactElement} from "react";
import {LoadedRepositoryProps} from "./LoadedRepositoryProps";

export const CommitSettings = observer(({repository, status}: LoadedRepositoryProps): ReactElement => {
    return (
        <Toggle label={"AdditionalSettings"}>
            <div>
                <Checkbox label="Stage all files" flag={repository.stageAllFilesBeforeCommit} disabled={repository.hasStagedFiles}/>
                <Checkbox label='Clean after commit' flag={repository.cleanAfterCommit}/>
                <LocalStorageInput title="Precommit command" storage={repository.precommitCommandStorage}/>
            </div>
        </Toggle>
    )
})
