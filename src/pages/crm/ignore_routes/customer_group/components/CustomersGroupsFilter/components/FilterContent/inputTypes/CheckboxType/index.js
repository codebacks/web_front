/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2019/1/14
 */

import React from 'react'
import {
    Checkbox,
} from 'antd'
// import styles from './index.less'
import PropTypes from "prop-types"

export default class extends React.PureComponent {
    static propTypes = {}

    static defaultProps = {}

    onChange = (checkedValues) => {
        const {
            item,
            setFilterContentState,
        } = this.props

        item.values = checkedValues
        setFilterContentState(item)
    }

    render() {
        const {
            item,
            options,
        } = this.props

        return (
            <Checkbox.Group
                options={options}
                value={item.values}
                onChange={this.onChange}
            />
        )
    }
}

