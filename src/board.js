import React from 'react';
import './index.css';
import Square from './square.js';

export default class Board extends React.Component {

    w = 9; h = 9
    colors = ['#98ddca', '#d5ecc2', '#ffd3b4', '#ffaaa7']

    constructor(props) {
        super(props);
        this.state = {
            squares: this.initArray()
        };
        this.selected = null
    }

    initArray() {
        const sz = this.w * this.h
        let arr = Array(sz).fill(null)
        // Display some random value
        arr[Math.floor(Math.random() * sz)] = {
            type: 'p',
            color: this.colors[Math.floor(Math.random() * this.colors.length)]
        }
        arr[Math.floor(Math.random() * sz)] = {
            type: 'p',
            color: this.colors[Math.floor(Math.random() * this.colors.length)]
        }
        arr[Math.floor(Math.random() * sz)] = {
            type: 'p',
            color: this.colors[Math.floor(Math.random() * this.colors.length)]
        }
        arr[Math.floor(Math.random() * sz)] = {
            type: 'p',
            color: this.colors[Math.floor(Math.random() * this.colors.length)]
        }
        arr[Math.floor(Math.random() * sz)] = {
            type: 'f',
            color: this.colors[Math.floor(Math.random() * this.colors.length)]
        }
        return arr
    }

    onSquareClicked(i) {
        if (this.state.squares[i] !== null && this.state.squares[i].type === 'p') {
            // Detect attempt to move item from this square to another square
            this.selected = i
        } else if (this.selected != null) {

            const squares = this.state.squares.slice();
            /** 
             * A blank square has just been selected as a move-to destination
             * Remove item from previous square saved in 'selected' state
             * Add item to newly selected square
             * Refresh board's state so that related items are re-rendered
             */

            if (squares[i] && squares[i].type === 'f') {
                /**
                 * This square is occupied by existing item due to user's move
                 * before future item can acquire it
                 * Render future item at another random square as 'p' (present) item,
                 * and render a new 'f' (future) item (small item) at another position
                 * @todo ensure selected two squares are blank 
                 */
                squares[Math.floor(Math.random() * squares.length)] = {
                    type: 'p',
                    color: squares[i].color
                }
                squares[Math.floor(Math.random() * squares.length)] = {
                    type: 'f',
                    color: this.colors[Math.floor(Math.random() * this.colors.length)]
                }
            }
            squares[i] = squares[this.selected]
            squares[this.selected] = null
            this.selected = null
            this.setState({ squares: squares })
        } else {
            // A blank square has just been selected but no revious item selection 
            // recorded in board's state
            // Ignore this click event
            this.selected = null
        }
    }

    renderSquare(idx) {
        return <Square key={idx} identifier={idx} item={this.state.squares[idx]} onClick={() => this.onSquareClicked(idx)} />;
    }

    renderRow(i) {
        let content = []
        for (let j = 0; j < this.w; ++j) {
            const idx = i * this.w + j
            content.push(this.renderSquare(idx))
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
