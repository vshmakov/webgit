import {JiraProvider} from "./JiraProvider";
import {YoutrackProvider} from "./YoutrackProvider";
import {TimeTrackerSummaryProvider} from "./TimeTrackerSummaryProvider";

export class TimeTrackerState {
    public readonly jiraProvider = new JiraProvider(this.path)
    public readonly youtrackProvider = new YoutrackProvider(this.path)
    private readonly providers: TimeTrackerSummaryProvider[] = [
        this.jiraProvider,
        this.youtrackProvider,
    ]

    public constructor(
        private readonly path: string,
    ) {
    }

    public get configuredProvider(): TimeTrackerSummaryProvider | null {
        for (const provider of this.providers) {
            if (null !== provider.getParameters()) {
                return provider
            }
        }

        return null
    }
}
