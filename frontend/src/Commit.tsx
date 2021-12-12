import {observer} from "mobx-react";
import React, {ReactElement} from "react";
import {LoadedRepositoryProps} from "./LoadedRepositoryProps";
import {preventDefault} from "./PreventDefault";
import {withSound} from "./WithSound";
import {LocalStorageInput} from "./LocalStorageInput";
import {SectionCommitPrefix} from "./SectionCommitPrefix";
import {CommitSettings} from "./CommitSettings";

export const Commit = observer(class extends React.Component<LoadedRepositoryProps> {
    public render(): ReactElement {
        const {repository, status} = this.props;

        return (
            <form onSubmit={preventDefault(() => withSound(repository.commit()))}>
                <h3>Commit</h3>
                {repository.useBranchAsCommitMessagePrefix.isChecked ? `${status.current}:` : ''}
                <SectionCommitPrefix repository={repository}/>
                <LocalStorageInput title='' storage={repository.commitMessageStorage} required={true}/>
                <button type='submit'>
                    Commit
                </button>
                <CommitSettings repository={repository}/>
            </form>
        );
    }
})
