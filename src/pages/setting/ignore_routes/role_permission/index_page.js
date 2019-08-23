/**
 **@Description:
 **@author: leo
 */

import React, {Component} from 'react'
import {connect} from 'dva'
import {Row, Col, Tree, Button, Icon, Menu, Modal, Checkbox} from 'antd'
import HzDropdown from 'setting/components/HzDropdown'
import Page from '@/components/business/Page'
import documentTitleDecorator from 'hoc/documentTitle'
import ModalForm from 'setting/components/ModalForm'
import rules from 'setting/utils/rules'
import styles from './index.less'
import _ from 'lodash'
import ContentHeader from 'business/ContentHeader'

const confirm = Modal.confirm
const TreeNode = Tree.TreeNode

const roleNameBlacklist = ['管理员', '超级管理员', '创建者', '所有者']

@connect(({setting_rolePermission, base}) => ({
    setting_rolePermission,
    base,
}))
@documentTitleDecorator()
export default class Index_page extends Component {
    constructor(props) {
        super(props)
        this.state = {
            modalFormProp: {
                label: '',
                title: '',
                visible: false,
            },
        }
    }

    componentDidMount() {
        this.props.dispatch({
            type: 'setting_rolePermission/getTreeAndQuery',
            payload: {},
        })
    }

    saveFormRef = (formRef) => {
        this.formRef = formRef
    }

    handleCreate = (e) => {
        const {form, data} = this.formRef.props

        form.validateFields((err, values) => {
            if(err) {
                return
            }

            if(data.actionName === 'create') {
                this.props.dispatch({
                    type: 'setting_rolePermission/create',
                    payload: {
                        name: values.name,
                    },
                    callback: (data) => {
                        this.props.dispatch({
                            type: 'setting_rolePermission/query',
                            payload: {},
                            callback: ()=>{
                                this.props.dispatch({
                                    type: 'setting_rolePermission/setActiveRole',
                                    payload: {
                                        key: data.id,
                                    },
                                })
                            }
                        })

                        this.handleCancel()
                    },
                })
            }else if(data.actionName === 'update') {
                this.props.dispatch({
                    type: 'setting_rolePermission/update',
                    payload: {
                        name: values.name,
                        id: data.id,
                    },
                    callback: () => {
                        this.props.dispatch({
                            type: 'setting_rolePermission/query',
                            payload: {},
                        })

                        this.handleCancel()
                    },
                })
            }
        })
    }

    handleCancel = () => {
        const {modalFormProp} = this.state

        this.setState({
            modalFormProp: {
                ...modalFormProp,
                visible: false,
            },
        }, () => {
            this.formRef.props.form.resetFields()
        })
    }

    validateRoleName = (rule, value, callback) => {
        if(!rules.CEN_1328Re.test(value)) {
            return callback('中文、英文、数字、下划线, 限32个字')
        }

        if(roleNameBlacklist.includes(value)) {
            return callback(`禁止写入${roleNameBlacklist.join(',')}`)
        }

        callback()
    }

    addRole = () => {
        let modalFormProp = {
            visible: true,
            label: '添加岗位名称',
            title: '岗位名称',
            placeholder: '请输入岗位名称',
            validateRe: {
                validator: this.validateRoleName,
            },
            data: {
                actionName: 'create',
            },
        }
        this.setState({modalFormProp})
    }

    onMenuDropdownClick = (item, action, e) => {
        e.domEvent.stopPropagation()

        item.select = !item.select
        let modalFormProp = {
            visible: true,
            label: '岗位名称',
            placeholder: '请输入岗位名称',
            validateRe: {
                validator: this.validateRoleName,
            },
            initialValue: item.name,
            data: {
                actionName: 'update',
                id: item.id,
            },
        }

        if(action === 'changeName') {
            modalFormProp.title = '修改岗位'
        }else if(action === 'remove') {
            confirm({
                title: '提示',
                content: '是否确认删除该岗位？',
                okText: '删除',
                cancelText: '取消',
                icon: 'info-circle',
                onOk: () => {
                    return new Promise((resolve, reject) => {
                        this.props.dispatch({
                            type: 'setting_rolePermission/remove',
                            payload: {
                                id: item.id,
                            },
                            callback: (meta) => {
                                this.props.dispatch({
                                    type: 'setting_rolePermission/query',
                                    payload: {},
                                })
                                //
                                // if(meta && meta.code === 200) {
                                //     resolve()
                                // }else{
                                //     reject()
                                // }
                            },
                        })
                        resolve()
                    })
                },
                onCancel() {

                },
            })
            modalFormProp = {}
        }

        this.props.dispatch({
            type: 'setting_rolePermission/setRoles',
            payload: {},
        })

        this.setState({
            modalFormProp,
        })
    }

    handleOutside = (item) => {
        item.select = false

        this.props.dispatch({
            type: 'setting_rolePermission/setRoles',
            payload: {},
        })
    }

    renderMenuDropdown = (item, nodeClick) => {
        const menu = (
            <Menu>
                <Menu.Item
                    onClick={this.onMenuDropdownClick.bind(null, item, 'changeName')}
                >
                    修改名称
                </Menu.Item>
                <Menu.Item
                    onClick={this.onMenuDropdownClick.bind(null, item, 'remove')}
                >
                    删除
                </Menu.Item>
            </Menu>
        )
        return (
            <HzDropdown
                handleOutside={() => {
                    this.handleOutside(item)
                }}
                getPopupContainer={this.getPopupContainer}
                overlay={menu}
                visible
                placement="bottomRight"
            >
                {nodeClick}
            </HzDropdown>
        )
    }

