'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 16/12/29
 */


import React from 'react'
import {Modal, Row, Col, Select, notification, TreeSelect} from 'antd'
import {connect} from 'dva'
import styles from './SwitchUser.scss'

const Option = Select.Option

@connect(({departments, users}) => ({
    departments, users
}))
class ModifyForm extends React.Component {
    constructor(props) {
        super()
        this.state = {
            record: null,
            loading: false,
            departmentId: undefined,
            userId: undefined,
        }
    }

    componentDidMount() {
        const record = this.props.record
        this.setState({record: record})
        this.loadDepartments()
        this.loadUsers()
    }


    loadDepartments = () => {
        this.props.dispatch({
            type: 'departments/queryTrees',
            payload: {}
        })
    };

    loadUsers = (params) => {
        this.props.dispatch({
            type: 'wx_wechats/queryUsersSummary',
            payload: {
                params: params
            },
        })
    }

    handleDepartmentChange = (value, node, extra) => {
        this.setState({
            departmentId: value ? parseInt(value, 10) :  value,
            userId: undefined,
        })
        this.loadUsers({
            department_id: value
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
            userId: val
        })
    };

    handleSave = () => {
        if (this.state.userId) {
            setTimeout(() => {
                this.props.dispatch({
                    type: 'wx_wechats/switchUser',
                    payload: {
                        body: {
                            username: this.state.record.username,
                            user_id: window.parseInt(this.state.userId)
                        }},
                    callback: () => {
                        this.props.onCancel()
                    }
                })
            }, 0)
        } else {
            notification.error({
                message: '错误提示',
                description: '请选择接收者',
            })
        }
    };

    parseData  = (data) => {
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
        let record = this.props.record

        const {departmentId, userId} = this.state
        const {treesAll} = this.props.departments
        const treeData = this.parseData(treesAll)

        let list = Array.from(this.props.wx_wechats.usersSummary)
        list = list.filter((item) => {
            return item.enabled && item.id !== record.user_id
        })

        return (
            <Modal title="转给其它用户"
                   visible={this.props.visible}
                   style={{width: '80%'}}
                   className={styles.editModal}
                   maskClosable={false}
                   confirmLoading={this.props.wx_wechats.switchLoading}
                   onOk={this.handleSave}
                   onCancel={this.props.onCancel}
            >
                <div className={styles.form}>
                    <Row>
                        <Col span={6}>
							微信昵称：
                        </Col>
                        <Col span={18}>{record.nickname}</Col>
                    </Row>
                    <Row>
                        <Col span={6}>接收者部门：</Col>
                        <Col span={18} id={`switchUser${record.user_id}`}>
                            { treeData ? <TreeSelect
                                showSearch
                                allowClear
                                placeholder='请选择接收者部门'
                                searchPlaceholder='输入搜索'
                                treeNodeFilterProp="title"
                                dropdownMatchSelectWidth={true}
                                getPopupContainer={()=>document.getElementById(`switchUser${record.user_id}`)}
                                style={{width: '100%'}}
                                treeData={treeData}
                                onChange={this.handleDepartmentChange}
                                onSelect={this.handleDepartmentSelect}
                                value={departmentId ?  departmentId.toString() : departmentId}
                            /> : ''
                            }
                        </Col>
                    </Row>
                    <Row>
                        <Col span={6}>
							接收者：
                        </Col>
                        <Col span={18}>
                            <Select showSearch
                                    style={{width: '100%'}}
                                    placeholder="请选择接收者"
                                    optionFilterProp="children"
                                    filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                    value={userId}
                                    onChange={this.handleUserChange}>
                                {list.map((item) => {
                                    return <Option key={item.id} value={'' + item.id}>{item.nickname}</Option>
                                })}</Select>
                        </Col>
                    </Row>
                </div>
            </Modal>
        )
    }
}

ModifyForm.propTypes = {}


export default ModifyForm
