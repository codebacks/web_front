/**
 **@Description:
 **@author: leo
 */

import React, {Component} from 'react'
import {
    Modal,
    Input,
    Form,
    Select,
    Button,
    Tree,
    Row,
    Col,
    Icon,
    Checkbox,
    Radio,
    Divider,
    Popover,
    message,
} from 'antd'
import _ from 'lodash'
import styles from './index.less'
import {objToAntdForm} from 'setting/utils'

const transformArr = ['nickname', 'role', 'type', 'adminRemark']
const FormItem = Form.Item
const Option = Select.Option
const {TextArea} = Input
const TreeNode = Tree.TreeNode
const RadioGroup = Radio.Group

@Form.create({
    mapPropsToFields(props) {
        return objToAntdForm(_.get(props, 'setting_auditAccount.userForm', {}), transformArr)
    },
    onFieldsChange(props, field, fields) {
        props.dispatch({
            type: 'setting_auditAccount/setUserForm',
            payload: field,
        })
    },
})
export default class Index extends Component {
    constructor(props) {
        super(props)
        this.state = {
            visible: false,
        }
    }

    componentDidMount() {

    }

    selectDepartment = () => {
        this.props.dispatch({
            type: 'setting_auditAccount/selectTree',
            payload: {},
        })
        this.setState({
            visible: true,
        })
    }

    hideModal = () => {
        this.setState({
            visible: false,
        }, () => {
            this.props.dispatch({
                type: 'setting_auditAccount/setProperty',
                payload: {searchValue: ''},
            })
        })
    }

    handleSubmit = (e) => {
        e.preventDefault()
        this.props.form.validateFields((err, values) => {
            if(!err) {
                const {userForm} = this.props.setting_auditAccount
                if(_.get(userForm, 'departments.length', 0) < 1) {
                    message.error('部门不能为空!')
                    return
                }
                this.props.dispatch({
                    type: 'setting_auditAccount/updateUser',
                    payload: {
                        verify_status: 1,
                        isAdmin: this.isAdmin,
                    },
                    callback: () => {
                        this.props.goPage()
                        this.props.onCancel()
                    },
                })
            }
        })
    }

    onTreeClick = (item, select) => {
        const {userForm} = this.props.setting_auditAccount
        let departments = userForm.departments || []
        if(!select) {
            departments.push({
                name: item.name,
                id: item.id,
                in_charge: false,
            })
        }else {
            departments = departments.filter(department => {
                return department.id !== item.id
            })
        }

        userForm.departments = departments

        this.props.dispatch({
            type: 'setting_auditAccount/setProperty',
            payload: {
                userForm,
            },
        })
    }

    setTreeTitleName = (name) => {
        const {searchValue} = this.props.setting_auditAccount
        const index = name.indexOf(searchValue)
        if(index > -1) {
            const beforeStr = name.substr(0, index)
            const afterStr = name.substr(index + searchValue.length)
            return (
                <span>
                    {beforeStr}
                    <span style={{color: '#f50'}}>{searchValue}</span>
                    {afterStr}
                </span>
            )
        }else {
            return <span>{name}</span>
        }
    }

    renderTreeTitle = (item) => {
        const nodeClick = (
            <div className={styles.treeNodeClick}>
                <Icon
                    className={styles.check}
                    type="check"
                />
            </div>
        )

        const select = !!_.get(this.props, 'setting_auditAccount.userForm.departments', []).find(department => {
            return department.id === item.id
        })

        return (
            <div className={styles.treeNode} onClick={this.onTreeClick.bind(null, item, select)}>
                <div className={styles.treeNodeTitle} title={item.name}>{this.setTreeTitleName(item.name)}</div>
                {
                    select ? nodeClick : null
                }
            </div>
        )
    }

    renderTreeNodes = (data) => {
        return data.map((item) => {
            if(item.children) {
                return (
                    <TreeNode
                        title={this.renderTreeTitle(item)}
                        key={item.id}
                        selectable={false}
                        dataRef={item}
                    >
                        {this.renderTreeNodes(item.children)}
                    </TreeNode>
                )
            }
            return (
                <TreeNode
                    title={this.renderTreeTitle(item)}
                    key={item.id}
                    selectable={false}
                    dataRef={item}
                />
            )
        })
    }

    onLeaderChange = (item) => {
        item.in_charge = !item.in_charge
        this.props.dispatch({
            type: 'setting_auditAccount/updateSelectTree',
            payload: {},
        })
    }

