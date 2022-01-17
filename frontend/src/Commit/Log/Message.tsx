import {observer} from "mobx-react";
import {LogProps} from "./LogProps";
import React, {ReactElement, useState} from "react";
import {setInputValue} from "../../Util/SetInputValue";
import {preventDefault} from "../../Util/PreventDefault";
import {RepositoryProps} from "../../Repository/RepositoryProps";
import {withSound} from "../../Util/WithSound";

export const Message = observer(({log, repository}: LogProps & RepositoryProps): ReactElement => {
    const [message, setMessage] = useState(log.message)
    const [isEditing, setEditing] = useState(false)

    if (!isEditing) {
        return (
            <div onClick={setEditing.bind(null, true)}>
                {log.message}
            </div>
        )
    }

    return (
        <form onSubmit={preventDefault((): void => {
            withSound(repository.changeCommitMessage(log.hash, message))
            setEditing(false)
        })}>
            <input
                type="text"
                value={message}
                onChange={setInputValue(setMessage)}
                required={true}/>
            <button type='submit'>
                Save
            </button>
            <button onClick={preventDefault(setEditing.bind(null, false))}>
                Cansel
            </button>
        </form>
    )
})
