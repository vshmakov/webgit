import {InMemoryFlag} from "./InMemoryFlag";
import React, {ReactElement} from "react";
import {observer} from "mobx-react";

interface ToggleProps {
    label: string
    flag?: InMemoryFlag
    children: ReactElement
}

interface ToggleState {
    flag: InMemoryFlag
}

export const Toggle = observer(class extends React.Component<ToggleProps, ToggleState> {
    readonly state: ToggleState = {
        flag: this.props.flag || new InMemoryFlag(false)
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
