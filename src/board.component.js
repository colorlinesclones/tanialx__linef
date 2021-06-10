import React from 'react';
import Square from './square.component.js';
import Scanner from './scanner';
import SquareItem from './squareItem';
import { random_indexes_in_array } from './utils'
import { checkResolved } from './resolver'

export default class Board extends React.PureComponent {

    constructor(props) {
        super(props);
        this.w = parseInt(this.props.w)
        this.h = parseInt(this.props.h)
        this.colors = ['#FF9494', '#FFD08B', '#E2E68C', '#A8F0D4', '#9DE2FE', '#C5B8F0', '#FBD8FF']
        this.noRandomF = 3
        this.state = {
            squares: this.initArray(),
            selected: null
        };
        this.onSquareSelected = this.onSquareSelected.bind(this)
        this.validNeighborIndex = this.validNeighborIndex.bind(this)
    }

    randomColor() {
        return this.colors[Math.floor(Math.random() * this.colors.length)]
    }

    newPresentItem(color) {
        return new SquareItem('p', color ? color : this.randomColor())
    }

    newFutureItem() {
        return new SquareItem('f', this.randomColor())
    }

    initArray() {
        let arr = Array(this.w * this.h).fill(null)
        const noRandomP = 5;
        const noRandomF = this.noRandomF;
        /*
         * Generate random positions for present items and future items using random_indexes_in_array:
         * board hasn't been initialized yet so there's no pre-occupied items in any square
         * - pass a dummy filter condition () => true
         * - and a dummy exclude array []
         */
        let fIdx = random_indexes_in_array(noRandomP + noRandomF, arr, () => true, [])

        for (let i = 0; i < noRandomP; i++) arr[fIdx.pop()] = this.newPresentItem()
        for (let i = 0; i < noRandomF; i++) arr[fIdx.pop()] = this.newFutureItem()

        return arr
    }

    indexOfCurrentFutureItems() {
        var indexes = [], i;
        const sq = this.state.squares;
        for (i = 0; i < sq.length; i++) {
            if (sq[i] && sq[i].isFutureItem()) {
                indexes.push(i);
            }
        }
        return indexes;
    }

    lineWrapOfIndex(idx) {
        const st = Math.floor(idx / this.h) * this.w
        return {
            start: st,
            end: st + this.w
        }
    }

    /**
     * function to retrieve neighbor squares that item at square idx can move to
     * @param {*} idx
     * @returns 
     */
    validNeighborIndex(idx) {
        const check_idx_u = idx - this.w
        const check_idx_l = idx - 1
        const check_idx_r = idx + 1
        const check_idx_d = idx + this.w

        // Check for boundaries:
        let valid_check_idx = []
        const line_wrap = this.lineWrapOfIndex(idx)

        if (check_idx_u >= 0) valid_check_idx.push(check_idx_u)
        if (check_idx_l >= line_wrap.start) valid_check_idx.push(check_idx_l)
        if (check_idx_r < line_wrap.end) valid_check_idx.push(check_idx_r)
        if (check_idx_d < this.w * this.h) valid_check_idx.push(check_idx_d)

        return valid_check_idx.filter(v_idx => this.isSquareFree(this.state.squares, v_idx))
    }

    isSquareFree(square, idx) {
        return square[idx] === null || square[idx].isFree()
    }

    // CLICK-EVENT ===================================================================

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
        const scanner = new Scanner(from_idx, to_idx, this.validNeighborIndex)
        const findRoute = scanner.findRoute()

