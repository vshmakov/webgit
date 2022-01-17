import {observer} from "mobx-react";
import {LogProps} from "./LogProps";
import React, {ReactElement} from "react";

export const Message = observer(({log}: LogProps): ReactElement => {
    return (
        <div>
            {log.message}
        </div>
    )
})
