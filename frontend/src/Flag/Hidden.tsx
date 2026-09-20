import { InMemoryFlag } from "./InMemoryFlag"
import { ReactElement, useEffect, useState } from "react"
import { observer } from "mobx-react"
import { Flag } from "./Flag"
import { Checkbox } from "./Checkbox"

interface Props {
  label: string
  flag?: Flag
  onOpen?: () => void
  children: ReactElement
}

export const Hidden = observer((props: Props): ReactElement => {
  const { label, children, onOpen } = props
  const [flag] = useState(props.flag || new InMemoryFlag(false))

  useEffect((): void => {
    if (flag.isChecked) {
      onOpen?.()
    }
  }, [flag.isChecked, onOpen])

  return (
    <div>
      <div>
        <Checkbox label={label} flag={flag} />
      </div>
      <div>{flag.isChecked ? children : null}</div>
    </div>
  )
})
