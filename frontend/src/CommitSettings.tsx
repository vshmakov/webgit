import {observer} from "mobx-react";
import {RepositoryProps} from "./RepositoryProps";
import {Toggle} from "./Toggle";
import {Checkbox} from "./Checkbox";
import {LocalStorageInput} from "./LocalStorageInput";
import React, {ReactElement} from "react";

export const CommitSettings = observer(({repository}: RepositoryProps): ReactElement => {
    return (
        <Toggle label={"AdditionalSettings"}>
            <div>
                <Checkbox label="Stage all files" flag={repository.stageAllFilesBeforeCommit}/>
                <Checkbox label='Clean after commit' flag={repository.cleanAfterCommit}/>
                <LocalStorageInput title="Precommit command" storage={repository.precommitCommandStorage}/>
            </div>
        </Toggle>
    )
})
