import {observer} from "mobx-react";
import {Hidden} from "../Flag/Hidden";
import {Checkbox} from "../Flag/Checkbox";
import {LocalStorageInput} from "../LocalStorage/LocalStorageInput";
import React, {ReactElement} from "react";
import {RepositoryProps} from "../Repository/RepositoryProps";

export const CommitSettings = observer(({repository}: RepositoryProps): ReactElement => {
    return (
        <Hidden label={"AdditionalSettings"} flag={repository.openCommitSettings}>
            <div>
                <Checkbox label="Stage all files" flag={repository.stageAllFilesBeforeCommit}/>
                <Checkbox label='Clean after commit' flag={repository.cleanAfterCommit}/>
                <LocalStorageInput title="Precommit command" storage={repository.precommitCommandStorage}/>
            </div>
        </Hidden>
    )
})
