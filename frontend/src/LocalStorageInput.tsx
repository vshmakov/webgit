import {observer} from "mobx-react";
import {LocalStorage} from "./LocalStorage";
import React, {ReactElement} from "react";
import {setInputValue} from "./SetInputValue";

interface Props {
    storage: LocalStorage<string>,
    title: string,
    required?: boolean
}

export const LocalStorageInput = observer(({storage, title, required}: Props): ReactElement => {
    return (
        <input
            type="text"
            title={title}
            value={storage.getValue()}
            onChange={setInputValue((value: string) => storage.setValue(value))}
            required={required || false}/>
    )
})
