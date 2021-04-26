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

    randomFreeSquareIndex(no_of_random, squares, excludes) {
        let free_square_index_arr = []

        /**
         * An array contains all blank square's index (no item)
         * We will generate random positions to render related items based on this array
         * so that all items are rendered in their own separate square
         */
        let fs = squares.reduce((acc, curr, index) => {
            if (curr === null && !excludes.includes(index)) {
                acc.push(index);
            }
            return acc;
        }, []);
        console.log(`Free squares fs: ${JSON.stringify(fs)}`)
        for (let i = 0; i < no_of_random; i++) {

            // 1. Pick a random index fs_idx of free squares ('fs')
            // 2. fs[fs_idx] = corresponding index of 'squares' where there's no item occupied (value to return)
            // 3. Remove element at index free_sqr_idx from free_squares (since it's no longer free)

            const fs_idx = Math.floor(Math.random() * fs.length)
            free_square_index_arr.push(fs.splice(fs_idx, 1)[0])
        }
        return free_square_index_arr
    }

    onSquareClicked(i) {
        if (this.state.squares[i] !== null && this.state.squares[i].type === 'p') {
            // Detect attempt to move item from this square to another square
            this.selected = i
        } else if (this.selected != null) {

            const squares = this.state.squares.slice();

            let random_free_square_index = null

            /** 
             * A blank square has just been selected as a move-to destination
             * Remove item from previous square saved in 'selected' state
             * Add item to newly selected square
             * Refresh board's state so that related items are re-rendered
             */

            // Resolve 'f' item
            if (squares[i] && squares[i].type === 'f') {
                /**
                 * This square is occupied by existing item due to user's move
                 * before future item can acquire it
                 * Render future item at another random square as 'p' (present) item
                 */
                random_free_square_index = this.randomFreeSquareIndex(2, squares, [i, this.selected])
                squares[random_free_square_index.pop()] = {
                    type: 'p',
                    color: squares[i].color
                }
            } else {
                /** No conflict related to 'f' item. Render full size */
                const f_idx = squares.findIndex(f => f && f.type === 'f')
                if (f_idx >= 0) {
                    squares[f_idx] = {
                        type: 'p',
                        color: squares[f_idx].color
                    }
                }
                random_free_square_index = this.randomFreeSquareIndex(1, squares, [i, this.selected])
            }
            // Create a new 'f' (future) item (small item) at another random position
            squares[random_free_square_index.pop()] = {
                type: 'f',
                color: this.colors[Math.floor(Math.random() * this.colors.length)]
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
