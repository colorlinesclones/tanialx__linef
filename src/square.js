import React from 'react';
import Item from './item';

export default class Square extends React.Component {

    shouldComponentUpdate(nextProps) {
		/** Status */
        if (this.props.isActivated !== nextProps.isActivated) {
            return true
        }
		/** Item */
        // blank -> blank (no change)
        if (this.props.item === null && nextProps.item === null) return false
        // item -> item: compare all sub-properties (type and color) to see if it's the same item
        if (this.props.item !== null && nextProps.item !== null) {
            return this.props.item.type !== nextProps.item.type || this.props.item.color !== nextProps.item.color
        }
        // item -> blank or blank -> item
        return true
    }

    render() {
        let itemOrBlank
        if (this.props.item != null) {
            itemOrBlank = <Item x='22' y='22'
                color={this.props.item.color}
                r={this.props.item.type === 'p' ? 15 : 5} />
        }
        const style = this.props.isActivated ? 'square square-active' : 'square'
        return (
            <div className={style}
                onClick={() => this.props.onClick()}>
                {itemOrBlank}
            </div>
        );
    }
}
