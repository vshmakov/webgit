import {observer} from "mobx-react";
import React, {ReactElement} from "react";
import {RepositoryProps} from "./Repository/RepositoryProps";
import {LocalStorageInput} from "./LocalStorage/LocalStorageInput";

export const SectionCommitPrefix = observer(({repository}: RepositoryProps): ReactElement => {
    if (!repository.useSectionCommitMessagePrefix.isChecked) {
        return (
            <span></span>
        )
    }

return (
    <span>
        [<LocalStorageInput title='' storage={repository.sectionCommitMessagePrefix} required={true}/>]
    </span>
)
})
