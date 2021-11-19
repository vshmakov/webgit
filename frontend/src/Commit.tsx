import {observer} from "mobx-react";
import React, {ReactElement} from "react";
import {LoadedRepositoryProps} from "./LoadedRepositoryProps";
import {preventDefault} from "./PreventDefault";
import {withSound} from "./WithSound";
import {LocalStorageInput} from "./LocalStorageInput";
import {Toggle} from "./Toggle";

export const Commit = observer(class extends React.Component<LoadedRepositoryProps> {
    public render(): ReactElement {
        const {state} = this.props;

        return (
            <form onSubmit={preventDefault(() => withSound(state.commit()))}>
                <h3>Commit</h3>
                <LocalStorageInput storage={state.commitMessageStorage} required={true}/>
                <button type='submit'>
                    Commit
                </button>
                <Toggle label={'AdditionalSettings'}>
                    <div>
                        <label>
                            <input
                                type="checkbox"
                                checked={state.stageAllFilesBeforeCommit.isChecked}
                                onChange={(): void => state.stageAllFilesBeforeCommit.toggle()}/>
                            Stage all files
                        </label>
                        <LocalStorageInput storage={state.precommitCommandStorage}/>
                    </div>
                </Toggle>
            </form>
        );
    }
})
