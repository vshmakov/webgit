import { LocalStorage } from "./LocalStorage/LocalStorage"
import { LocalStorageKey } from "./LocalStorage/LocalStorageKey"
import { RepositoryState } from "./Repository/RepositoryState"
import { makeAutoObservable } from "mobx"
import { not } from "./Util/Not"
import { sameWith } from "./Util/SameWith"
import { InMemoryFlag } from "./Flag/InMemoryFlag"
import { disable } from "./Flag/Disable"
import { getRepositoryName } from "./Repository/GetRepositoryName"

export class State {
  public readonly currentRepositoryPathStorage = new LocalStorage<
    string | null
  >(LocalStorageKey.CurrentRepositoryPath, null)
  public readonly repositoryPathsStorage = new LocalStorage<string[]>(
    LocalStorageKey.RepositoryPaths,
    []
  )
  public repository: RepositoryState | null = null
  public readonly switchingRepository = new InMemoryFlag(false)

  public constructor() {
    makeAutoObservable(this)
  }

  public async setCurrentRepositoryPathFromParameter(
    path: string
  ): Promise<void> {
    this.selectRepositoryPath(path)
    await this.checkRepository(path)
  }

  public selectRepositoryPath(path: string): void {
    this.currentRepositoryPathStorage.setValue(path)
    this.moveRepositoryPathToTop(path)
  }

  private moveRepositoryPathToTop(path: string): void {
    const paths = this.repositoryPathsStorage
      .getValue()
      .filter((repositoryPath: string): boolean => repositoryPath !== path)

    paths.unshift(path)
    this.repositoryPathsStorage.setValue(paths)
  }

  private async checkRepository(path: string): Promise<void> {
    this.setRepository(await RepositoryState.create(path))
    disable(this.switchingRepository)
    document.title = getRepositoryName(path)
  }

  private setRepository(repository: RepositoryState): void {
    this.repository = repository
  }

  public addRepositoryPath(path: string): void {
    const paths = this.repositoryPathsStorage
      .getValue()
      .filter((repositoryPath: string): boolean => repositoryPath !== path)

    paths.unshift(path)
    this.repositoryPathsStorage.setValue(paths)
  }

  public removeRepositoryPath(path: string): void {
    const paths = this.repositoryPathsStorage
      .getValue()
      .filter(not(sameWith(path)))
    this.repositoryPathsStorage.setValue(paths)
  }
}
