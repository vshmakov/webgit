import {StatusResult, StatusResultRenamed} from "simple-git";

export function isFileStaged(path: string, status: StatusResult): boolean {
    return status.staged.includes(path)
        || status.renamed.map((renamed: StatusResultRenamed): string => renamed.to).includes(path);
}
