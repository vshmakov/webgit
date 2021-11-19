import {observer} from "mobx-react";
import React, {ReactElement} from "react";
import {LoadedRepositoryProps} from "./LoadedRepositoryProps";
import {preventDefault} from "./PreventDefault";
import {withSound} from "./WithSound";
import {LocalStorageInput} from "./LocalStorageInput";
import {Toggle} from "./Toggle";

export const Commit = observer(class extends React.Component<LoadedRepositoryProps> {
    public render(): ReactElement {
        const {repository} = this.props;

        return (
            <form onSubmit={preventDefault(() => withSound(repository.commit()))}>
                <h3>Commit</h3>
                <LocalStorageInput storage={repository.commitMessageStorage} required={true}/>
                <button type='submit'>
                    Commit
                </button>
                <Toggle label={'AdditionalSettings'}>
                    <div>
                        <label>
                            <input
                                type="checkbox"
                                checked={repository.stageAllFilesBeforeCommit.isChecked}
                                onChange={(): void => repository.stageAllFilesBeforeCommit.toggle()}/>
                            Stage all files
                        </label>
                        <LocalStorageInput storage={repository.precommitCommandStorage}/>
                    </div>
                </Toggle>
            </form>
        );
    }
})
