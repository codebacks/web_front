/**
 **@Description:
 **@author: leo
 */

import React, {Component} from 'react'
import {connect} from 'dva'
import {
    Row,
    Col,
    Tree,
    Button,
    Icon,
    Menu,
    Modal,
    Checkbox,
    Select,
    Input,
    Table,
    Pagination,
    Badge,
    Divider,
    Spin,
} from 'antd'
import Link from 'umi/link'
import HzDropdown from 'setting/components/HzDropdown'
import Page from '@/components/business/Page'
import documentTitleDecorator from 'hoc/documentTitle'
import ContentHeader from 'business/ContentHeader'
import reactHotDecorator from 'hoc/reactHot'
import ModalForm from 'setting/components/ModalForm'
import Edit from './components/Edit'
import rules from 'setting/utils/rules'
import styles from './index.less'
import _ from 'lodash'
import departmentsApi from 'common/api/departments'
import {hot} from 'react-hot-loader'

const Option = Select.Option
const TreeNode = Tree.TreeNode
const confirm = Modal.confirm

const freeVersionId = 0

const typeMap = {
    0: '普通用户',
    1: '管理员',
}

@hot(module)
@reactHotDecorator()
@connect(({setting_teamManagement, loading, base}) => ({
    setting_teamManagement,
    base,
    tableLoading: loading.effects['setting_teamManagement/queryUsers'],
    treeLoading: loading.effects['setting_teamManagement/tree'],
}))
@documentTitleDecorator()
export default class Index extends Component {
    constructor(props) {
        super(props)
        this.state = {
            modalFormProp: {
                label: '',
                title: '',
                visible: false,
            },
            editProp: {
                visible: false,
            },
            addVisible: false,
        }
    }

    componentDidMount() {
        this.loadTree(() => {
            this.goPage(1)
        })
        this.props.dispatch({
            type: 'setting_teamManagement/invitationInit',
            payload: {},
        })
        this.props.dispatch({
            type: 'setting_teamManagement/roles',
            payload: {},
        })
    }

    loadTree = (callback) => {
        this.props.dispatch({
            type: 'setting_teamManagement/tree',
            payload: {},
            callback,
        })
    }

    goPage = page => {
        if(typeof page === 'undefined') {
            page = this.props.setting_teamManagement.current
        }
        this.props.dispatch({
            type: 'setting_teamManagement/queryUsers',
            payload: {page: page},
        })
    }

    onTreeClick = (item, e) => {
        e.stopPropagation()

        item.select = !item.select
        this.props.dispatch({
            type: 'setting_teamManagement/updateTree',
            payload: {},
        })
    }

