import { observer } from "mobx-react"
import { ReactElement, useState } from "react"
import { Hidden } from "../Flag/Hidden"
import { preventDefault } from "../Util/PreventDefault"
import { withSound } from "../Util/WithSound"
import { BranchSummaryBranch } from "simple-git"
import { Branch } from "./Branch"
import { setInputValue } from "../Util/SetInputValue"
import { RepositoryProps } from "../Repository/RepositoryProps"

export const Branches = observer(
  ({ repository }: RepositoryProps): ReactElement => {
    const { branches } = repository
    const [showAll, setShowAll] = useState(false)
    const visibleBranches = showAll
      ? branches.sorted
      : branches.sorted.slice(0, 10)
    const rows = visibleBranches.map(
      (branch: BranchSummaryBranch, index: number): ReactElement => (
        <Branch
          branch={branch}
          index={index}
          repository={repository}
          key={branch.name}
        />
      )
    )

    return (
      <div>
        <h3>Branches</h3>
        <form>
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Branch</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>{rows}</tbody>
          </table>
          {!showAll && branches.sorted.length > 10 ? (
            <button type="button" onClick={(): void => setShowAll(true)}>
              Show more
            </button>
          ) : null}
          {showAll && branches.sorted.length > 10 ? (
            <button type="button" onClick={(): void => setShowAll(false)}>
              Show less
            </button>
          ) : null}
        </form>
        <Hidden label="Create" flag={repository.isBranchCreation}>
          <form
            onSubmit={preventDefault(() =>
              withSound(repository.createBranch())
            )}
          >
            <input
              type="text"
              value={repository.newBranchName}
              onChange={setInputValue((value: string): void => {
                repository.newBranchName = value
              })}
              required={true}
            />
            <button type="submit">Create</button>
          </form>
        </Hidden>
      </div>
    )
  }
)
