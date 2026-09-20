import { observer } from "mobx-react"
import { ReactElement } from "react"
import { Hidden } from "../../Flag/Hidden"
import { RepositoryProps } from "../../Repository/RepositoryProps"
import { DefaultLogFields } from "simple-git"
import { Log } from "./Log"

export const Logs = observer(
  ({ repository }: RepositoryProps): ReactElement => {
    const commits = repository.commitHistory?.all || []
    const logs = commits.map(
      (log: DefaultLogFields): ReactElement => (
        <Log log={log} repository={repository} key={log.hash} />
      )
    )

    return (
      <Hidden
        label="History"
        flag={repository.showHistory}
        onOpen={repository.loadCommitHistory.bind(repository)}
      >
        <table>
          <thead>
            <tr>
              <th>Message</th>
              <th>Author</th>
              <th>Date</th>
              <th>Hash</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {repository.historyLoading && 0 === logs.length ? (
              <tr>
                <td colSpan={5}>Loading history...</td>
              </tr>
            ) : (
              logs
            )}
            {repository.historyLoading && 0 !== logs.length ? (
              <tr>
                <td colSpan={5}>Loading history...</td>
              </tr>
            ) : null}
            {!repository.historyLoading && repository.historyCanLoadMore ? (
              <tr>
                <td colSpan={5}>
                  <button
                    type="button"
                    onClick={() => repository.loadMoreCommitHistory()}
                  >
                    Show more
                  </button>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Hidden>
    )
  }
)
