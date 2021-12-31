import {FileStatusResult} from "simple-git/typings/response";

export function getActualPath(file: FileStatusResult): string {
    return "" + file.path
        .split(' -> ')
        .pop()
}
