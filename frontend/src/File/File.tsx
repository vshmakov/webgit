import {observer} from "mobx-react";
import React, {ReactElement} from "react";
import {getFilePathParts} from "./GetFilePathParts";
import {withSound} from "../Util/WithSound";
import {Checkbox} from "../Flag/Checkbox";
import {Flag} from "../Flag/Flag";
import {FileProps} from "./FileProps";
import {RepositoryProps} from "../Repository/RepositoryProps";
import {getStatusName} from "./GetStatusName";
import {getActualPath} from "./GetActualPath";
import {isFileStaged} from "../Shared/IsFileStaged";

export const File = observer(({file, repository}: FileProps & RepositoryProps): ReactElement => {
    const path = getActualPath(file)
    const {name, directory} = getFilePathParts(path)
    const {status} = repository
    const stagedFlag: Flag = {
        isChecked: isFileStaged(path, status),
        toggle(): void {
            withSound(repository.stage(path))
        }
    }

    return (
        <tr>
            <td>{name}</td>
            <td>{directory}</td>
            <td>
                {getStatusName(file, status)}
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
