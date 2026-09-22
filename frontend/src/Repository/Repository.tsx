import { observer } from "mobx-react"
import { RepositoryState } from "./RepositoryState"
import { ReactElement, useEffect } from "react"
import { withSound } from "../Util/WithSound"
import { getCalledAgo } from "../Util/GetCalledAgo"
import { Branches } from "../Branch/Branches"
import { Commit } from "../Commit/Commit"
import { Files } from "../File/Files"
import { EmptyCallback } from "../Util/EmptyCallback"
import { RepositoryProps } from "./RepositoryProps"
import { getRepositoryName } from "./GetRepositoryName"
import { setIntervalEffect } from "../Util/SetIntervalEffect"
import { Hidden } from "../Flag/Hidden"
import { Tags } from "../Tag/Tags"
import { RepositorySettings } from "./RepositorySettings"

export const Repository = observer(
  ({ repository }: RepositoryProps): ReactElement => {
    useEffect(
      (): EmptyCallback =>
        setIntervalEffect(calculateAgo.bind(null, repository), 60 * 1000)
    )
    useEffect(
      (): EmptyCallback =>
        setIntervalEffect((): void => {
          repository.checkChangedStatus()
        }, 1000)
    )

    return (
      <div className="repository-view">
        <header className="repository-header">
          <h2>{getRepositoryName(repository.path)} repository</h2>
          <div>
            <button onClick={() => withSound(repository.fetch())} accessKey="t">
              Fetch {getCalledAgo(repository.fetchLoader.ago)}
            </button>
            <button
              onClick={() => withSound(repository.loadStatus())}
              accessKey="s"
            >
              Status {getCalledAgo(repository.statusLoader.ago)}
            </button>
          </div>
        </header>
        <RepositorySettings repository={repository} />
        <Branches repository={repository} />
        <Hidden
          label="Remote branches"
          flag={repository.showRemoteBranches}
          onOpen={repository.loadRemoteBranches.bind(repository)}
        >
          <div>
            <table>
              <thead>
                <tr>
                  <th>Remote branch</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {repository.remoteBranches.map(
                  (branch: string): ReactElement => (
                    <tr key={branch}>
                      <td>{branch}</td>
                      <td>
                        <button
                          type="button"
                          onClick={(): void => {
                            if (
                              window.confirm(
                                `Delete remote branch "${branch}"? This action cannot be undone.`
                              )
                            ) {
                              withSound(repository.deleteRemoteBranch(branch))
                            }
                          }}
                        >
                          Remove branch
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </Hidden>
        <Tags repository={repository} />
        <Commit repository={repository} />
        <Files repository={repository} />
      </div>
    )
  }
)

function calculateAgo(repository: RepositoryState): void {
  repository.statusLoader.calculateAgo()
  repository.fetchLoader.calculateAgo()
}
