import {RequestRepository} from "./RequestRepository";
import {Method} from "../Http/Method";

export async function loadWachIndex(request: RequestRepository): Promise<number | null> {
    try {
        const response = await request(Method.Get, '/repository/watch-index')

        return await response.json()
    } catch (exception) {
        return null
    }
}
