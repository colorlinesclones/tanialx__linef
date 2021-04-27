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

            /*
             * Save index of all actively changed square in 'active_idx_arr' variable
             * so that we can check if any set of items is resolved later on
             * (match-5)
             * Only save those contain 'p' items as 'f' items should not result in any match-5
             */
            let active_idx_arr = [i]

            const squares = this.state.squares.slice();

            /** 
             * A blank square has just been selected as a move-to destination
             * Remove item from previous square saved in 'selected' state
             * Add item to newly selected square
             * Refresh board's state so that related items are re-rendered
             */

            // Resolve 'f' items
            if (squares[i] && squares[i].type === 'f') {
                /**
                 * This square is occupied by existing item due to user's move
                 * before future item can acquire it
                 * Render future item at another random square as 'p' (present) item
                 */
                random_free_square_index = this.randomFreeSquareIndex(this.numberOfPreRenderedItemAtEachMove + 1, squares, [i, this.selected])
                const switch_to_idx = random_free_square_index.pop()
                squares[switch_to_idx] = {
                    type: 'p',
                    color: squares[i].color
                }
                // f -> p: add ref to active_idx_arr
                active_idx_arr.push(switch_to_idx)

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
                // f -> p: add ref to active_idx_arr
                active_idx_arr.push(idx)
            })

            // Create new 'f' (future) items (small items) at some random positions
            for (let i = 0; i < this.numberOfPreRenderedItemAtEachMove; i++) {
                squares[random_free_square_index.pop()] = {
                    type: 'f',
                    color: this.colors[Math.floor(Math.random() * this.colors.length)]
                }
            }
            squares[i] = {
                type: squares[this.selected].type,
                color: squares[this.selected].color
            }
            squares[this.selected] = null
            this.selected = null
            const resolved_idx = this.checkResolved(squares, active_idx_arr)
            for (const ri of resolved_idx) {
                squares[ri] = null
            }
            this.setState({ squares: squares })
        } else {
            // A blank square has just been selected but no revious item selection 
            // recorded in board's state
            // Ignore this click event
            this.selected = null
        }
    }

    checkResolved(curr_squares, active_idx_arr) {
        let resolved = []
        const w = parseInt(this.props.w)
        const h = parseInt(this.props.h)

        active_idx_arr.forEach(i => {

            const base_type = curr_squares[i].type
            const base_color = curr_squares[i].color

            /**
             * Check horizontal line [ i % w == 0 ] [ i % w == 1 ] ... [ i % w == w-1 ]
             */
            {
                const line_wrap_start = Math.floor(i / h) * w
                const line_wrap_end = line_wrap_start + w
                // count forward
                let countForward = []
                for (let incr = i + 1; incr < line_wrap_end && curr_squares[incr]
                    && curr_squares[incr].type === base_type
                    && curr_squares[incr].color === base_color; incr++) {
                    countForward.push(incr)
                }
                // count backward
                let countBackward = []
                for (let decr = i - 1; decr >= line_wrap_start && curr_squares[decr]
                    && curr_squares[decr].type === base_type
                    && curr_squares[decr].color === base_color; decr--) {
                    countBackward.push(decr)
                }
                // total:
                const count = countBackward.length + countForward.length + 1
                if (count >= 5) {
                    resolved = [i].concat(countForward, countBackward)
                }
            }
            /**
             * Check vertical line
             * [ i - w]
             * [ i ]
             * [ i + w]
             */
            {
                // count forward
                let countForward = []
                for (let incr = i + w; incr < curr_squares.length && curr_squares[incr]
                    && curr_squares[incr].type === base_type
                    && curr_squares[incr].color === base_color; incr += w) {
                    countForward.push(incr)
                }
                // count backward
                let countBackward = []
                for (let decr = i - w; decr >= 0 && curr_squares[decr]
                    && curr_squares[decr].type === base_type
                    && curr_squares[decr].color === base_color; decr -= w) {
                    countBackward.push(decr)
                }
                // total:
                const count = countBackward.length + countForward.length + 1
                if (count >= 5) {
                    resolved = [i].concat(countForward, countBackward)
                }
            }

            /**
             * Check diagonal line 
             */
        })
        return resolved
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
