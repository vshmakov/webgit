import {RequestRepository} from "./RequestRepository";
import {BranchesState} from "../Branch/BranchesState";
import {Method} from "../Http/Method";

export async function requestBranches(request: RequestRepository, path: string): Promise<BranchesState> {
    const response = await request(Method.Get, '/branches')

    return new BranchesState(path, await response.json())

}
