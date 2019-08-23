'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: liyan [randonely@gmail.com]
 * 创建日期: 18/08/14
 */
import React from 'react'
import PropTypes from 'prop-types'
import {TreeSelect} from 'antd'
import {connect} from 'dva'
import classNames from 'classnames'

import styles from './index.less'

@connect(({base, departments}) => ({
    base, departments,
}))
export default class extends React.Component {
    static propTypes = {
        cls: PropTypes.string,
        placeholder: PropTypes.string,
        searchPlaceholder: PropTypes.string,
        departmentId: PropTypes.string,
        onChange: PropTypes.func,
    }

    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {
        this.loadDepartments()
    }

    loadDepartments = () => {
        this.props.dispatch({
            type: 'departments/queryTreesCurrent',
            payload: {}
        })
    };

    handleChange = (value, node, extra) => {
        const name = node && node.length ? node[0] : undefined
        this.props.onChange(value, name)
    }

    parseData = (data) => {
        if (data && data.length) {
            return data.map((item) => {
                return {
                    key: item.id.toString(),
                    value: item.id.toString(),
                    title: item.name,
                    children: item.children ? this.parseData(item.children) : [],
                }
            })
        }
        return []
    }

    render() {
        const {departments: {trees}, departmentId, cls, placeholder, searchPlaceholder} = this.props
        const treeData = this.parseData(trees)

        return (
            <div>
                { treeData ? <TreeSelect
                    showSearch
                    allowClear
                    placeholder={placeholder || '全部部门'}
                    searchPlaceholder={searchPlaceholder || '输入搜索'}
                    treeNodeFilterProp="title"
                    dropdownClassName={classNames(styles.dropDown, cls)}
                    dropdownMatchSelectWidth={true}
                    style={{width: '100%'}}
                    treeData={treeData}
                    onChange={this.handleChange}
                    value={departmentId ?  departmentId.toString() : departmentId}
                /> : ''
                }
            </div>
        )
    }
}

