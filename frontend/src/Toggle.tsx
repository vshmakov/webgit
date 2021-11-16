import {Flag} from "./Flag";
import React, {ReactElement} from "react";
import {observer} from "mobx-react";

interface ToggleProps {
    label: string
    flag?: Flag
    children: ReactElement
}

interface ToggleState {
    flag: Flag
}

export const Toggle = observer(class extends React.Component<ToggleProps, ToggleState> {
    readonly state: ToggleState = {
        flag: this.props.flag || new Flag(false)
    }

    public render(): ReactElement {
        return (
            <div>
                <div>
                    <label>
                        <input
                            type="checkbox"
                            checked={this.state.flag.isChecked}
                            onChange={() => this.state.flag.toggle()}/>
                        {this.props.label}
                    </label>
                </div>
                <div>
                    {this.state.flag.isChecked ? this.props.children : null}
                </div>
            </div>
        )
    }
})
