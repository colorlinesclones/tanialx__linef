export default class SquareItem {

    constructor(type, color) {
        this.type = type
        this.color = color
    }

    /**
     * Create a new SquareItem by copying all properties of the input item
     * @param {*} squareItem 
     * @returns 
     */
    static copy(squareItem) {
        return squareItem ? new SquareItem(squareItem.type, squareItem.color) : null
    }

    /**
     * Check if two items is identical
     * @param {*} s1 
     * @param {*} s2 
     * @returns 
     */
    static isIdentical(s1, s2) {
        if (s1 === null || s2 === null) return false
        return s1.type === s2.type && s1.color === s2.color
    }

    isPresentItem() {
        return this.type === 'p'
    }

    isFutureItem() {
        return this.type === 'f'
    }

    isFree() {
        return this.type !== 'p'
    }
}