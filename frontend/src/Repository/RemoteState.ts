import {LocalStorage} from "../LocalStorage/LocalStorage";
import {LocalStorageKey} from "../LocalStorage/LocalStorageKey";
import {BranchSummaryBranch} from "simple-git";

export class RemoteState {
    public readonly createPullRequestUrlTemplate = new LocalStorage<string>(LocalStorageKey.CreatePullRequestUrlTemplate, '', this.path)

    public constructor(
        private readonly path: string,
    ) {
    }

    public getCreatePullRequestUrl(branch: BranchSummaryBranch): string | null {
        const template = this.createPullRequestUrlTemplate.getValue()

        return '' !== template
            ? template.replace('{{source}}', branch.name)
            : null;

    }
}