    onLeaderClose = (item) => {
        const {userForm} = this.props.setting_auditAccount
        let departments = userForm.departments || []
        userForm.departments = departments.filter(department => {
            return department.id !== item.id
        })

        this.props.dispatch({
            type: 'setting_auditAccount/setProperty',
            payload: {
                userForm,
            },
        })
    }

    renderSelectedDepartments = () => {
        const departments = _.get(this.props, 'setting_auditAccount.userForm.departments', [])
        return departments.map((department, i) => {
            department.in_charge = !!department.in_charge
            return (
                <div key={`departments-${department.id}-${i}`} className={styles.departmentItem}>
                    <div className={styles.title}>
                        {department.name}
                        <Icon
                            type="close"
                            onClick={this.onLeaderClose.bind(null, department)}
                            className={styles.close}
                        />
                    </div>
                    <Checkbox
                        onChange={this.onLeaderChange.bind(null, department)}
                        className={styles.title}
                        checked={department.in_charge}
                    >
                        负责人
                    </Checkbox>
                </div>
            )
        })
    }

    renderSelectedDepartmentList = () => {
        const departments = _.get(this.props, 'setting_auditAccount.userForm.departments', [])
        return departments.map((department, i) => {
            department.in_charge = !!department.in_charge
            return (
                <div key={`departments-${department.id}-${i}`} className={styles.departmentListItem}>
                    <div className={styles.minus}>
                        <span className={styles.minusIcon} onClick={this.onLeaderClose.bind(null, department)}>
                            <div
                                className={styles.close}
                            />
                        </span>
                        <span className={styles.name} title={department.name}>
                            {department.name}
                        </span>
                    </div>

                    <div className={styles.checkBox}>
                        <Checkbox
                            onChange={this.onLeaderChange.bind(null, department)}
                            className={styles.title}
                            checked={department.in_charge}
                        >
                            负责人
                        </Checkbox>
                    </div>
                </div>
            )
        })
    }

    clickNext = (e) => {
        e.preventDefault()
        this.props.form.validateFields((err, values) => {
            if(!err) {
                const {userForm} = this.props.setting_auditAccount
                if(_.get(userForm, 'departments.length', 0) < 1) {
                    message.error('部门不能为空!')
                    return
                }
                this.props.dispatch({
                    type: 'setting_auditAccount/updateUser',
                    payload: {
                        isAdmin: this.isAdmin,
                        verify_status: 1,
                    },
                    callback: () => {
                        this.props.nextOpen()
                    },
                })
            }
        })
    }

    renderTitle = () => {
        return (
            <Popover
                placement="top"
                overlayStyle={{width: '300px'}}
                content={'管理员无需配置岗位，拥有系统的全部功能与数据权限，除不能操作创建者信息及公司信息外，其他权限等同创建者，请慎重创建管理员'}
            >
                <Icon style={{marginLeft: '6px'}} type="question-circle-o"/>
            </Popover>
        )
    }

    renderType = ({userForm, getFieldValue, formItemLayout, getFieldDecorator}) => {
        if(userForm.is_creator) {
            return (
                <Row className={styles.accountRow}>
                    <Col span={6} className={styles.account}>
                        账号类型：
                    </Col>
                    <Col span={14}>
                        创建者
                        {/*{this.renderTitle()}*/}
                    </Col>
                </Row>
            )
        }

        const {initData} = this.props.base
        const is_creator = _.get(initData, 'user.is_creator')
        if(is_creator) {
            return (
                <FormItem
                    {...formItemLayout}
                    label="账号类型"
                >
                    {getFieldDecorator('type', {
                        rules: [
                            {required: true, message: '必填'},
                        ],
                    })(
                        <RadioGroup>
                            <Radio value={0}>普通账号</Radio>
                            <Radio value={1}>管理员</Radio>
                        </RadioGroup>,
                    )}
                    {this.renderTitle()}
                </FormItem>
            )
        }

        const isAdmin = _.get(initData, 'user.type') === 1

        if(isAdmin) {
            this.isAdmin = true
            return (
                <Row className={styles.accountRow}>
                    <Col span={6} className={styles.account}>
                        账号类型：
                    </Col>
                    <Col span={14}>
                        普通账号
                        {/*{this.renderTitle()}*/}
                    </Col>
                </Row>
            )
        }

        return null
    }

    onExpand = (selectTreeExpandedKeys) => {
        this.props.dispatch({
            type: 'setting_auditAccount/setProperty',
            payload: {selectTreeExpandedKeys},
        })
    }

    onChange = (e) => {
        const value = e.target.value
        this.props.dispatch({
            type: 'setting_auditAccount/searchTreeChange',
            payload: value,
        })
    }

