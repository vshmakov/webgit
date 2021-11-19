import {observer} from "mobx-react";
import React, {ReactElement} from "react";
import {LoadedRepositoryProps} from "./LoadedRepositoryProps";
import {preventDefault} from "./PreventDefault";
import {withSound} from "./WithSound";
import {LocalStorageInput} from "./LocalStorageInput";
import {Toggle} from "./Toggle";
import {Checkbox} from "./Checkbox";

export const Commit = observer(class extends React.Component<LoadedRepositoryProps> {
    public render(): ReactElement {
        const {repository, status} = this.props;

        return (
            <form onSubmit={preventDefault(() => withSound(repository.commit()))}>
                <h3>Commit</h3>
                {repository.useBranchAsCommitMessagePrefix.isChecked ? `${status.current}:` : ''}
                <LocalStorageInput storage={repository.commitMessageStorage} required={true}/>
                <button type='submit'>
                    Commit
                </button>
                <Toggle label={'AdditionalSettings'}>
                    <div>
                        <Checkbox label='Stage all files' flag={repository.stageAllFilesBeforeCommit}/>
                        <LocalStorageInput storage={repository.precommitCommandStorage}/>
                    </div>
                </Toggle>
            </form>
        );
    }
})
