import React from 'react';
import './index.css';
import Square from './square.js';

export default class Board extends React.Component {

    constructor(props) {
        super(props);
        this.colors = ['#98ddca', '#d5ecc2', '#ffd3b4', '#ffaaa7']
        this.selected = null
        this.numberOfPreRenderedItemAtEachMove = 3
        this.state = {
            squares: this.initArray()
        };
    }

    initArray() {
        let arr = Array(this.props.w * this.props.h).fill(null)
        const noRandomP = 5;
        const noRandomF = this.numberOfPreRenderedItemAtEachMove;
        let freeSquareIdxArr = this.randomFreeSquareIndex(noRandomP + noRandomF, arr, [])
        for (let i = 0; i < noRandomP; i++) {
            arr[freeSquareIdxArr.pop()] = {
                type: 'p',
                color: this.colors[Math.floor(Math.random() * this.colors.length)]
            }
        } for (let i = 0; i < noRandomF; i++) {
            arr[freeSquareIdxArr.pop()] = {
                type: 'f',
                color: this.colors[Math.floor(Math.random() * this.colors.length)]
            }
        }
        return arr
    }

    fItems() {
        var indexes = [], i;
        const sq = this.state.squares;
        for (i = 0; i < sq.length; i++) {
            if (sq[i] && sq[i].type === 'f') {
                indexes.push(i);
            }
        }
        return indexes;
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

            let random_free_square_index = null
            let idx_of_f_items = this.fItems()
            const squares = this.state.squares.slice();

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
                random_free_square_index = this.randomFreeSquareIndex(this.numberOfPreRenderedItemAtEachMove + 1, squares, [i, this.selected])
                squares[random_free_square_index.pop()] = {
                    type: 'p',
                    color: squares[i].color
                }
                // remove this index from 'idx_of_f_items' array
                idx_of_f_items.splice(idx_of_f_items.indexOf(i), 1)
            } else {
                random_free_square_index = this.randomFreeSquareIndex(this.numberOfPreRenderedItemAtEachMove, squares, [i, this.selected])
            }
            /** For all other f-items with no conflict, render full-size */
            idx_of_f_items.forEach(idx => {
                squares[idx] = {
                    type: 'p',
                    color: squares[idx].color
                }
            })

            // Create a new 'f' (future) item (small item) at another random position
            for (let i = 0; i < this.numberOfPreRenderedItemAtEachMove; i++) {
                squares[random_free_square_index.pop()] = {
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
        for (let j = 0; j < this.props.w; ++j) {
            const idx = i * this.props.w + j
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
        for (let i = 0; i < this.props.h; i++) {
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
