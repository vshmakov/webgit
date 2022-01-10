import {observer} from "mobx-react";
import React, {ReactElement} from "react";
import {FileStatusResult} from "simple-git/typings/response";
import {File} from "./File";
import {RepositoryProps} from "../Repository/RepositoryProps";
import {compareAlphabetically} from "../Util/CompareAlphabetically";
import {getActualPath} from "./GetActualPath";
import {compare} from "../Util/Compare";

export const Files = observer(({repository}: RepositoryProps): ReactElement => {
    const {status} = repository
    const files = status.files
        .slice()
        .sort((file1: FileStatusResult, file2: FileStatusResult): number => {
            const path1 = getActualPath(file1);
            const path2 = getActualPath(file2);

            return           -compare(status.conflicted.indexOf(path1), status.conflicted.indexOf(path2)) || compareAlphabetically(path1, path2)
        })
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
