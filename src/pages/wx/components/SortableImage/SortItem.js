import React, {Component} from 'react'
import { sortable } from 'react-sortable'

class Item extends Component {
    render() {
        return (
            <div {...this.props}>
                {this.props.children}
            </div>
        )
    }
}

const SortItem = sortable(Item)

export default SortItem