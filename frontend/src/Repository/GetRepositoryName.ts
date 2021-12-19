import {capitalizeFirstLetter} from "../Util/CapitalizeFirstLetter";
import {getFilePathParts} from "../File/GetFilePathParts";

export function getRepositoryName(path: string): string {
    return capitalizeFirstLetter(getFilePathParts(path).name);
}
