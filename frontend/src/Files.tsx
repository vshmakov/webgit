import {observer} from "mobx-react";
import React, {ReactElement} from "react";
import {RepositoryProps} from "./RepositoryProps";
import {FileStatusResult} from "simple-git/typings/response";
import {withSound} from "./WithSound";

export const Files = observer(class extends React.Component<RepositoryProps> {
    public render(): ReactElement {
        const {status} = this.props;

        return (
            <div>
                <h3>Files</h3>
                <table>
                    <thead>
                    <tr>
                        <th>File</th>
                        <th>Directory</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {status.files.map(this.renderFile.bind(this))}
                    </tbody>
                </table>
            </div>
        )
            ;
    }

    private renderFile(file: FileStatusResult): ReactElement {
        const Status = {
            A: 'Added',
            D: 'Deleted',
            M: 'Modified',
            "?": "New",
        }

        const workingDir = file.working_dir as keyof typeof Status

        const {name, directory} = this.splitFileName(file)

        return (
            <tr key={file.path}>
                <td>                    {name}                </td>
                <td>{directory}</td>
                <td>
                    {Status[workingDir] || workingDir}
                </td>
                <td>
                    <button
                        type='button'
                        onClick={() => withSound(this.props.state.declineFile(file))}>
                        Decline
                    </button>
                </td>
            </tr>
        )
    }

    private splitFileName(file: FileStatusResult): { name: string, directory: string } {
        const parts = file.path.split('/')

        return {
            name: parts.pop() || '',
            directory: parts.join('/')
        }
    }
})