    getPopupContainer = () => {
        let container = document.body
        const menuArea = document.getElementById('menuArea')
        if(menuArea) {
            container = menuArea
        }
        return container
    }

    onDotClick = (item, e, i) => {
        e.stopPropagation()
        item.select = !item.select
        this.props.dispatch({
            type: 'setting_rolePermission/setRoles',
            payload: {},
        })
    }

    menuClick = (item) => {
        this.props.dispatch({
            type: 'setting_rolePermission/setActiveRole',
            payload: {
                key: item.key,
            },
        })
    }

    renderRoles = () => {
        const {
            roles,
        } = this.props.setting_rolePermission

        return roles.map((item, i) => {
            const nodeClick = (
                <div className={styles.menuItemClick}>
                    <Icon
                        className={styles.menuItemDot}
                        type="ellipsis"
                        onClick={this.onDotClick.bind(null, item)}
                    />
                </div>
            )

            return (
                <Menu.Item key={item.id}>
                    <div className={styles.menuItem}>
                        <div className={styles.menuItemTitle} title={item.name}>{item.name}</div>
                        {
                            item.select ? this.renderMenuDropdown(item, nodeClick, i) : nodeClick
                        }
                    </div>
                </Menu.Item>
            )
        })
    }

    saveTree = () => {
        this.props.dispatch({
            type: 'setting_rolePermission/updateActiveRole',
            payload: {},
            callback: () => {
                this.props.dispatch({
                    type: 'setting_rolePermission/query',
                    payload: {},
                })
            },
        })
    }

    onSelectAll = (e) => {
        const checked = e.target.checked
        const {flatTree} = this.props.setting_rolePermission
        let checkedKeys = []
        if(checked) {
            checkedKeys = flatTree.map((item) => {
                return item.id
            })
        }else {
            checkedKeys = flatTree.filter((item) => item.privilege === 2).map((item) => {
                return item.id
            })
        }

        this.props.dispatch({
            type: 'setting_rolePermission/changeActiveRole',
            payload: {
                modules: checkedKeys,
            },
        })
    }

    onCheck = (checkedKeys, e) => {
        const {node} = e
        if(Number(_.get(node, 'props.dataRef.privilege')) === 2) {
            return
        }

        this.props.dispatch({
            type: 'setting_rolePermission/changeActiveRole',
            payload: {
                modules: checkedKeys,
            },
        })
    }

    renderTreeNodes = (data) => {
        return data.map((item) => {
            if(item.children) {
                return (
                    <TreeNode
                        title={item.name}
                        key={item.id}
                        selectable={false}
                        dataRef={item}
                        className={item.privilege === 2 ? `ant-tree-treenode-disabled ${styles.privilege}` : ''}
                        // disabled={item.privilege === 2}
                    >
                        {this.renderTreeNodes(item.children)}
                    </TreeNode>
                )
            }
            return (
                <TreeNode
                    title={item.name}
                    key={item.id}
                    selectable={false}
                    dataRef={item}
                    className={item.privilege === 2 ? `ant-tree-treenode-disabled ${styles.privilege}` : ''}
                    // disabled={item.privilege === 2}
                    {...item}
                />
            )
        })
    }

    getModules = () => {
        const {activeRole, privileges} = this.props.setting_rolePermission
        let modules = []
        if(activeRole) {
            modules = _.unionWith(_.get(activeRole, 'modules', []), privileges, (arrVal, othVal) => {
                return Number(arrVal) === Number(othVal)
            })
        }
        return modules
    }

    render() {
        const {activeRole, flatTree, tree, roles} = this.props.setting_rolePermission
        const modules = this.getModules()
        const checked = modules.length === flatTree.length

        return (
            <Page>
                <ContentHeader
                    contentType={'title'}
                    content={{
                        title: this.props.documentTitle,
                    }}
                    help={{
                        url: 'http://newhelp.51zan.cn/manual/content/%E7%B3%BB%E7%BB%9F%E8%AE%BE%E7%BD%AE/%E5%9B%A2%E9%98%9F.md',
                    }}
                />
                <div className={styles.content}>
                    <Row>
                        <Col span={4}>
                            <Button
                                type="dashed"
                                onClick={this.addRole}
                                className={styles.addRole}
                            >
                                <Icon type="plus"/>添加岗位
                            </Button>
                            <Menu
                                selectedKeys={[String(_.get(activeRole, 'id', ''))]}
                                mode="inline"
                                onClick={this.menuClick}
                                id="menuArea"
                            >
                                {
                                    this.renderRoles()
                                }
                            </Menu>
                        </Col>
                        <Col span={20} className={styles.right}>
                            {
                                roles.length ? (
                                    <React.Fragment>
                                        <div className={styles.title}>
                                            <Button
                                                type="primary"
                                                onClick={this.saveTree}
                                            >
                                                保存
                                            </Button>
                                        </div>
                                        <div className={styles.selectAll}>
                                            <Checkbox
                                                onChange={this.onSelectAll}
                                                checked={checked}
                                            >
                                                全选
                                            </Checkbox>
                                        </div>
                                        <div className={styles.tree}>
                                            <Tree
                                                checkable
                                                onCheck={this.onCheck}
                                                checkedKeys={modules}
                                            >
                                                {this.renderTreeNodes(tree)}
                                            </Tree>
                                        </div>
                                    </React.Fragment>
                                ) : null
                            }
                        </Col>
                    </Row>
                </div>
                <ModalForm
                    wrappedComponentRef={this.saveFormRef}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    {...this.state.modalFormProp}
                />
            </Page>
        )
    }
}
