import {observer} from "mobx-react";
import React, {ReactElement} from "react";
import {preventDefault} from "../Util/PreventDefault";
import {withSound} from "../Util/WithSound";
import {CommitSettings} from "./CommitSettings";
import {Logs} from "./Log/Logs";
import {CommitMessage} from "./CommitMessage";
import {RepositoryProps} from "../Repository/RepositoryProps";
import {Checkbox} from "../Flag/Checkbox";

export const Commit = observer(({repository}: RepositoryProps): ReactElement => {
    return (
        <div>
            <form onSubmit={preventDefault(() => withSound(repository.commit()))}>
                <h3>Commit</h3>
                <CommitMessage repository={repository}/>
                <button type='submit'>
                    Commit
                </button>
                                <Checkbox label="Allow empty" flag={repository.allowEmptyCommit}/>
                <CommitSettings repository={repository}/>
            </form>
            <Logs repository={repository}/>
        </div>
    )
})
