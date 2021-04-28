import React from 'react';
import './index.css';
import Square from './square.js';

export default class Board extends React.Component {

    constructor(props) {
        super(props);
        this.w = parseInt(this.props.w)
        this.h = parseInt(this.props.h)
        this.colors = ['#FF9494', '#FFD08B', '#E2E68C', '#A8F0D4', '#9DE2FE', '#C5B8F0', '#FBD8FF']
        this.numberOfPreRenderedItemAtEachMove = 3
        this.state = {
            squares: this.initArray(),
            selected: null
        };
    }

    initArray() {
        let arr = Array(this.w * this.h).fill(null)
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

        for (let i = 0; i < no_of_random; i++) {

            // 1. Pick a random index fs_idx of free squares ('fs')
            // 2. fs[fs_idx] = corresponding index of 'squares' where there's no item occupied (value to return)
            // 3. Remove element at index free_sqr_idx from free_squares (since it's no longer free)

            const fs_idx = Math.floor(Math.random() * fs.length)
            free_square_index_arr.push(fs.splice(fs_idx, 1)[0])
        }
        return free_square_index_arr
    }

    lineWrapOfIndex(idx) {
        const st = Math.floor(idx / this.h) * this.w
        return {
            start: st,
            end: st + this.w
        }
    }

    /**
     * check if there's a clear path for item to move from
     * one square to another
     * @param {*} from_idx current position index
     * @param {*} to_idx destination index
     * @returns true if a path is found; false otherwise
     */
    movable(from_idx, to_idx) {
        /*
         * at regular location, item can move to 4 neighbor squares
         * i: index of item
         * X: where i can move to, if its index is valid
         * 
         * also, i-1 and i+1 should be within line boundaries as item at beginning of one row
         * should not be able to move to the end of the previous row
         * 
         * [   ] [i-w] [   ]
         * [i-1] [<i>] [i+1]
         * [   ] [i+w] [   ]
         * 
         */

        const sq = this.state.squares
        const max_idx = sq.length
        const w = this.w

        const indexNotOccupied = idx => sq[idx] === null || sq[idx].type === 'f'

        /*
         * - try_route: current route (stack of index) we are checking
         * - current_try_postion: current index we are chechking
         * - valid_mvs: save all possible routes that we have not yet checked so that
         *              we can come back later to check for another route in case the
         *              current route fails
         * - retry_other_route: signal that to_idx cannot be reached from the route we're currenty trying
         * - try_next: signal that we should continue try/retry with next interations as there are
         *             still possibilities of a clear path found
         * - isFound: information of our result
         * - failed_idx: keep track of failed check: there's no path to to_idx from these, so that
         *               we don't need to same index over and over again in the next iterations
         */
        let current_try_postion = from_idx
        let try_route = [from_idx]
        let valid_mvs = {}
        let retry_other_route = false;
        let try_next = true
        let isFound = false
        let failed_idx = []

        /**
         * check if this index should be excluded from recursively checking
         * to prevent forming a cycle
         * either 
         * - it is in the fail-list ('failed_idx') that we already checked, or
         * - it is included in try_route (that means we have travelled through this idx at some previous iteration)
         * @param {*} idx index to check
         * @returns 
         */
        const exclude = idx => try_route.includes(idx) || failed_idx.includes(idx)

        while (try_next) {

            if (retry_other_route) {
                /**
                 * there's no way to reach to to_idx using the current route, we have to
                 * come back to previous check-point and retry for another route
                 */
                // mark current position index as 'failed'
                failed_idx.push(try_route.pop())

                if (try_route.length === 0) {
                    // all routes tried but no path found
                    try_next = false
                    isFound = false
                } else {
                    // return to a previous check-point
                    const previous_checkpoint = try_route[try_route.length - 1]

                    // retrieve all reachable neighbors of 'curr_from' that we previously store in 'valid_vms'
                    let neighbors = valid_mvs[previous_checkpoint]
                    if (!neighbors || neighbors.length === 0) {
                        // all neighbors have been tried and no success
                        retry_other_route = true
                    } else {
                        // Set up our new current-postion
                        current_try_postion = neighbors.pop()
                        try_route.push(current_try_postion)
                        retry_other_route = false
                    }
                }
            } else {
                /*
                 * Continue with the current route as there's no conflict yet
                 */

                // line boundaries
                const line_wrap = this.lineWrapOfIndex(current_try_postion)

                // 1. Find all squares reachable from the current position

                let neighbor_movable = []
                const check_idx_u = current_try_postion - w
                const check_idx_l = current_try_postion - 1
                const check_idx_r = current_try_postion + 1
                const check_idx_d = current_try_postion + w
                if (check_idx_u === to_idx || check_idx_l === to_idx || check_idx_r === to_idx || check_idx_d === to_idx) {
                    try_next = false
                    isFound = true
                    try_route.push(to_idx)
                    break
                }
                if (check_idx_u >= 0 && indexNotOccupied(check_idx_u) && !exclude(check_idx_u)) {
                    neighbor_movable.push(check_idx_u)
                }
                if (check_idx_l >= line_wrap.start && indexNotOccupied(check_idx_l) && !exclude(check_idx_l)) {
                    neighbor_movable.push(check_idx_l)
                }
                if (check_idx_r < line_wrap.end && indexNotOccupied(check_idx_r) && !exclude(check_idx_r)) {
                    neighbor_movable.push(check_idx_r)
                }
                if (check_idx_d < max_idx && indexNotOccupied(check_idx_d) && !exclude(check_idx_d)) {
                    neighbor_movable.push(check_idx_d)
                }

                // 2. If no reachable neighbor is found, prepare to come back and try for another route
                if (neighbor_movable.length === 0) {
                    retry_other_route = true
                } else {
                    // otherwise, move to one of the neighbors, and save the remaining in 'valid_mvs' in case
                    // we need to come back later
                    valid_mvs[current_try_postion] = neighbor_movable
                    current_try_postion = neighbor_movable.pop()
                    try_route.push(current_try_postion)
                }
            }
        }
        
        return {
            found: isFound,
            route: isFound ? try_route : []
        }
    }

