import {LocalStorage} from "./LocalStorage";
import {LocalStorageKey} from "./LocalStorageKey";
import {RepositoryState} from "./RepositoryState";
import {makeAutoObservable} from "mobx";
import {not} from "./Not";
import {sameWith} from "./SameWith";
import {Flag} from "./Flag";

export class State {
    public readonly currentRepositoryPathStorage = new LocalStorage<string | null>(LocalStorageKey.CurrentRepositoryPath, null)
    public readonly repositoryPathsStorage = new LocalStorage<string[]>(LocalStorageKey.RepositoryPaths, [])
    public repository: RepositoryState | null = null
    public readonly switchingRepository = new Flag(false)


    public constructor() {
        const path = this.currentRepositoryPathStorage.getValue()

        if (null !== path) {
            this.checkRepository(path)
        }

        makeAutoObservable(this)
    }

    public addRepositoryPath(path: string): void {
        const paths = this.repositoryPathsStorage.getValue()

        if (!paths.includes(path)) {
            paths.push(path)
        }

        this.repositoryPathsStorage.setValue(paths)
    }

    public removeRepositoryPath(path: string): void {
        const paths = this.repositoryPathsStorage
            .getValue()
            .filter(not(sameWith(path)))
        this.repositoryPathsStorage.setValue(paths)
    }

    public checkRepository(path: string): void {
        this.currentRepositoryPathStorage.setValue(path)
        this.repository = new RepositoryState(path)
        this.switchingRepository.uncheck()
    }
}