    handleCreate = (e) => {
        const {form, data} = this.formRef.props

        form.validateFields((err, values) => {
            if(err) {
                return
            }

            if(data.actionName === 'create') {
                this.props.dispatch({
                    type: 'setting_teamManagement/create',
                    payload: {
                        name: values.name,
                        parent_id: data.parent_id,
                    },
                    callback: () => {
                        this.loadTree()

                        this.handleCancel()
                    },
                })
            }else if(data.actionName === 'update') {
                this.props.dispatch({
                    type: 'setting_teamManagement/update',
                    payload: {
                        name: values.name,
                        id: data.id,
                    },
                    callback: () => {
                        this.loadTree()

                        this.handleCancel()
                    },
                })
            }else if(data.actionName === 'updateCompanyName') {
                this.props.dispatch({
                    type: 'setting_teamManagement/updateCompany',
                    payload: {
                        name: values.name,
                        id: data.id,
                    },
                    callback: () => {
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

    editCancel = () => {
        const {editProp} = this.state
        this.setState({
            editProp: {
                ...editProp,
                visible: false,
            },
        })
    }

    saveFormRef = (formRef) => {
        this.formRef = formRef
    }

    onTreeDropdownClick = (item, action, e) => {
        e.domEvent.stopPropagation()

        item.select = !item.select
        let modalFormProp = {
            visible: true,
            label: '部门名称',
            placeholder: '请输入部门名称',
            validateRe: {
                pattern: /^.{1,256}$/,
                message: '限256个字',
            },
        }
        if(action === 'add') {
            modalFormProp.title = '添加子部门'
            modalFormProp.data = {
                actionName: 'create',
                parent_id: item.id,
            }
        }else if(action === 'changeName') {
            modalFormProp.title = '修改名称'
            modalFormProp.data = {
                actionName: 'update',
                id: item.id,
            }
            modalFormProp.initialValue = item.name
        }else if(action === 'remove') {
            confirm({
                icon: 'info-circle',
                title: '提示',
                content: '是否要删除该部门？',
                okText: '删除',
                cancelText: '取消',
                onOk: () => {
                    return new Promise((resolve, reject) => {
                        this.props.dispatch({
                            type: 'setting_teamManagement/remove',
                            payload: {
                                id: item.id,
                            },
                            callback: () => {
                                this.loadTree()
                            },
                        })
                        resolve()
                    }).catch((err) => console.log(err))
                },
                onCancel() {

                },
            })
            modalFormProp = {}
        }

        // this.props.dispatch({
        //     type: 'setting_teamManagement/updateTree',
        //     payload: {},
        // })

        this.setState({
            modalFormProp,
        })
    }

    renderTreeDropdown = (item, nodeClick) => {
        const menu = (
            <Menu>
                <Menu.Item onClick={this.onTreeDropdownClick.bind(null, item, 'add')}>
                    添加子部门
                </Menu.Item>
                <Menu.Item onClick={this.onTreeDropdownClick.bind(null, item, 'changeName')}>
                    修改名称
                </Menu.Item>
                {
                    item.parent_id !== 0 && (
                        <Menu.Item onClick={this.onTreeDropdownClick.bind(null, item, 'remove')}>
                            删除部门
                        </Menu.Item>
                    )
                }
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
        const content = document.getElementById('content')
        if(content) {
            container = content
        }
        return container
    }

    handleOutside = (item) => {
        item.select = false

        this.props.dispatch({
            type: 'setting_teamManagement/updateTree',
            payload: {},
        })
    }

    renderTreeTitle = (item) => {
        let nodeClick = (
            <div className={styles.treeNodeClick}>
                <Icon
                    className={styles.treeNodeDot}
                    type="ellipsis"
                    onClick={this.onTreeClick.bind(null, item)}
                />
            </div>
        )

        return (
            <div className={styles.treeNode}>
                <div className={styles.treeNodeTitle} title={item.name}>{item.name}</div>
                {
                    item.select ? this.renderTreeDropdown(item, nodeClick) : nodeClick
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
                    dataRef={item}
                />
            )
        })
    }

    addEdit = () => {
        this.addShow()
    }

    checkName = (rule, value, callback) => {
        const reg = /\s+/
        if(reg.test(value)) {
            callback('不允许输入空格')
            return
        }else if(value && value.length > 32) {
            callback('姓名长度限制32字')
            return
        }
        callback()
    }

    addCompanyName = () => {
        const {initData} = this.props.base
        const {company = {}} = initData
        let modalFormProp = {
            visible: true,
            label: '公司名称',
            title: '公司名称',
            placeholder: '完善公司名称',
            validateRe: {
                validator: this.checkName,
            },
            data: {
                actionName: 'updateCompanyName',
                id: company.id,
            },
        }
        this.setState({modalFormProp})
    }

    addClick = () => {
        if(_.get(this.props.base, 'initData.company.name')) {
            this.addDepartments()
        }else {
            this.addCompanyName()
        }
    }

    addDepartments = () => {
        let modalFormProp = {
            title: '添加子部门',
            visible: true,
            label: '部门名称',
            placeholder: '请输入部门名称',
            validateRe: {
                pattern: rules.CEN_1256Re,
                message: '中文、英文、数字、下划线, 限256个字',
            },
            data: {
                actionName: 'create',
                parent_id: 0,
            },
        }
        this.setState({modalFormProp})
    }

    onCheck = (checkedKeys, e) => {
        const {node, selected} = e
        if(!selected) {
            const {dataRef, isLeaf, expanded} = node.props
            if(isLeaf) {
                return
            }
            let {expandedKeys} = this.props.setting_teamManagement
            let newExpandedKeys = expandedKeys.slice()

            const id = String(dataRef.id)
            const index = newExpandedKeys.indexOf(id)

            if(expanded && index >= 0) {
                newExpandedKeys.splice(index, 1)
            }else if(!expanded && index === -1) {
                newExpandedKeys.push(id)
            }

            this.props.dispatch({
                type: 'setting_teamManagement/setProperty',
                payload: {expandedKeys: newExpandedKeys},
            })

        }else {
            this.props.dispatch({
                type: 'setting_teamManagement/setActiveDepartment',
                payload: node.props.dataRef,
            })
            this.props.dispatch({
                type: 'setting_teamManagement/resetParams',
            })
            this.goPage(1)
        }
    }

    onExpand = (expandedKeys) => {
        this.props.dispatch({
            type: 'setting_teamManagement/setProperty',
            payload: {expandedKeys},
        })
    }

    handleChange = (key, e) => {
        let val = ''
        if(key === 'query') {
            val = e.target.value
        }else if(key === 'enabled' || key === 'role') {
            val = e
        }else if(key === 'affiliated') {
            val = e.target.checked ? '1' : ''
        }

        this.props.dispatch({
            type: 'setting_teamManagement/setParams',
            payload: {
                [key]: val,
            },
        })
        if(key === 'affiliated') {
            this.goPage(1)
        }
    }

    search = () => {
        this.goPage(1)
    }

    operatorEnabled = (item) => {
        this.props.dispatch({
            type: 'setting_teamManagement/enabled',
            payload: {
                enabled: !item.enabled,
                id: item.id,
            },
            callback: () => {
                this.goPage()
            },
        })
    }

    operatorRemove = (item) => {
        confirm({
            icon: 'info-circle',
            title: '提示',
            content: '删除账号，该账号的数据将全部被清除',
            okText: '删除',
            cancelText: '取消',
            onOk: () => {
                return new Promise((resolve, reject) => {
                    this.props.dispatch({
                        type: 'setting_teamManagement/removeUser',
                        payload: {
                            id: item.id,
                        },
                        callback: () => {
                            this.goPage()
                        },
                    })
                    resolve()
                }).catch((err) => console.log(err))
            },
            onCancel() {

            },
        })
    }

    operatorEdit = (item) => {
        this.props.dispatch({
            type: 'setting_teamManagement/detailUser',
            payload: {
                id: item.id,
            },
        })
        this.props.dispatch({
            type: 'setting_teamManagement/roles',
            payload: {},
        })
        this.setState({
            editProp: {
                visible: true,
                title: '编辑账号',
            },
        })
    }

    addShow = () => {
        this.setState({
            addVisible: true,
        })
    }

    addHide = () => {
        this.setState({
            addVisible: false,
        })
    }

    companyClick = () => {
        this.props.dispatch({
            type: 'setting_teamManagement/setActiveDepartment',
            payload: null,
        })
        this.goPage()
    }

    isMy = (id) => {
        const {initData} = this.props.base
        return Number(_.get(initData, 'user.id')) === Number(id)
    }

    handleChangeSize = (current, size) => {
        let params = {...this.props.setting_teamManagement.params}
        params.limit = size
        this.props.dispatch({
            type: 'setting_teamManagement/setProperty',
            payload: {params: params},
        })
        this.goPage(1)
    }

    renderDepartments = (departments) => {
        if(departments.length) {
            const last = departments.length - 1
            return departments.map((item, i) => {
                return (
                    <span
                        key={`${item.id}`}
                        style={{marginRight: '6px'}}
                    >
                        {item.name}{item.in_charge && `(负责人)`}
                        {last !== i && ','}
                    </span>
                )
            })
        }else {
            return _.get(this, 'props.base.initData.company.name', '')
        }
    }

    onDragEnter = ({expandedKeys}) => {
        this.props.dispatch({
            type: 'setting_teamManagement/setProperty',
            payload: {expandedKeys},
        })
    }

    onDrop = ({node, dragNode, dropPosition}) => {
        const dropPos = node.props.pos.split('-')
        const realDropPosition = dropPosition - Number(dropPos[dropPos.length - 1])
        let parent_id
        let next_id
        let id = _.get(dragNode, 'props.dataRef.id', '')

        if(realDropPosition === 0) {
            parent_id = _.get(node, 'props.dataRef.id', '')
        }else {
            const nodeData = node.props.dataRef
            const parent = nodeData.parent
            if(parent) {
                parent_id = parent.id
                if(realDropPosition === -1) {
                    next_id = nodeData.id
                }else if(realDropPosition === 1) {
                    const brothers = parent.children
                    const index = brothers.findIndex(item => item.id === nodeData.id)
                    if(brothers[index + 1]) {
                        next_id = brothers[index + 1].id
                    }
                }
            }else {
                return
            }
        }

        this.props.dispatch({
            type: 'setting_teamManagement/move',
            payload: {
                parent_id,
                next_id,
                id,
            },
        })
    }

    onDragStart = ({event, node}) => {

    }

    render() {
        const {
            params,
            total,
            current,
            users,
            tree,
            activeDepartment,
            invitationInit,
            roles,
            expandedKeys,
            treeLoading,
        } = this.props.setting_teamManagement
        const {initData, accessToken} = this.props.base
        const {company = {}} = initData
        const selectedKeys = _.get(activeDepartment, 'id', '')

        const columns = [
            {
                title: '登录账号',
                dataIndex: 'username',
                width: 150,
            },
            {
                title: '姓名',
                dataIndex: 'nickname',
                className: styles.tableNickname,
            },
            {
                title: '岗位',
                dataIndex: 'role',
                className: styles.tableRole,
                render: (text, record, index) => {
                    return text.name || ''
                },
            },
            {
                title: '账号类型',
                dataIndex: 'type',
                width: 100,
                render: (text, record, index) => {
                    if(record.is_creator) {
                        return '创建者'
                    }
                    return typeMap[text] || ''
                },
            },
            {
                title: '部门',
                width: 400,
                dataIndex: 'departments',
                render: (text, record, index) => {
                    return this.renderDepartments(text)
                },
            },
            {
                title: '状态',
                dataIndex: 'enabled',
                className: styles.tableEnabled,
                render: (text, record, index) => {
                    if(Number(text) === 1) {
                        return <span className={styles.pointGreen}>启用</span>
                    }else {
                        return <span className={styles.pointForbid}>禁用</span>
                    }
                },
            },
            {
                title: '操作',
                key: 'operator',
                className: styles.tableOperator,
                render: (text, record, index) => {
                    const {initData} = this.props.base
                    const is_creator = _.get(initData, 'user.is_creator')
                    const isMy = this.isMy(record.id)
                    const type = Number(record.type)
                    const isAdmin = _.get(initData, 'user.type') === 1

                    if(is_creator) {
                        if(isMy) {
                            return (
                                <div>
                                    <span
                                        className={styles.operatorBtn}
                                        onClick={this.operatorEdit.bind(null, text)}
                                    >
                                        编辑
                                    </span>
                                </div>
                            )
                        }else {
                            return (
                                <div>
                                    <span
                                        className={styles.operatorBtn}
                                        onClick={this.operatorEdit.bind(null, text)}
                                    >
                                        编辑
                                    </span>
                                    <Divider type="vertical"/>
                                    <span
                                        className={styles.operatorBtn}
                                        onClick={this.operatorEnabled.bind(null, text)}
                                    >
                                        {
                                            Number(record.enabled) === 1 ? '禁用' : '启用'
                                        }
                                    </span>
                                    <Divider type="vertical"/>
                                    <span
                                        className={styles.operatorBtn}
                                        onClick={this.operatorRemove.bind(null, text)}
                                    >
                                        删除
                                    </span>
                                </div>
                            )
                        }
                    }else if(isAdmin) {
                        if(isMy) {
                            return (
                                <div>
                                    <span
                                        className={styles.operatorBtn}
                                        onClick={this.operatorEdit.bind(null, text)}
                                    >
                                        编辑
                                    </span>
                                </div>
                            )
                        }else if(type === 0) {
                            return (
                                <div>
                                    <span
                                        className={styles.operatorBtn}
                                        onClick={this.operatorEdit.bind(null, text)}
                                    >
                                        编辑
                                    </span>
                                    <Divider type="vertical"/>
                                    <span
                                        className={styles.operatorBtn}
                                        onClick={this.operatorEnabled.bind(null, text)}
                                    >
                                        {
                                            Number(record.enabled) === 1 ? '禁用' : '启用'
                                        }
                                    </span>
                                    <Divider type="vertical"/>
                                    <span
                                        className={styles.operatorBtn}
                                        onClick={this.operatorRemove.bind(null, text)}
                                    >
                                        删除
                                    </span>
                                </div>
                            )
                        }
                    }

                    return null
                },
            },
        ]

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
                <div className={styles.content} id={'content'}>
                    <Row>
                        <Col span={6} className={styles.left}>
                            <div className={treeLoading ? styles.loadingWarp : styles.loadingWarpHide}>
                                <Spin className={styles.loading}/>
                            </div>
                            {/*<Row className={styles.treeTitle}>*/}
                            {/*<Col span={16}>*/}
                            {/*<span*/}
                            {/*onClick={this.companyClick}*/}
                            {/*className={!activeDepartment ? `${styles.activeCompany} ${styles.companyName}` : styles.companyName}*/}
                            {/*>*/}
                            {/*{company.name}*/}
                            {/*</span>*/}
                            {/*</Col>*/}
                            {/*<Col span={8}>*/}
                            {/*<Button*/}
                            {/*className={styles.titleAdd}*/}
                            {/*onClick={this.addClick}*/}
                            {/*>*/}
                            {/*添加子部门*/}
                            {/*</Button>*/}
                            {/*</Col>*/}
                            {/*</Row>*/}
                            <Tree
                                draggable
                                onDragEnter={this.onDragEnter}
                                onExpand={this.onExpand}
                                expandedKeys={expandedKeys}
                                autoExpandParent={false}
                                className={treeLoading ? `${styles.tree} ant-spin-blur` : styles.tree}
                                onSelect={this.onCheck}
                                onDrop={this.onDrop}
                                onDragStart={this.onDragStart}
                                selectedKeys={[String(selectedKeys)]}
                            >
                                {this.renderTreeNodes(tree)}
                            </Tree>
                        </Col>
                        {/*<Divider className={styles.divider} type="vertical"/>*/}
                        <Col span={18}>
                            <div>
                                <span className={styles.rightTitle}>
                                    {`${_.get(activeDepartment, 'name', _.get(company, 'name', ''))} (${total})`}
                                </span>
                                <Checkbox
                                    onChange={this.handleChange.bind(this, 'affiliated')}
                                    checked={Number(params.affiliated) === 1}
                                >
                                    直属成员
                                </Checkbox>
                                {
                                    _.get(initData, 'company.id') === 16 && (
                                        <a
                                            className={styles.export}
                                            href={`${departmentsApi.export.url}?access_token=${accessToken}`}
                                            target={'_blank'}
                                        >
                                            导出数据
                                        </a>
                                    )
                                }
                                <Badge count={invitationInit.invitation_num || 0} className={styles.audit}>
                                    <Link to="/setting/team_management/audit_account">待审核</Link>
                                </Badge>
                            </div>
                            <div className={styles.tableSearch}>
                                {
                                    _.get(company, 'product_version.id') !== freeVersionId && (
                                        <Button type={'primary'} onClick={this.addEdit}>邀请加入</Button>
                                    )
                                }
                                <div className={styles.right}>
                                    <Select
                                        value={params.role}
                                        placeholder={'岗位'}
                                        className={styles.select}
                                        onChange={this.handleChange.bind(this, 'role')}
                                    >
                                        <Option value="">全部岗位</Option>
                                        {roles.map(item => {
                                            return (
                                                <Option value={item.id} key={item.id}>
                                                    {item.name}
                                                </Option>
                                            )
                                        })}
                                    </Select>
                                    <Select
                                        value={params.enabled}
                                        className={styles.select}
                                        onChange={this.handleChange.bind(this, 'enabled')}
                                    >
                                        <Option value="">全部状态</Option>
                                        <Option value="1">启用</Option>
                                        <Option value="0">禁用</Option>
                                    </Select>
                                    <Input
                                        placeholder={'搜索账号/姓名'}
                                        className={styles.input}
                                        value={params.query}
                                        onChange={this.handleChange.bind(this, 'query')}
                                    />
                                    <Button
                                        type="primary"
                                        onClick={this.search}
                                    >
                                        搜索
                                    </Button>
                                </div>
                            </div>
                            <div className={styles.table}>
                                <Table
                                    columns={columns}
                                    dataSource={users}
                                    rowKey={record => record.id}
                                    pagination={false}
                                    loading={this.props.tableLoading}
                                />
                                {users.length ? (
                                    <Pagination
                                        className="ant-table-pagination"
                                        total={total}
                                        current={current}
                                        showQuickJumper={true}
                                        showTotal={total => `共 ${total} 条`}
                                        pageSize={params.limit}
                                        showSizeChanger={true}
                                        onShowSizeChange={this.handleChangeSize}
                                        onChange={this.goPage}
                                        pageSizeOptions={['10', '20', '50', '100']}
                                    />
                                ) : (
                                    ''
                                )}
                            </div>
                        </Col>
                    </Row>
                </div>
                <ModalForm
                    wrappedComponentRef={this.saveFormRef}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    {...this.state.modalFormProp}
                />
                <Edit
                    goPage={this.goPage}
                    onCancel={this.editCancel}
                    typeMap={typeMap}
                    {...this.state.editProp}
                    {...this.props}
                />
                <Modal
                    title={'邀请加入'}
                    visible={this.state.addVisible}
                    onCancel={this.addHide}
                    footer={null}
                    width={300}
                >
                    <div>
                        {/*<div>*/}
                        {/*邀请链接：*/}
                        {/*</div>*/}
                        {/*<div className={styles.shareLink}>*/}
                        {/*<Input*/}
                        {/*defaultValue={invitationInit.url}*/}
                        {/*readOnly*/}
                        {/*/>*/}
                        {/*<CopyToClipboard*/}
                        {/*text={invitationInit.url}*/}
                        {/*onCopy={() => {*/}
                        {/*message.success('复制成功')*/}
                        {/*}}*/}
                        {/*>*/}
                        {/*<Button>复制链接</Button>*/}
                        {/*</CopyToClipboard>*/}
                        {/*</div>*/}
                        <div className={styles.qrCodeTitle}>
                            分享二维码邀请员工加入
                        </div>
                        <div className={styles.qrCompanyName}>
                            {_.get(initData, 'company.name', '')}
                        </div>
                        <div className={styles.qrCode}>
                            <img alt={'qrCode'} src={invitationInit.qrcode_url}/>
                            {/*<QRCode value={invitationInit.qrcode_url}/>*/}
                        </div>
                        <div className={styles.qrCodeBottm}>
                            关注公众号，申请加入企业
                        </div>
                    </div>
                </Modal>
            </Page>
        )
    }
}
