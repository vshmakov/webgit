import {LocalStorage} from "./LocalStorage";
import {LocalStorageKey} from "./LocalStorageKey";
import {RepositoryState} from "./RepositoryState";
import {makeAutoObservable} from "mobx";
import {not} from "./Not";
import {sameWith} from "./SameWith";

export class State {
    public readonly currentRepositoryPathStorage = new LocalStorage<string | null>(LocalStorageKey.CurrentRepositoryPath, null)
    public readonly repositoryPathsStorage = new LocalStorage<string[]>(LocalStorageKey.RepositoryPaths, [])
    public repository: RepositoryState | null = null

    public constructor() {
        const path = this.currentRepositoryPathStorage.getValue()

        if (null !== path) {
            this.chooseRepository(path)
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

    public chooseRepository(path: string): void {
        this.currentRepositoryPathStorage.setValue(path)
        this.repository = new RepositoryState(path)
    }
}
