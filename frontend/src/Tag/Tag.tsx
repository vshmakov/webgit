import { observer } from "mobx-react"
import { ReactElement } from "react"
import { RepositoryProps } from "../Repository/RepositoryProps"
import { withSound } from "../Util/WithSound"

interface Props {
  tag: string
}

export const Tag = observer(
  ({ tag, repository }: Props & RepositoryProps): ReactElement => (
    <tr>
      <td>{tag}</td>
      <td>
        <button
          type="button"
          onClick={() => withSound(repository.checkout(tag))}
        >
          Checkout
        </button>
        <button
          type="button"
          onClick={() => withSound(repository.deleteTag(tag))}
        >
          Delete
        </button>
      </td>
    </tr>
  )
)
