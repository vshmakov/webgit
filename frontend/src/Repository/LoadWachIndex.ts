import {RequestRepository} from "./RequestRepository";
import {Method} from "../Http/Method";

export async function loadWachIndex(request: RequestRepository): Promise<number> {
    const response = await request(Method.Get, '/repository/watch-index')

    return await response.json()
}
