import React from "react";

export default class Item extends React.PureComponent {

    render() {
        return (
            <svg height={this.props.y * 2} width={this.props.x * 2}>
                <circle cx={this.props.x} cy={this.props.y} r={this.props.r} stroke="#555555" strokeWidth="1" fill={this.props.color} />
            </svg>
        );
    }
}