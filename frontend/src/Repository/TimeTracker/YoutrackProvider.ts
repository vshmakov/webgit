import {LocalStorage} from "../../LocalStorage/LocalStorage";
import {LocalStorageKey} from "../../LocalStorage/LocalStorageKey";
import {TimeTrackerSummaryProvider} from "./TimeTrackerSummaryProvider";

export class YoutrackProvider implements TimeTrackerSummaryProvider {
    public readonly pathStorage = new LocalStorage<string>(LocalStorageKey.YoutrackPath, '', this.path)
    public readonly tokenStorage = new LocalStorage<string>(LocalStorageKey.YoutrackToken, '', this.path)
    public readonly summariesStorage = new LocalStorage<{ [key: string]: string | null }>(LocalStorageKey.YoutrackIssueSummaries, {}, this.path)

    public readonly url = '/youtrack/issue-summary'

    public constructor(
        private readonly path: string,
    ) {
    }

    public getParameters(): { [p: string]: string } | null {
        const path = this.pathStorage
            .getValue()
        const token = this.tokenStorage
            .getValue()

        if ('' === path || '' === token) {
            return null
        }

        return {
            path: path,
            token: token,
        }
    }


}
