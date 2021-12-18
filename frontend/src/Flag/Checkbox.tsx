import {observer} from "mobx-react";
import React, {ReactElement} from "react";
import {Flag} from "./Flag";
import {BlockableFlag} from "./BlockableFlag";

interface Props {
    label: string,
    flag: Flag,
}

export const Checkbox = observer(({label, flag}: Props): ReactElement => {
    return (
        <label>
            <input
                type="checkbox"
                checked={flag.isChecked}
                onChange={(): void => flag.toggle()}
                disabled={flag instanceof BlockableFlag && flag.isBlocked()}/>
            {label}
        </label>
    )
})
