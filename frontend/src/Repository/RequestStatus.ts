import {RequestRepository} from "./RequestRepository";
import {StatusResult} from "simple-git";
import {Method} from "../Http/Method";

export async function requestStatus(request: RequestRepository): Promise<StatusResult> {
    const response = await request(Method.Get, '/status')

    return await response.json()
}
