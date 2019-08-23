'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: liyan [randonely@gmail.com]
 * 创建日期: 18/08/14
 */
import React from 'react'
import PropTypes from 'prop-types'
import {Select,} from 'antd'
import {connect} from 'dva'

// import styles from './index.less'

const Option = Select.Option

@connect(({base}) => ({
    base,
}))
export default class extends React.Component {
    static propTypes = {
        cls: PropTypes.string,
        placeholder: PropTypes.string,
        departmentId: PropTypes.string,
        userId: PropTypes.oneOfType(
            [PropTypes.string, PropTypes.number]
        ),
        onChange: PropTypes.func,
    }
    constructor(props) {
        super(props)
        this.state = {
            users: [],
        }
    }

    componentDidMount() {
        this.loadUsers()
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.departmentId !== prevProps.departmentId) {
            this.loadUsers()
            // this.handleChange()
        }
    }

    loadUsers = () => {
        this.props.dispatch({
            type: 'users/querySub',
            payload: {
                params: {
                    department_id: this.props.departmentId || undefined
                }
            },
            callback: (data) => {
                this.setState({
                    users: data
                })
            }
        })
    }

    handleChange = (value, option) => {
        const name = option && option.props ? option.props.children : undefined
        this.props.onChange(value, name)
    }

    render() {
        const {users,} = this.state
        const {cls, placeholder, userId} = this.props

        return (
            <div className={cls}>
                <Select
                    allowClear
                    showSearch
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                    placeholder={placeholder || '全部员工'}
                    optionFilterProp="children"
                    filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                    style={{width: '100%'}}
                    onChange={this.handleChange}
                    value={userId}
                >
                    <Option value="">全部【员工】</Option>
                    {
                        users.map((item)=>{
                            let val = `${item.nickname}【${item.username}】`
                            return <Option key={item.id} value={item.id}>{val}</Option>
                        })
                    }
                </Select>
            </div>
        )
    }
}