    onSquareClicked(i) {
        if (this.state.squares[i] !== null && this.state.squares[i].type === 'p') {
            // Detect attempt to move item from this square to another square        
            this.setState({ selected: i })
        } else if (this.state.selected != null && this.movable(this.state.selected, i).found) {

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
                random_free_square_index = this.randomFreeSquareIndex(this.numberOfPreRenderedItemAtEachMove + 1, squares, [i, this.state.selected])
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
                random_free_square_index = this.randomFreeSquareIndex(this.numberOfPreRenderedItemAtEachMove, squares, [i, this.state.selected])
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
                type: squares[this.state.selected].type,
                color: squares[this.state.selected].color
            }
            squares[this.state.selected] = null
            const resolved_idx = this.checkResolved(squares, active_idx_arr)
            for (const ri of resolved_idx) {
                squares[ri] = null
            }
            this.setState({ squares: squares, selected: null })
            // Update score
            if (resolved_idx.length > 0) {
                this.props.score_incr(resolved_idx.length)
            }
        } else {
            // A blank square has just been selected but no revious item selection 
            // recorded in board's state
            // Ignore this click event
            this.setState({ selected: null })
        }
    }

    checkResolved(curr_squares, active_idx_arr) {
        let resolved = []
        const w = this.w
        const h = this.h

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
             * DIRECTION: \
             */
            {
                // count forward
                let countForward = []
                for (let incr = i + w + 1; incr < curr_squares.length && curr_squares[incr]
                    && curr_squares[incr].type === base_type
                    && curr_squares[incr].color === base_color; incr += (w + 1)) {
                    countForward.push(incr)
                }
                // count backward
                let countBackward = []
                for (let decr = i - w - 1; decr >= 0 && curr_squares[decr]
                    && curr_squares[decr].type === base_type
                    && curr_squares[decr].color === base_color; decr -= (w + 1)) {
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
            * DIRECTION: /
            */
            {
                // count forward
                let countForward = []
                for (let incr = i + w - 1; incr < curr_squares.length && curr_squares[incr]
                    && curr_squares[incr].type === base_type
                    && curr_squares[incr].color === base_color; incr += (w - 1)) {
                    countForward.push(incr)
                }
                // count backward
                let countBackward = []
                for (let decr = i - w + 1; decr >= 0 && curr_squares[decr]
                    && curr_squares[decr].type === base_type
                    && curr_squares[decr].color === base_color; decr -= (w - 1)) {
                    countBackward.push(decr)
                }
                // total:
                const count = countBackward.length + countForward.length + 1
                if (count >= 5) {
                    resolved = [i].concat(countForward, countBackward)
                }
            }
        })
        return resolved
    }

    renderSquare(idx) {
        return <Square key={idx}
            item={this.state.squares[idx]}
            onClick={() => this.onSquareClicked(idx)}
            isActivated={this.state.selected === idx} />;
    }

    renderRows() {
        let content = [];
        for (let i = 0; i < this.state.squares.length; i++) {
            content.push(this.renderSquare(i));
        }
        return content
    }

    render() {
        return (
            <div className='game-board'>
                {this.renderRows()}
            </div>
        );
    }
}
