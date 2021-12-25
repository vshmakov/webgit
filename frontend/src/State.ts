import {LocalStorage} from "./LocalStorage/LocalStorage";
import {LocalStorageKey} from "./LocalStorage/LocalStorageKey";
import {RepositoryState} from "./Repository/RepositoryState";
import {makeAutoObservable} from "mobx";
import {not} from "./Util/Not";
import {sameWith} from "./Util/SameWith";
import {InMemoryFlag} from "./Flag/InMemoryFlag";
import {disable} from "./Flag/Disable";
import {getRepositoryName} from "./Repository/GetRepositoryName";

export class State {
    public readonly currentRepositoryPathStorage = new LocalStorage<string | null>(LocalStorageKey.CurrentRepositoryPath, null)
    public readonly repositoryPathsStorage = new LocalStorage<string[]>(LocalStorageKey.RepositoryPaths, [])
    public repository: RepositoryState | null = null
    public readonly switchingRepository = new InMemoryFlag(false)

    public constructor() {
        makeAutoObservable(this)
    }

    public async setCurrentRepositoryPathFromParameter(path: string): Promise<void> {
        this.currentRepositoryPathStorage.setValue(path)
        await this.checkRepository(path)
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
