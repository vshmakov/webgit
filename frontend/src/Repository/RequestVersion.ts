import {Method} from "../Http/Method";
import {RequestRepository} from "./RequestRepository";

export async function requestVersion(request: RequestRepository): Promise<string | null> {
    const response = await request(Method.Get, '/repository/version')
    const result: { version: string | null } = await response.json()

    return result.version
}