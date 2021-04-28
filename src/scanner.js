export default class Scanner {

    /**
     * Object to calculate the route to go from node:@fromValue to node:@toValue
     * provided that the one step route from a value to its neighbors is supplied
     * by function @neighborFuncCheck
     * 
     * @param {*} fromValue
     * @param {*} toValue
     * @param {*} func_getNeighbors function used to retrieve valid neighbors of an index
     * @example neighborFuncCheck = index => [ neighbor_1, neighbor_2, ...]
     */
    constructor(fromValue, toValue, func_getNeighbors) {
        /*
         * Use fScanner & bScanner to store node reachable from 'fromValue' and 'toValue'
         * 
         * - reachable_index: node reachable from the original position
         * - reachable_from: map 1:1 to reachable_index to keep track of route history
         *                   (we go to reachable_index[i] from reachable_index[reachable_from[i]])
         * - newly_added: all new reachable idx we have added in the current iteration
         *                (their neighbors are not yet added to our main list reachable_index
         *                and should be processed in the next iteration)
         */
        this.f = {
            reachable_index: [fromValue],
            reachable_from: [fromValue],
            newly_added: [fromValue]
        }
        this.b = {
            reachable_index: [toValue],
            reachable_from: [toValue],
            newly_added: [toValue]
        }
        this.func_getNeighbors = func_getNeighbors
    }

    /**
    * Construct the route to go from original node to the input node
    * @param {*} scanner 
    * @param {*} idx 
    * @returns route[ ]
    */
    traceBackRoute(scanner, idx) {
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
     * Find common value in reachable_index array of two input scanners
     * @param {*} fScanner 
     * @param {*} bScanner 
     * @returns the value found
     */
    findCommonIndex() {
        for (const idx of this.f.reachable_index) {
            if (this.b.reachable_index.includes(idx)) {
                return idx
            }
        }
        return -1
    }

    /**
     * Construct the route to go from original node of a scanner to the original node of
     * another scanner based on their common index value
     * @param {*} fScanner 
     * @param {*} bScanner 
     * @param {*} c_idx 
     * @returns route[ ]
     */
    constructRouteFromCommonIndex(c_idx) {
        let route = this.traceBackRoute(this.f, c_idx)
        route.reverse()
        route.push(c_idx)
        route.concat(this.traceBackRoute(this.b, c_idx))
        return route
    }

    tryConstructRouteFromCommonIndex() {
        const c_idx = this.findCommonIndex()
        if (c_idx >= 0) {
            return this.constructRouteFromCommonIndex(c_idx)
        }
        return []
    }

    scanNextLevelF() {
        this.scanNextLevel(this.f)
    }

    scanNextLevelB() {
        this.scanNextLevel(this.b)
    }

    /**
     * scan next level of reachable node
     * 
     * Steps:
     * 1. for each item of 'newly_added' array, find all reachable neighbors of that item
     * 2. add new item to 'reachable_index' array, and reference their array index in 'reachable_from'
     * 3. replace 'newly_added' items with the new ones from step 1
     * 
     * @param {*} scanner 
     * @returns 
     */
    scanNextLevel(scanner) {
        let nextLevelNeighbors = []
        for (const idx of scanner.newly_added) {
            const from = scanner.reachable_index.indexOf(idx)

            // 1. Find all values reachable from the current position
            let neighbor_movable = this.func_getNeighbors(idx)
            neighbor_movable = neighbor_movable.filter(n => !scanner.reachable_index.includes(n))

            for (const n of neighbor_movable) {
                scanner.reachable_index.push(n)
                scanner.reachable_from.push(from)
            }
            nextLevelNeighbors = nextLevelNeighbors.concat(neighbor_movable)
        }
        scanner.newly_added = nextLevelNeighbors
        return scanner
    }

    findRoute() {
        let isFound = false
        let route = []

        /*
         * During each iteration
         * 1. Collect next-level reachable nodes of both 'from' and 'to' into fScanner and bScanner
         * 2. Check for a common index between two scanners. 
         *    If yes, that means our two scanners have encounter each other half-way. From that common index, 
         *    trace back to construct the route
         */

        while (!isFound) {

            // 1. Collect next-level reachable squares
            this.scanNextLevelF()
            if (this.f.newly_added.length === 0) {
                /*
                 * fScanner already includes all reachable squares from 'from_idx'
                 * if 'to_idx' can be reached from 'from_idx', it should have been
                 * resolved in the previous iteration
                 */
                isFound = false
                break
            }

            // 2. Check for a common index
            route = this.tryConstructRouteFromCommonIndex()
            if (route && route.length > 0) {
                isFound = true
                break
            }

            this.scanNextLevelB()
            if (this.b.newly_added.length === 0) {
                /*
                 * bScanner already includes all reachable squares from 'to_idx'
                 * if 'from_idx' can be reached from 'to_idx', it should have been
                 * resolved in the previous iteration
                 */
                isFound = false
                break
            }

            // Check for a common index again as scanner.b is updated
            route = this.tryConstructRouteFromCommonIndex()
            if (route && route.length > 0) {
                isFound = true
                break
            }
        }
        return {
            found: isFound,
            route: route
        }
    }
}
