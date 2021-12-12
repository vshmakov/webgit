import {observer} from "mobx-react";
import React, {ReactElement} from "react";
import {LoadedRepositoryProps} from "./LoadedRepositoryProps";
import {FileStatusResult} from "simple-git/typings/response";
import {File} from "./File";

export const Files = observer(({repository, status}: LoadedRepositoryProps): ReactElement => {
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
                {status.files.map((file: FileStatusResult) => <File repository={repository} file={file}
                                                                    key={file.path}/>)}
                </tbody>
            </table>
        </div>
    )
        ;
})
