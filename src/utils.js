/**
 * Get random indexes of an array with some filter conditions
 * @param {*} noOfRandom number of random indexes of input array to be generated
 * @param {*} arr input array
 * @param {*} filter filter condition for index of array
 * @param {*} exclude list of indexes to be excluded
 * @returns an array of random indexes satisfied 
 * 
 * @example 
 * random_indexes_in_array(1, [1, A, Z, 4], idx => idx !== 4, [Z])
 * result: [1], or result: [2]
 */
export function random_indexes_in_array(noOfRandom, arr, filter, exclude) {
    let result = []

    /*
     * fs: an array contains all valid arr's indexes
     * input func (conditionFunc => true/false) is used to decide whether the index is valid
     */
    let fs = arr.reduce((acc, curr, index) => {
        if (curr === null && filter(arr, index) && !exclude.includes(index)) {
            acc.push(index);
        }
        return acc;
    }, []);

    for (let i = 0; i < noOfRandom && fs.length > 0; i++) {

        // 1. Pick a random index fs_idx of free squares ('fs')
        // 2. fs[fs_idx] = corresponding index of 'squares' where there's no item occupied (value to return)
        // 3. Remove element at index free_sqr_idx from free_squares (since it's no longer free)

        const fs_idx = Math.floor(Math.random() * fs.length)
        result.push(fs.splice(fs_idx, 1)[0])
    }
    return result
}