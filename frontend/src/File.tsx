import {observer} from "mobx-react";
import React, {ReactElement} from "react";
import {FileStatus} from "./FileStatus";
import {RepositoryProps} from "./RepositoryProps";
import {FileStatusResult} from "simple-git/typings/response";
import {getFilePathParts} from "./GetFilePathParts";
import {withSound} from "./WithSound";

interface Props extends RepositoryProps {
    file: FileStatusResult
}

export const File = observer(({file, repository}: Props): ReactElement => {
    const workingDir = file.working_dir as keyof typeof FileStatus
    const {name, directory} = getFilePathParts(file.path)

    return (
        <tr>
            <td>{name}</td>
            <td>{directory}</td>
            <td>
                {FileStatus[workingDir] || workingDir}
            </td>
            <td>
                <button
                    type="button"
                    onClick={() => withSound(repository.declineFile(file))}>
                    Decline
                </button>
            </td>
        </tr>
    )
})
