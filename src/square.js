import React from 'react';
import Item from './item';

export default class Square extends React.PureComponent {

    constructor(props) {
        super(props)
        this.onClick = this.onClick.bind(this)
    }

    onClick() {
        this.props.onClick(this.props.identifier)
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
                onClick={this.onClick}>
                {itemOrBlank}
            </div>
        );
    }
}
