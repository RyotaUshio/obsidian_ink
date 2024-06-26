import "./extended-drawing-menu.scss";
import * as React from "react";

//////////
//////////

export const ExtendedWritingMenu: React.FC<{
	onLockClick: Function,
}> = (props) => {

	return <>
		<div
            className = 'ink_extended-writing-menu'
        >
            <button
                onClick = {() => props.onLockClick()}
            >
                Lock
            </button>
            {/* <button
                // onClick = {() => props.onOverflowClick()}
            >
                ...
            </button>            */}
        </div>
	</>

};

export default ExtendedWritingMenu;