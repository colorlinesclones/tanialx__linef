import React from 'react';
import Item from './item';

export default class Square extends React.Component {

    shouldComponentUpdate(nextProps) {
        return this.props.item !== nextProps.item;
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