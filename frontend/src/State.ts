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
        this.setCurrentRepositoryPathFromParameter()
        this.checkCurrentPath()
        makeAutoObservable(this)
    }

    private setCurrentRepositoryPathFromParameter(): void {
        const searchParams = new URLSearchParams(window.location.search)
        const path = searchParams.get('path')

        if (null !== path) {
            this.currentRepositoryPathStorage.setValue(path)
        }
    }

    private checkCurrentPath(): void {
        const path = this.currentRepositoryPathStorage.getValue()

        if (null === path) {
            return;
        }

        this.checkRepository(path)
        this.changePathParameter(path)
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
        this.changePathParameter(path);
        this.currentRepositoryPathStorage.setValue(path)
        this.repository = new RepositoryState(path)
        this.switchingRepository.uncheck()
    }

    private changePathParameter(path: string): void {
        window.history.pushState({}, '', `?path=${encodeURIComponent(path)}`)
    }
}
