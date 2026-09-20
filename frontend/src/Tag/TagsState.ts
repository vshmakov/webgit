import { makeAutoObservable } from "mobx"

export class TagsState {
  public tags: string[]

  public constructor(tags: string[]) {
    this.tags = tags
    makeAutoObservable(this)
  }

  public setTags(tags: string[]): void {
    this.tags = tags
  }
}
