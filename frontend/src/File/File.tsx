import {observer} from "mobx-react";
import React, {ReactElement} from "react";
import {FileStatus} from "./FileStatus";
import {FileStatusResult} from "simple-git/typings/response";
import {getFilePathParts} from "./GetFilePathParts";
import {withSound} from "../WithSound";
import {LoadedRepositoryProps} from "../Repository/LoadedRepositoryProps";
import {Checkbox} from "../Flag/Checkbox";
import {Flag} from "../Flag/Flag";

interface Props extends LoadedRepositoryProps {
    file: FileStatusResult
}

export const File = observer(({file, repository, status}: Props): ReactElement => {
    const workingDir = file.working_dir as keyof typeof FileStatus
    const index = file.index as keyof typeof FileStatus
    const {name, directory} = getFilePathParts(file.path)
    const stagedFlag: Flag = {
        isChecked: status.staged.includes(file.path),
        toggle(): void {
            withSound(repository.stage(file))
        }
    }

    return (
        <tr>
            <td>{name}</td>
            <td>{directory}</td>
            <td>
                {FileStatus[workingDir] || workingDir || FileStatus[index] || index}
            </td>
            <td>
                <Checkbox label='Staged' flag={stagedFlag}/>
                <button
                    type="button"
                    onClick={() => withSound(repository.declineFile(file))}
                    disabled={stagedFlag.isChecked}>
                    Decline
                </button>
            </td>
        </tr>
    )
})
