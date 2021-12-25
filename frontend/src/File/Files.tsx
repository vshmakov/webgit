import {observer} from "mobx-react";
import React, {ReactElement} from "react";
import {FileStatusResult} from "simple-git/typings/response";
import {File} from "./File";
import {RepositoryProps} from "../Repository/RepositoryProps";

export const Files = observer(({repository}: RepositoryProps): ReactElement => {
    const {status} = repository
    const files = status.files
        .map((file: FileStatusResult): ReactElement => <File
            repository={repository}
            file={file}
            key={file.path}/>)

    return (
        <div>
            <h3>Files</h3>
            <table>
                <thead>
                <tr>
                    <th>File</th>
                    <th>Directory</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {files}
                </tbody>
            </table>
        </div>
    )
        ;
})
