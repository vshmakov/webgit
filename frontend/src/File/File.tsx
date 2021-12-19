import {observer} from "mobx-react";
import React, {ReactElement} from "react";
import {FileStatus} from "./FileStatus";
import {getFilePathParts} from "./GetFilePathParts";
import {withSound} from "../Util/WithSound";
import {Checkbox} from "../Flag/Checkbox";
import {Flag} from "../Flag/Flag";
import {FileProps} from "./FileProps";
import {RepositoryProps} from "../Repository/RepositoryProps";
import {StatusProps} from "../Repository/StatusProps";

export const File = observer(({file, repository, status}: FileProps & RepositoryProps & StatusProps): ReactElement => {
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
