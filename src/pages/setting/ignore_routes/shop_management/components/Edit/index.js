/**
 **@Description:
 **@author: leo
 */

import React, {Component} from 'react'
import {
    Modal,
    Input,
    Form,
    Radio,
    Select,
    Button,
    Tree,
    Row,
    Col,
    Icon,
    Checkbox,
} from 'antd'
import styles from './index.scss'
import rules from 'setting/utils/rules'

const FormItem = Form.Item
const RadioGroup = Radio.Group
const Option = Select.Option
const {TextArea} = Input
const TreeNode = Tree.TreeNode

const treeData = [{
    title: '产品部',
    key: '0-0',
    children: [
        {
            title: 'UE/UX',
            key: '0-0-0',
        }, {
            title: '产品',
            key: '0-0-1',
        }],
}, {
    title: '技术部_123',
    key: '0-1',
    children: [
        {title: '前端', key: '0-1-0'},
        {title: '后端', key: '0-1-1'},
    ],
}, {
    title: '销售部@哈哈',
    key: '0-2',
    children: [
        {
            title: '销售1', key: '0-2-0', children: [
                {title: '销售1', key: '0-2-0-0'},
                {title: '销售2', key: '0-2-0-1'},
            ],
        },
    ],
}]

function treeForEach(treeData, cb) {
    treeData.forEach((data) => {
        cb(data)
        if(data.children) {
            treeForEach(data.children, cb)
        }
    })
}

@Form.create()
export default class Index extends Component {
    constructor(props) {
        super(props)
        this.state = {
            visible: false,
            treeData: this.convertTreeData(treeData),
            selectedDepartments: [],
        }
    }

    convertTreeData(treeData) {
        return treeData
    }

    selectDepartment = () => {
        this.setState({
            visible: true,
        })
    }

    hideModal = () => {
        this.setState({
            visible: false,
        })
    }

    handleSubmit = (e) => {
        e.preventDefault()
        this.props.form.validateFields((err, values) => {
            if(!err) {
                console.log('Received values of form: ', values)
            }
        })
    }

    onTreeClick = (item) => {
        item.select = !item.select
        let {treeData, selectedDepartments} = this.state
        if(item.select) {
            selectedDepartments.push(item)
        }else {
            selectedDepartments = selectedDepartments.filter(selectedDepartment => {
                return selectedDepartment.key !== item.key
            })
        }

        this.setState({
            treeData,
            selectedDepartments,
        })
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

        return (
            <div className={styles.treeNode} onClick={this.onTreeClick.bind(null, item)}>
                {item.title}
                {
                    item.select ? nodeClick : null
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
                        key={item.key}
                        selectable={false}
                    >
                        {this.renderTreeNodes(item.children)}
                    </TreeNode>
                )
            }
            return (
                <TreeNode
                    title={this.renderTreeTitle(item)}
                    key={item.key}
                    selectable={false}
                />
            )
        })
    }

    onLeaderChange = (item) => {

    }

    onLeaderClose = (item) => {
        let {treeData, selectedDepartments} = this.state
        selectedDepartments = selectedDepartments.filter(selectedDepartment => {
            return selectedDepartment.key !== item.key
        })

        treeForEach(treeData, (data) => {
            if(item.key === data.key) {
                data.select = false
            }
        })

        this.setState({
            treeData,
            selectedDepartments,
        })
    }

    renderSelectedDepartments = () => {
        const {selectedDepartments} = this.state
        return selectedDepartments.map((selectedDepartment, i) => {
            return (
                <div key={`${selectedDepartment}-${i}`} className={styles.departmentItem}>
                    <div className={styles.title}>{selectedDepartment.title}</div>
                    <Checkbox
                        onChange={this.onLeaderChange.bind(null, selectedDepartment)}
                        className={styles.title}
                    >
                        负责人
                    </Checkbox>
                    <Icon
                        type="close"
                        onClick={this.onLeaderClose.bind(null, selectedDepartment)}
                        className={styles.close}
                    />
                </div>
            )
        })
    }

    render() {
        const {visible, onCancel, title} = this.props
        const {getFieldDecorator} = this.props.form

        const formItemLayout = {
            labelCol: {span: 6},
            wrapperCol: {span: 14},
        }

        return (
            <Modal
                visible={visible}
                title={title}
                okText="保存"
                cancelText="关闭"
                onCancel={onCancel}
                onOk={this.handleSubmit}
                width={800}
            >
                <Form layout={'horizontal'}>
                    <FormItem
                        {...formItemLayout}
                        label="账号类型"
                    >
                        {getFieldDecorator('radio-group', {
                            rules: [
                                {required: true, message: '必填'},
                            ],
                        })(
                            <RadioGroup>
                                <Radio value="a">普通账号</Radio>
                                <Radio value="b">管理员</Radio>
                            </RadioGroup>,
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="登录账号"
                    >
                        {getFieldDecorator('account', {
                            rules: [
                                {required: true, message: '必填'},
                                {pattern: rules.NE116Re, message: '英文、数字、下划线, 1-16'},
                            ],
                        })(
                            <Row>
                                <Col span={20}>
                                    <Input placeholder="建议使用手机号"/>
                                </Col>
                                <Col span={4}>
                                    @sdfsfds
                                </Col>
                            </Row>,
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="登录密码"
                    >
                        {getFieldDecorator('password', {
                            rules: [
                                {required: true, message: '必填'},
                                {pattern: /^[a-zA-Z0-9_]{6,16}$/, message: '英文、数字、下划线, 6-16'},
                            ],
                        })(
                            <Input placeholder="限制6-16"/>,
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="岗位"
                    >
                        {getFieldDecorator('sdfdsf', {
                            rules: [
                                {required: true, message: '必填'},
                            ],
                        })(
                            <Select placeholder={'请选择岗位'}>
                                <Option value="1">Option 1</Option>
                                <Option value="2">Option 2</Option>
                                <Option value="3">Option 3</Option>
                            </Select>,
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="姓名"
                    >
                        {getFieldDecorator('name', {
                            rules: [
                                {required: true, message: '必填'},
                                {pattern: /^[a-zA-Z0-9\u4E00-\u9FA5\uF900-\uFA2D]{2,20}$/, message: '中文、英文、数字, 2-20'},
                            ],
                        })(
                            <Input placeholder="请输入姓名"/>,
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="备注"
                    >
                        {getFieldDecorator('remark', {
                            rules: [
                                {pattern: /^[a-zA-Z0-9\u4E00-\u9FA5\uF900-\uFA2D]{0,1024}$/, message: '限制1024个字符'},
                            ],
                        })(
                            <TextArea
                                placeholder="备注"
                                rows={4}
                            />,
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="所在部门"
                    >
                        <Button onClick={this.selectDepartment}>选择部门</Button>
                    </FormItem>
                    <Row>
                        <Col offset={6} span={14}>
                            {
                                this.renderSelectedDepartments()
                            }
                        </Col>
                    </Row>
                </Form>
                <Modal
                    visible={this.state.visible}
                    onOk={this.hideModal}
                    onCancel={this.hideModal}
                    okText="确认"
                    cancelText="取消"
                >
                    <Row>
                        <Col span={12}>
                            <p className={styles.treeTitle}>
                                选择部门
                            </p>
                            <Tree
                                defaultExpandAll
                                className={styles.tree}
                            >
                                {this.renderTreeNodes(this.state.treeData)}
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
