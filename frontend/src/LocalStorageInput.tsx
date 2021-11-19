import {observer} from "mobx-react";
import {LocalStorage} from "./LocalStorage";
import React, {ReactElement} from "react";
import {setInputValue} from "./SetInputValue";

export const LocalStorageInput = observer(({
                                               storage,
                                               required
                                           }: { storage: LocalStorage<string>, required?: boolean }): ReactElement => {
    return (
        <input
            type="text"
            value={storage.getValue()}
            onChange={setInputValue((value: string) => storage.setValue(value))}
            required={required || false}/>
    )
})
