import React from "react";

export default class Item extends React.PureComponent {

    render() {
        return (
            <svg height="100%" width="100%">
                <circle cx="50%" cy="50%" r={this.props.r} stroke="#555555" strokeWidth="1" fill={this.props.color} />
            </svg>
        );
    }
}