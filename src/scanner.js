export default class Scanner {

    /**
     * Object to calculate the route to go from @fromValue to @toValue
     * provided that the one step route from a value to its neighbors is supplied
     * by function @neighborFuncCheck
     * 
     * @param {*} fromValue
     * @param {*} toValue
     * @param {*} neighborFuncCheck function used to retrieve valid neighbors of an index
     * @example neighborFuncCheck = index => [ neighbor_1, neighbor_2, ...]
     */
    constructor(fromValue, toValue, neighborFuncCheck) {
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
        this.neighborFuncCheck = neighborFuncCheck
    }

    /**
    * Construct the route to go from original index to the input index
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
     * Construct the route to go from original index of a scanner to the original index of
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

    scanNextLevelF() {
        this.scanNextLevel(this.f)
    }

    scanNextLevelB() {
        this.scanNextLevel(this.b)
    }

    /**
     * scan next level of reachable values
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
            let neighbor_movable = this.neighborFuncCheck(idx)
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
}
