import {LocalStorage} from "./LocalStorage/LocalStorage";
import {LocalStorageKey} from "./LocalStorage/LocalStorageKey";
import {RepositoryState} from "./Repository/RepositoryState";
import {makeAutoObservable} from "mobx";
import {not} from "./Util/Not";
import {sameWith} from "./Util/SameWith";
import {InMemoryFlag} from "./Flag/InMemoryFlag";
import {disable} from "./Flag/Disable";

export class State {
    public readonly currentRepositoryPathStorage = new LocalStorage<string | null>(LocalStorageKey.CurrentRepositoryPath, null)
    public readonly repositoryPathsStorage = new LocalStorage<string[]>(LocalStorageKey.RepositoryPaths, [])
    public repository: RepositoryState | null = null
    public readonly switchingRepository = new InMemoryFlag(false)

    public constructor() {
        makeAutoObservable(this)
    }

    public setCurrentRepositoryPathFromParameter(path: string): void {
        this.currentRepositoryPathStorage.setValue(path)
        this.checkCurrentPath()
    }

    private checkCurrentPath(): void {
        const path = this.currentRepositoryPathStorage.getValue()

        if (null === path) {
            return;
        }

        this.checkRepository(path)
    }

    private checkRepository(path: string): void {
        this.repository = new RepositoryState(path)
        disable(this.switchingRepository)
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
}
