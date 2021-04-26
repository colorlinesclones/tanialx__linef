import React from 'react';
import './index.css';
import Square from './square.js';

export default class Board extends React.Component {

    w = 9; h = 9
    colors = ['#98ddca','#d5ecc2','#ffd3b4','#ffaaa7']
    
    constructor(props) {
        super(props);
        this.state = {
            squares: this.initArray(),
            selected: null
        };
    }

    initArray() {
        const sz = this.w * this.h
        let arr = Array(sz).fill(null)
        // Display some random value
        arr[Math.floor(Math.random() * sz)] = this.colors[Math.floor(Math.random() * this.colors.length)]
        arr[Math.floor(Math.random() * sz)] = this.colors[Math.floor(Math.random() * this.colors.length)]
        arr[Math.floor(Math.random() * sz)] = this.colors[Math.floor(Math.random() * this.colors.length)]
        arr[Math.floor(Math.random() * sz)] = this.colors[Math.floor(Math.random() * this.colors.length)]
        return arr
    }

    onSquareClicked(i) {
        const squares = this.state.squares.slice();
        if (squares[i] !== null) {
            // Detect attempt to move item from this square to another square
            this.setState({ selected: i });
        } else if (this.state.selected) {
            // A blank square has just been selected as a move-to destination
            // Remove item from previous square saved in 'selected' state
            // Add item to newly selected square
            // Refresh board's state so that related items are re-rendered
            squares[i] = squares[this.state.selected]
            squares[this.state.selected] = null
            this.setState({squares: squares, selected: null})
        } else {
            // A blank square has just been selected but no revious item selection 
            // recorded in board's state
            // Ignore this click event
            this.setState({ selected: null });
        }
    }

    renderSquare(i, j) {
        const idx = i * this.w + j
        return <Square key={idx} item={this.state.squares[idx]} onClick={() => this.onSquareClicked(idx)} />;
    }

    renderRow(i) {
        let content = []
        for (let j = 0; j < this.w; ++j) {
            content.push(this.renderSquare(i, j))
        }
        return (
            <div className="board-row" key={`row_${i}`}>
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
