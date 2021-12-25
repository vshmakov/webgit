import {Method} from "../Http/Method";

export type RequestRepository = (method: Method, url: string, body?: any) => Promise<Response>
