import {StatusResult, StatusResultRenamed} from "simple-git";

export function isFileStaged(path: string, status: StatusResult): boolean {
    return status.staged.includes(path)
        || status.renamed.some((renamed: StatusResultRenamed): boolean => renamed.to === path)
}
