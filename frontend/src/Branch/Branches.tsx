import {observer} from "mobx-react";
import React, {ReactElement} from "react";
import {Hidden} from "../Flag/Hidden";
import {preventDefault} from "../Util/PreventDefault";
import {withSound} from "../Util/WithSound";
import {BranchSummaryBranch} from "simple-git";
import {Checkbox} from "../Flag/Checkbox";
import {Branch} from "./Branch";
import {setInputValue} from "../Util/SetInputValue";
import {RepositoryProps} from "../Repository/RepositoryProps";

export const Branches = observer(({repository}: RepositoryProps): ReactElement => {
    const {branches} = repository
    const rows = branches.sorted
        .map((branch: BranchSummaryBranch, index: number): ReactElement => <Branch
            branch={branch}
            index={index}
            repository={repository}
            key={branch.name}/>)

    return (
        <div>
            <h3>Branches</h3>
            <form>
                <Checkbox label={`Show hidden (${branches.hidden.length})`} flag={branches.showHidden}
                          key={JSON.stringify(branches.hidden)}/>
                <table>
                    <thead>
                    <tr>
                        <th></th>
                        <th>Branch</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {rows}
                    </tbody>
                </table>
            </form>
            <Hidden label='Create' flag={repository.isBranchCreation}>
                <form onSubmit={preventDefault(() => withSound(repository.createBranch()))}>
                    <input
                        type="text"
                        value={repository.newBranchName}
                        onChange={setInputValue((value: string): void => {
                            repository.newBranchName = value
                        })}
                        required={true}/>
                    <button type="submit">
                        Create
                    </button>
                </form>
            </Hidden>
        </div>
    )
        ;
})
