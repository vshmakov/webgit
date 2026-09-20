import { observer } from "mobx-react"
import { ReactElement } from "react"
import { Hidden } from "../Flag/Hidden"
import { RepositoryProps } from "../Repository/RepositoryProps"
import { Tag } from "./Tag"
import { preventDefault } from "../Util/PreventDefault"
import { setInputValue } from "../Util/SetInputValue"
import { withSound } from "../Util/WithSound"

export const Tags = observer(
  ({ repository }: RepositoryProps): ReactElement => {
    const tags = repository.tags?.tags || []

    return (
      <Hidden
        label="Tags"
        flag={repository.showTags}
        onOpen={repository.loadTags.bind(repository)}
      >
        <div>
          <table>
            <thead>
              <tr>
                <th>Tag</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tags.map(
                (tag: string): ReactElement => (
                  <Tag tag={tag} repository={repository} key={tag} />
                )
              )}
            </tbody>
          </table>
          <form
            onSubmit={preventDefault(() => withSound(repository.createTag()))}
          >
            <input
              type="text"
              value={repository.newTagName}
              onChange={setInputValue((value: string): void => {
                repository.newTagName = value
              })}
              required={true}
            />
            <button type="submit">Add</button>
          </form>
        </div>
      </Hidden>
    )
  }
)
