import {LocalStorage} from "../../LocalStorage/LocalStorage";

export interface TimeTrackerSummaryProvider {
    summariesStorage: LocalStorage<{ [key: string]: string | null }>
    url: string

    getParameters(): null | { [key: string]: string }


}