    render() {
        const {visible, onCancel, title, form, setting_auditAccount} = this.props
        const {getFieldDecorator, getFieldValue} = form
        const {roles, userForm, selectTree, selectTreeExpandedKeys, searchValue} = setting_auditAccount

        const formItemLayout = {
            labelCol: {span: 6},
            wrapperCol: {span: 14},
        }

        return (
            <Modal
                visible={visible}
                title={title}
                okText="保存"
                cancelText="取消"
                onCancel={onCancel}
                onOk={this.handleSubmit}
                footer={(
                    <div>
                        <Button onClick={onCancel}>取消</Button>
                        <Button onClick={this.handleSubmit}>确定</Button>
                        <Button type="primary" onClick={this.clickNext}>确定并审核下一个</Button>
                    </div>
                )}
                width={800}
            >
                <Form layout={'horizontal'}>
                    <Row className={styles.accountRow}>
                        <Col span={6} className={styles.account}>
                            账号：
                        </Col>
                        <Col span={14}>
                            {userForm.username}
                        </Col>
                    </Row>
                    <Row className={styles.accountRow}>
                        <Col span={6} className={styles.account}>
                            邀请人：
                        </Col>
                        <Col span={14}>
                            {_.get(userForm, 'invite_user.nickname', '')}
                        </Col>
                    </Row>
                    <Row className={styles.accountRow}>
                        <Col span={6} className={styles.account}>
                            邀请备注：
                        </Col>
                        <Col span={14}>
                            {_.get(userForm, 'remark', '')}
                        </Col>
                    </Row>
                    <Divider/>
                    <FormItem
                        {...formItemLayout}
                        label="申请人"
                    >
                        {getFieldDecorator('nickname', {
                            rules: [
                                {required: true, message: '必填'},
                                {
                                    pattern: /^.{2,20}$/,
                                    message: '限2-20个字'
                                },
                            ],
                        })(
                            <Input placeholder="请输入姓名"/>,
                        )}
                    </FormItem>
                    {
                        this.renderType({userForm, getFieldValue, formItemLayout, getFieldDecorator})
                    }
                    {
                        getFieldValue('type') !== 1 && (
                            <FormItem
                                {...formItemLayout}
                                label="岗位"
                            >
                                {getFieldDecorator('role', {
                                    rules: [
                                        {required: getFieldValue('type') !== '1', message: '必填'},
                                    ],
                                })(
                                    <Select placeholder={'请选择岗位'}>
                                        {roles.map(item => {
                                            return (
                                                <Option value={item.id} key={item.id}>
                                                    {item.name}
                                                </Option>
                                            )
                                        })}
                                    </Select>,
                                )}
                            </FormItem>
                        )
                    }
                    <FormItem
                        {...formItemLayout}
                        label="备注"
                    >
                        {getFieldDecorator('adminRemark', {
                            rules: [
                                {max: 1024, message: '限制1024个字符'},
                            ],
                        })(
                            <TextArea
                                placeholder="备注"
                                rows={4}
                            />,
                        )}
                    </FormItem>
                    <Row className={styles.selectDepartmentRow}>
                        <Col span={6} className={styles.required}>
                            所在部门
                        </Col>
                        <Col span={14}>
                            <Button onClick={this.selectDepartment}>选择部门</Button>
                        </Col>
                    </Row>
                    <Row>
                        <Col offset={6} span={14}>
                            <div className={styles.listTitle}>
                                已选部门
                            </div>
                            {
                                this.renderSelectedDepartmentList()
                            }
                        </Col>
                    </Row>
                </Form>
                <Modal
                    visible={this.state.visible}
                    onOk={this.hideModal}
                    onCancel={this.hideModal}
                    width={700}
                    okText="确认"
                    cancelText="取消"
                >
                    <Row>
                        <Col span={12}>
                            <p className={styles.treeTitle}>
                                选择部门
                            </p>
                            <Input.Search
                                value={searchValue}
                                placeholder="Search"
                                onChange={this.onChange}
                            />
                            <Tree
                                className={styles.tree}
                                onExpand={this.onExpand}
                                expandedKeys={selectTreeExpandedKeys}
                                autoExpandParent={false}
                            >
                                {this.renderTreeNodes(selectTree)}
                            </Tree>
                        </Col>
                        <Col span={12} className={styles.selectedDepartmentsWarp}>
                            <p className={styles.treeTitle}>
                                已选中部门
                            </p>
                            {
                                this.renderSelectedDepartments()
                            }
                        </Col>
                    </Row>
                </Modal>
            </Modal>
        )
    }
}
