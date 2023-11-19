import {LocalStorage} from "../../LocalStorage/LocalStorage";
import {LocalStorageKey} from "../../LocalStorage/LocalStorageKey";
import {TimeTrackerSummaryProvider} from "./TimeTrackerSummaryProvider";

export class JiraProvider implements TimeTrackerSummaryProvider {
    public readonly pathStorage = new LocalStorage<string>(LocalStorageKey.JiraPath, '', this.path)
    public readonly userStorage = new LocalStorage<string>(LocalStorageKey.JiraUser, '', this.path)
    public readonly tokenStorage = new LocalStorage<string>(LocalStorageKey.JiraToken, '', this.path)
    public readonly summariesStorage = new LocalStorage<{ [key: string]: string | null }>(LocalStorageKey.JiraIssueSummaries, {}, this.path)

    public readonly url = '/jira/issue-summary'

    public constructor(
        private readonly path: string,
    ) {
    }


    public getParameters(): { [p: string]: string } | null {
        const path = this.pathStorage
            .getValue()
        const user = this.userStorage
            .getValue()
        const token = this.tokenStorage
            .getValue()

        if ('' === path || '' === user || '' === token) {
            return null
        }

        return {
            path: path,
            user: user,
            token: token,
        }
    }


}
