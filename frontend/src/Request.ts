import {Method} from "./Method";

export async function request(path:string, method: Method, url: string, body: any = null): Promise<Response> {
    return fetch(url, {
        method: method,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: null !== body ? JSON.stringify(body) : null
    })
}
