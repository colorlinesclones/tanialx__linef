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

    indexNotOccupied(idx) {
        return this.state.squares[idx] === null || this.state.squares[idx].type === 'f'
    }

    scanNextLevel(scanner) {
        let nextLevelNeighbors = []
        for (const idx of scanner.newly_added) {
            const from = scanner.reachable_index.indexOf(idx)

            // 1. Find all squares reachable from the current position
            let neighbor_movable = [] // array contains all neighbor squares reachable from current position


            const check_idx_u = idx - this.w
            const check_idx_l = idx - 1
            const check_idx_r = idx + 1
            const check_idx_d = idx + this.w

            // Check for boundaries:
            let valid_check_idx = []
            const line_wrap = this.lineWrapOfIndex(idx) // line boundaries
            if (check_idx_u >= 0) valid_check_idx.push(check_idx_u)
            if (check_idx_l >= line_wrap.start) valid_check_idx.push(check_idx_l)
            if (check_idx_r < line_wrap.end) valid_check_idx.push(check_idx_r)
            if (check_idx_d < this.w * this.h) valid_check_idx.push(check_idx_d)

            neighbor_movable = valid_check_idx.filter(v_idx => this.indexNotOccupied(v_idx) && !scanner.reachable_index.includes(v_idx))

            for (const n of neighbor_movable) {
                scanner.reachable_index.push(n)
                scanner.reachable_from.push(from)
            }
            nextLevelNeighbors = nextLevelNeighbors.concat(neighbor_movable)
        }
        scanner.newly_added = nextLevelNeighbors
        return scanner
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

        /*
         * Use fScanner & bScanner to store index of squares reachable from 'from-idx' and 'to-idx'
         * 
         * - reachable_index: index of squares reachable from the original position
         * - reachable_from: map 1:1 to reachable_index to keep track of route history
         *                   (we go to reachable_index[i] from reachable_index[reachable_from[i]])
         * - newly_added: all new reachable idx we have added in the current iteration
         *                (their neighbors are not yet added to our main list reachable_index
         *                and should be processed in the next iteration)
         * 
         * During each iteration
         * 1. Collect next-level reachable squares of both from_idx and to_idx into fScanner and bScanner
         * 2. Check for a common index between two scanners. 
         *    If yes, that means our two scanners have encounter each other half-way. From that common index, 
         *    trace back to construct the route
         */

        let fScanner = {
            reachable_index: [from_idx],
            reachable_from: [from_idx],
            newly_added: [from_idx]
        }
        let bScanner = {
            reachable_index: [to_idx],
            reachable_from: [to_idx],
            newly_added: [to_idx]
        }

        /**
         * Find common value in reachable_index array of two input scanners
         * @param {*} fScanner 
         * @param {*} bScanner 
         * @returns the value found
         */
        const findCommonIndex = (fScanner, bScanner) => {
            for (const idx of fScanner.reachable_index) {
                if (bScanner.reachable_index.includes(idx)) {
                    return idx
                }
            }
            return -1
        }
        /**
         * Construct the route to go from original index to the input index
         * @param {*} scanner 
         * @param {*} idx 
         * @returns route[ ]
         */
        const traceBackRoute = (scanner, idx) => {
            let route = []
            let curr = scanner.reachable_index.indexOf(idx)
            while (curr !== 0) {
                const cameFrom = scanner.reachable_from[curr]
                route.push(scanner.reachable_from[cameFrom])
                curr = cameFrom
            }
            return route
        }
        /**
         * Construct the route to go from original index of a scanner to the original index of
         * another scanner based on their common index value
         * @param {*} fScanner 
         * @param {*} bScanner 
         * @param {*} c_idx 
         * @returns route[ ]
         */
        const constructRouteFromCommonIndex = (fScanner, bScanner, c_idx) => {
            let route = traceBackRoute(fScanner, c_idx)
            route.reverse()
            route.push(c_idx)
            route.concat(traceBackRoute(bScanner, c_idx))
            return route
        }

        let scanNext = true
        let isFound = false
        let route = []

        while (scanNext) {
            // 1. Collect next-level reachable squares
            fScanner = this.scanNextLevel(fScanner)
            if (fScanner.newly_added.length === 0) {
                /*
                 * fScanner already includes all reachable squares from 'from_idx'
                 * if 'to_idx' can be reached from 'from_idx', it should have been
                 * resolved in the previous iteration
                 */
                scanNext = false
                isFound = false
                break
            }

            bScanner = this.scanNextLevel(bScanner)
            if (bScanner.newly_added.length === 0) {
                /*
                 * bScanner already includes all reachable squares from 'to_idx'
                 * if 'from_idx' can be reached from 'to_idx', it should have been
                 * resolved in the previous iteration
                 */
                scanNext = false
                isFound = false
                break
            }

            // 2. Check for a common index
            const cIdx = findCommonIndex(fScanner, bScanner)
            if (cIdx >= 0) {
                route = constructRouteFromCommonIndex(fScanner, bScanner, cIdx)
                isFound = true
                scanNext = false
            }
        }

        return {
            found: isFound,
            route: route
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
