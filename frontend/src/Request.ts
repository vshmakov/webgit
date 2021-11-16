import {Method} from "./Method";

export async function request(method: Method, path: string, body: any = null): Promise<Response> {
    return fetch(path, {
        method: method,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: null !== body ? JSON.stringify(body) : null
    })
}
