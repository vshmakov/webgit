import {FileStatus} from "./FileStatus";
import {FileStatusResult} from "simple-git/typings/response";

export function getStatusName(file: FileStatusResult): string {
    const workingDir = file.working_dir.trim() as keyof typeof FileStatus
    const index = file.index.trim() as keyof typeof FileStatus

    return FileStatus[workingDir] || workingDir || FileStatus[index] || index
}