        return {
            found: findRoute.found,
            route: findRoute.route
        }
    }

    /**
     * signal that an item is selected by user click, and may be moved
     * to another position at next click event
     * @param {*} i 
     */
    updateState_moveFrom(i) {
        this.setState({ selected: i })
    }

    /**
     * logic to update game state when moving an item at square *this.state.selected*
     * to square *i* which is already confirmed to be a blank square
     * @param {*} i index of destination square
     */
    updateState_moveItemTo(i) {
        /*
         * A blank square has just been selected as a move-to destination
         * - Remove item from previous square saved in 'selected' state
         * - Add item to newly selected square
         * - Refresh board's state so that related items are re-rendered
         */

        let random_free_square_index = null
        let idx_of_f_items = this.indexOfCurrentFutureItems()

        /*
         * Save index of all actively changed square in active_idx_arr variable
         * so that we can check if any set of items is resolved later on (eg. result in a match-5+)
         * Only save those contain 'p' items as 'f' items should not result in any match-5
         */
        let active_idx_arr = [i]

        const squares = this.state.squares.slice();

        /*
         * Resolve 'f' item:
         * - Extra check to see if we are moving the selected item to a square where a future item is
         * expected to be rendered
         * - If yes, we have to find another random square to render that 'f' item as 'p' 
         */
        const isFutureItemAt_i = squares[i] && squares[i].isFutureItem()
        const itemAt_i = SquareItem.copy(squares[i])

        /* update move-to position with properties of selected item */
        squares[i] = SquareItem.copy(squares[this.state.selected])

        /* remove selected item from its previous position */
        squares[this.state.selected] = null

        /* Check if any match-5+ is found. 
         *
         * If no match-5+ is found, small items should grow to full-size
         * (this will result in new active indexes, so we need to check for match-5 again after that)
         */
        let resolved_idx = checkResolved(squares, active_idx_arr, { w: this.w, h: this.h })

        if (resolved_idx.length === 0) { // No match-5+ found

            // Reset active indexes array since there's no match-5 found for those indexes during previous check
            // This array is going to be filled with position in which f-items grow to p-items
            active_idx_arr = []

            if (isFutureItemAt_i) { 
                /*
                 * if this is originally where an f-item is, but is then occupied by the moved item
                 * - select a new position for the f-item
                 * - replace item-move-to index from 'idx_of_f_items' array with the new random position,
                 *   so that it is rendered full-size later on together with other current f-items
                 */
                random_free_square_index = random_indexes_in_array(this.noRandomF + 1, squares, this.isSquareFree, [i])
                const switch_to_idx = random_free_square_index.pop()
                squares[switch_to_idx] = itemAt_i
    
                idx_of_f_items.splice(idx_of_f_items.indexOf(i), 1)
                idx_of_f_items.push(switch_to_idx)
            } else {
                random_free_square_index = random_indexes_in_array(this.noRandomF, squares, this.isSquareFree, [i])
            }

            // render full-size all f-items now
            idx_of_f_items.forEach(idx => {
                squares[idx] = this.newPresentItem(squares[idx].color)
                // f -> p: add ref to active_idx_arr
                active_idx_arr.push(idx)
            })

            // Create new 'f' (future) items (small items) at some random positions
            for (let i = 0; i < this.noRandomF && random_free_square_index.length > 0; i++) {
                squares[random_free_square_index.pop()] = this.newFutureItem()
            }

            /* again, check if any match-5+ is found */
            resolved_idx = checkResolved(squares, active_idx_arr, { w: this.w, h: this.h })
            for (const ri of resolved_idx) {
                squares[ri] = null
            }
        } else { 
            
            // Some match-5+ found -> no new item pops up (f-items state unchanged)
            // clear all cell involved in the match-5+ (except for the f-item at move-to position, if any)

            for (const ri of resolved_idx) {
                squares[ri] = null
            }
            if (isFutureItemAt_i) {
                squares[i] = itemAt_i
            }
        }

        /* signal react to re-render board */
        this.setState({ squares: squares, selected: null })

        // Update score: send signal to parent component (Game)
        if (resolved_idx.length > 0) {
            this.props.score_incr(resolved_idx.length)
        }
    }

    /**
     * calculation logic and possible state changes when a click event is performed on a square
     * @param {*} i index of selected square in *squares* array
     * @returns 
     */
    onSquareSelected(i) {

        // Detect attempt to move item from this square to another square        
        if (this.state.squares[i] && this.state.squares[i].isPresentItem()) {
            // An item is selected to be moved later on
            this.updateState_moveFrom(i)
            return
        }

        if (this.state.selected != null /* A destination to move selected item to has been selected */
            && this.movable(this.state.selected, i).found /* and a valid path is confirmed */) {
            this.updateState_moveItemTo(i)
            return
        }
        // Else: Ignore this click event since a blank square has just been selected
        // but no previous item-to-move is recorded in board's state
    }

    // REACT-RENDER ===================================================================

    renderSquare(idx) {
        return <Square key={idx}
            item={this.state.squares[idx]}
            identifier={idx}
            onClick={this.onSquareSelected}
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
