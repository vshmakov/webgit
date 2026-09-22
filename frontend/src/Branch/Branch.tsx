import { observer } from "mobx-react"
import { ReactElement, useState } from "react"
import { MergeBranchIntoCurrentButton } from "./MergeBranchIntoCurrentButton"
import { getTracking } from "./GetTracking"
import { BranchProps } from "./BranchProps"
import { canMergeTracking } from "./CanMergeTracking"
import { MergeTrackingButton } from "./MergeTrackingButton"
import { canPush } from "./CanPush"
import { PushButton } from "./PushButton"
import { CreatePullRequestLink } from "./CreatePullRequestLink"
import { IndexProps } from "./IndexProps"
import { CheckoutRadio } from "./CheckoutRadio"
import { RepositoryProps } from "../Repository/RepositoryProps"
import { withSound } from "../Util/WithSound"
import { isCurrent } from "./IsCurrent"
import { RebaseWithTrackingButton } from "./RebaseWithTrackingButton"
import { RebaseCurrentWithBranch } from "./RebaseCurrentWithBranch"

export const Branch = observer(
  ({
    branch,
    index,
    repository
  }: BranchProps & IndexProps & RepositoryProps): ReactElement => {
    const { status } = repository
    const url = repository.remoteState.getCreatePullRequestUrl(branch)
    const [showActions, setShowActions] = useState(false)
    const canModifyAnotherBranch = !isCurrent(branch, status)
    const hasMoreActions =
      (isCurrent(branch, status) && null !== url) ||
      canModifyAnotherBranch ||
      canMergeTracking(branch, status)

    return (
      <tr>
        <td>
          <CheckoutRadio
            branch={branch}
            index={index}
            repository={repository}
          />
        </td>
        <td>
          {repository.getBranchName(branch)}
          {" " + getTracking(branch, status)}
        </td>
        <td>
          {canPush(branch, status) ? (
            <PushButton repository={repository} />
          ) : null}
          {canMergeTracking(branch, status) ? (
            <>
              <RebaseWithTrackingButton repository={repository} />
              <MergeTrackingButton repository={repository} />
            </>
          ) : null}
          {hasMoreActions ? (
            <>
              <button
                type="button"
                onClick={(): void => setShowActions(!showActions)}
              >
                {showActions ? "Hide actions" : "More actions"}
              </button>
              {showActions ? (
                <>
                  {isCurrent(branch, status) && null !== url ? (
                    <CreatePullRequestLink url={url} branch={branch} />
                  ) : null}
                  {canModifyAnotherBranch
                    ? [
                        <RebaseCurrentWithBranch
                          branch={branch}
                          repository={repository}
                        />,
                        <MergeBranchIntoCurrentButton
                          branch={branch}
                          repository={repository}
                        />
                      ]
                    : null}
                  {canModifyAnotherBranch ? (
                    <button
                      type="button"
                      onClick={(): void => {
                        if (
                          window.confirm(
                            `Delete branch "${branch.name}"? This action cannot be undone.`
                          )
                        ) {
                          withSound(repository.deleteBranch(branch.name))
                        }
                      }}
                    >
                      Delete branch
                    </button>
                  ) : null}
                </>
              ) : null}
            </>
          ) : null}
        </td>
      </tr>
    )
  }
)
