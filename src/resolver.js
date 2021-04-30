import SquareItem from './squareItem'

/**
 * Check for a match-5+
 * 
 * This function checks for elements surrounding the active indexes in *active_idx_arr*
 * to see if a vertical/horizontal or diagonal line with 5+ items of the same color is form 
 * 
 * @param {*} arr array represents a 2-dimension (*w x h*) grid of items
 * @param {*} active_idx_arr array of all indexes to be checked for a match
 * @param {*} dimen { w, h } *arr*'s dimensions
 * @returns array contains indexes of *arr* that involve in a match
 */
export function checkResolved(arr, active_idx_arr, { w, h }) {
    let resolved = []

    active_idx_arr.forEach(i => {
        resolved = resolved
            .concat(checkResolved_horizontal(arr, i, { w, h }))
            .concat(checkResolved_vertical(arr, i, { w, h }))
            .concat(checkResolved_diagonal(arr, i, { w, h }))
    })
    return resolved
}


function checkResolved_horizontal(arr, i, { w, h }) {
    /* Check horizontal line
     * [ i % w == 0 ] [ i % w == 1 ] ... [ i % w == w-1 ] 
     */
    const st = Math.floor(i / h) * w
    const lineWrap = {
        start: st,
        end: st + w
    }
    return checkResolved_withOffset(arr, i, 1, {
        forward_bound: lineWrap.end,
        backward_bound: lineWrap.start
    })
}

function checkResolved_vertical(arr, i, { w, h }) {
    /*
    * Check vertical line
    * [ i - w]
    * [ i ]
    * [ i + w]
    */
    return checkResolved_withOffset(arr, i, w, {
        forward_bound: arr.length,
        backward_bound: 0
    })
}

function checkResolved_diagonal(arr, i, { w, h }) {
    let resolved = []

    /*
     * Check diagonal line 
     * DIRECTION: \
     */
    resolved = resolved.concat(checkResolved_withOffset(arr, i, w + 1, {
        forward_bound: arr.length,
        backward_bound: 0
    }))

    /*
    * Check diagonal line 
    * DIRECTION: /
    */
    resolved = resolved.concat(checkResolved_withOffset(arr, i, w - 1, {
        forward_bound: arr.length,
        backward_bound: 0
    }))
    return resolved
}

function checkResolved_withOffset(arr, i, offset, { forward_bound, backward_bound }) {

    let resolved = []

    // count forward
    let countForward = []
    for (let incr = i + offset; incr < forward_bound
        && SquareItem.isIdentical(arr[incr], arr[i]); incr += offset) {
        countForward.push(incr)
    }
    // count backward
    let countBackward = []
    for (let decr = i - offset; decr >= backward_bound
        && SquareItem.isIdentical(arr[decr], arr[i]); decr -= offset) {
        countBackward.push(decr)
    }
    // total:
    const count = countBackward.length + countForward.length + 1
    if (count >= 5) {
        resolved = [i].concat(countForward, countBackward)
    }
    return resolved
}