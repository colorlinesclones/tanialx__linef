import React from "react";

export default class Score extends React.Component {

    render() {
        return (
            <span>{this.props.score}</span>
        )
    }
}