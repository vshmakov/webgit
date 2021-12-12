import {observer} from "mobx-react";
import React, {ReactElement} from "react";
import {Toggle} from "./Toggle";
import {RepositoryProps} from "./RepositoryProps";
import {DefaultLogFields} from "simple-git";
import {Log} from "./Log";

export const Logs = observer(({repository}: RepositoryProps): ReactElement => {
    const commits = repository.commitHistory?.all || []
    const logs = commits.map((log: DefaultLogFields): ReactElement => <Log log={log} key={log.hash}/>)

    return (
        <Toggle label='History'>
            <table>
                <thead>
                <tr>
                    <th>Message</th>
                    <th>Author</th>
                    <th>Date</th>
                    <th>Hash</th>
                </tr>
                </thead>
                <tbody>{logs}</tbody>
            </table>
        </Toggle>
    )
})
