import React from 'react';
import './index.css';
import Square from './square.js';

export default class Board extends React.Component {

    w = 9; h = 9
    
    constructor(props) {
        super(props);
        this.state = {
            squares: Array(this.w*this.h).fill(null),
        };
    }

    onSquareClicked(i) {
        const squares = this.state.squares.slice();
        squares[i] = 'X';
        this.setState({ squares: squares });
    }

    renderSquare(i, j) {
        const idx = i * this.w + j
        return <Square key={idx} value={this.state.squares[idx]} onClick={() => this.onSquareClicked(idx)} />;
    }

    renderRow(i) {
        let content = []
        for (let j = 0; j < this.w; ++j) {
            content.push(this.renderSquare(i, j))
        }
        return (
            <div className="board-row">
                {content}
            </div>
        )
    }

    renderRows() {
        let content = [];
        for (let i = 0; i < this.h; i++) {
            content.push(this.renderRow(i));
        }
        return content
    }

    render() {
        return (
            <div>
                {this.renderRows()}
            </div>
        );
    }
}
