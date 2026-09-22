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
