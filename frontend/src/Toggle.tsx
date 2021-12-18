import {InMemoryFlag} from "./Flag/InMemoryFlag";
import React, {ReactElement, useState} from "react";
import {observer} from "mobx-react";
import {Flag} from "./Flag/Flag";
import {Checkbox} from "./Flag/Checkbox";

interface Props {
    label: string
    flag?: Flag
    children: ReactElement
}

export const Toggle = observer((props: Props): ReactElement => {
    const {label, children} = props
    const [flag] = useState(props.flag || new InMemoryFlag(false))

    return (
        <div>
            <div>
                <Checkbox label={label} flag={flag}/>
            </div>
            <div>
                {flag.isChecked ? children : null}
            </div>
        </div>
    )
})
