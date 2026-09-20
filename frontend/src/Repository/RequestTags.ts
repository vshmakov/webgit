import { RequestRepository } from "./RequestRepository"
import { Method } from "../Http/Method"

export async function requestTags(
  request: RequestRepository
): Promise<string[]> {
  const response = await request(Method.Get, "/tags")

  return (await response.json()) as string[]
}
