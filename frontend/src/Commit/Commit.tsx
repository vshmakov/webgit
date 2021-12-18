import {observer} from "mobx-react";
import React, {ReactElement} from "react";
import {LoadedRepositoryProps} from "../Repository/LoadedRepositoryProps";
import {preventDefault} from "../PreventDefault";
import {withSound} from "../WithSound";
import {CommitSettings} from "./CommitSettings";
import {Logs} from "../Logs";
import {CommitMessage} from "./CommitMessage";

export const Commit = observer(({repository, status, branches}: LoadedRepositoryProps): ReactElement => {
    return (
        <div>
            <form onSubmit={preventDefault(() => withSound(repository.commit()))}>
                <h3>Commit</h3>
                <CommitMessage repository={repository} status={status} branches={branches}/>
                <button type='submit'>
                    Commit
                </button>
                <CommitSettings repository={repository} status={status} branches={branches}/>
            </form>
            <Logs repository={repository}/>
        </div>
    )
})
