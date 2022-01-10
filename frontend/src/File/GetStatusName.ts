import {FileStatus} from "./FileStatus";
import {FileStatusResult} from "simple-git/typings/response";
import {StatusResult} from "simple-git";
import {getActualPath} from "./GetActualPath";

export function getStatusName(file: FileStatusResult, status: StatusResult): string {
    const workingDir = file.working_dir.trim() as keyof typeof FileStatus
    const index = file.index.trim() as keyof typeof FileStatus

    return status.conflicted.includes(getActualPath(file))
        ? 'Conflicted'
        : FileStatus[workingDir] || workingDir || FileStatus[index] || index
}
