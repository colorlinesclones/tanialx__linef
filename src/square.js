import React from 'react';
import Item from './item';

export default class Square extends React.Component {

    shouldComponentUpdate(nextProps) {
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
        return (
            <div className="square"
                onClick={() => this.props.onClick()}>
                {itemOrBlank}
            </div>
        );
    }
}
