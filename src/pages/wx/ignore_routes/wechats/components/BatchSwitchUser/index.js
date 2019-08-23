/**
 **@Description:
 **@author: leo
 */

import React from 'react'
import {Row, Col, TreeSelect, message, Select} from 'antd'
import toggleModalWarp from 'hoc/toggleModalWarp'
import {hot} from 'react-hot-loader'
import styles from './index.less'
import {connect} from 'dva'

const Option = Select.Option

@hot(module)
@connect(({departments, wx_wechats, loading}) => ({
    departments,
    wx_wechats,
    queryTreesLoading: loading.effects['departments/queryTrees'],
    queryUsersSummaryLoading: loading.effects['wx_wechats/queryUsersSummary'],
    batchSwitchUserLoading: loading.effects['wx_wechats/batchSwitchUser'],
}))
@toggleModalWarp({
    setModalOption: ({highestOption, modalStateOption, modalOption, option, props, state}) => {
        return {
            ...option,
            ...modalOption,
            ...modalStateOption,
            ...highestOption,
            ...{
                title: '批量转给他人',
                width: 520,
                destroyOnClose: true,
                maskClosable: false,
                className: styles.main,
                confirmLoading: props.batchSwitchUserLoading,
            },
        }
    },
})
export default class Index extends React.Component {
    constructor(props) {
        super(props)
        props.setModalOkFn(this.handleOk)
        this.state = {
            loading: false,
            departmentId: undefined,
            userId: undefined,
        }
    }

    componentDidMount() {
        this.loadDepartments()
        this.loadUsers()
    }

    loadDepartments = () => {
        this.props.dispatch({
            type: 'departments/queryTrees',
            payload: {},
        })
    }

    loadUsers = (params) => {
        this.props.dispatch({
            type: 'wx_wechats/queryUsersSummary',
            payload: {
                params: params,
            },
        })
    }

    componentWillUnmount() {
    }

    handleDepartmentChange = (value, node, extra) => {
        this.setState({
            departmentId: value ? parseInt(value, 10) : value,
            userId: undefined,
        })
        this.loadUsers({
            department_id: value,
        })
    }

    handleDepartmentSelect = (value, node, extra) => {
        const deptId = parseInt(node.props.eventKey, 10)
        this.setState({
            departmentId: deptId,
            userId: undefined,
        })
    }

    handleUserChange = (val) => {
        this.setState({
            userId: val,
        })
    }

    getUserNames = () => {
        const {selectedRowKeys, allUsers} = this.props.wx_wechats
        const userNames = []

        selectedRowKeys.forEach((key) => {
            const item = allUsers.find(item => item.id === key)
            if(item){
                userNames.push(item.username)
            }
        })

        return userNames
    }

    handleOk = (e) => {
        e.preventDefault()
        const {userId} = this.state
        if (!userId) {
            message.error('请选择接收者')
            return
        }
        const userNames = this.getUserNames()
        if (!userNames.length) {
            message.error('请选择微信号')
            return
        }

        this.props.dispatch({
            type: 'wx_wechats/batchSwitchUser',
            payload: {
                body: {
                    usernames: userNames,
                    user_id: window.parseInt(this.state.userId),
                },
            },
            callback: () => {
                message.success('转移成功')
                this.props.refresh()
                this.handleCancel()
            },
        })
    }

    handleCancel = () => {
        this.props.onModalCancel()
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
        const {
            queryTreesLoading,
            departments,
            queryUsersSummaryLoading,
            wx_wechats,
        } = this.props
        const {selectedRowKeys = []} = wx_wechats
        const {departmentId, userId} = this.state
        const {treesAll} = departments
        const treeData = this.parseData(treesAll)

        let list = this.props.wx_wechats.usersSummary

        return (
            <div className={styles.content}>
                <div className={styles.title}>
                    已选择{selectedRowKeys.length}个微信号
                </div>
                <Row>
                    <Col span={6}>接收者部门：</Col>
                    <Col
                        span={18}
                    >
                        {
                            treeData ?
                                <TreeSelect
                                    showSearch
                                    allowClear
                                    placeholder="请选择接收者部门"
                                    searchPlaceholder="输入搜索"
                                    treeNodeFilterProp="title"
                                    dropdownMatchSelectWidth={true}
                                    loading={queryTreesLoading}
                                    style={{width: '100%'}}
                                    treeData={treeData}
                                    onChange={this.handleDepartmentChange}
                                    onSelect={this.handleDepartmentSelect}
                                    value={departmentId ? departmentId.toString() : departmentId}
                                /> :
                                ''
                        }
                    </Col>
                </Row>
                <Row>
                    <Col span={6}>
                        接收者：
                    </Col>
                    <Col span={18}>
                        <Select
                            showSearch
                            style={{width: '100%'}}
                            placeholder="请选择接收者"
                            optionFilterProp="children"
                            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            value={userId}
                            loading={queryUsersSummaryLoading}
                            onChange={this.handleUserChange}
                        >
                            {list.map((item) => {
                                return (
                                    <Option
                                        key={item.id}
                                        value={'' + item.id}
                                    >
                                        {item.nickname}
                                    </Option>
                                )
                            })}
                        </Select>
                    </Col>
                </Row>
            </div>
        )
    }
}
