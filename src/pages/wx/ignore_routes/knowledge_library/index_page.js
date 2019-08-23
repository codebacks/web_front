/**
 * @Description
 * @author XuMengPeng
 * @date 2019/3/14
 */

import React, {Component} from 'react'
import {connect} from 'dva'
import {
    Row, Col, Tree, Button, Icon, Menu, Modal, Input, Table, Pagination, Spin, Checkbox, Form,
    TreeSelect, message,
} from 'antd'
import router from "umi/router"
import documentTitleDecorator from 'hoc/documentTitle'
import ContentHeader from 'business/ContentHeader'
import reactHotDecorator from 'hoc/reactHot'
import {hot} from 'react-hot-loader'
import HzDropdown from 'setting/components/HzDropdown'
import ModalForm from 'setting/components/ModalForm'
import {MsgContentModal} from 'business/FullTypeMessage'
import EllipsisPopover from 'components/EllipsisPopover'
import rules from 'setting/utils/rules'
import _ from 'lodash'
import config from 'wx/common/config'
import styles from './index.less'
import MoveQuestionModal from './components/MoveQuestionModal'

const FormItem = Form.Item
const TreeNode = Tree.TreeNode
const confirm = Modal.confirm
const { pageSizeOptions } = config

@hot(module)
@reactHotDecorator()
@connect(({wx_knowledgeLibrary, loading}) => ({
    wx_knowledgeLibrary,
    tableLoading: loading.effects['wx_knowledgeLibrary/getQuestions'],
    getTreeLoading: loading.effects['wx_knowledgeLibrary/getTree'],
}))
@documentTitleDecorator()
export default class Index extends Component {
    constructor(props) {
        super(props)
        this.state = {
            modalFormProp: { // 添加分类/子分类的属性， 给ModalForm使用
                label: '',
                title: '',
                visible: false,
            },
            replyContents: [], // 回复内容
            record: null, // 当前操作的record
        }
    }

    componentDidMount() {
        this.loadTree(() => {
            this.goPage(1)
        })
    }

    loadTree = (callback) => {
        this.props.dispatch({
            type: 'wx_knowledgeLibrary/getTree',
            payload: {},
            callback,
        })
    }

    goPage = page => {
        const { activeSort, tree } = this.props.wx_knowledgeLibrary
        if(typeof page === 'undefined') {
            page = this.props.wx_knowledgeLibrary.current
        }
        if(!activeSort && !tree?.length) {
            message.warning('请添加分类！')
            return
        }
        this.props.dispatch({
            type: 'wx_knowledgeLibrary/getQuestions',
            payload: {page: page || 1},
        })
    }

    onEllipsisClick = (item, e) => {
        e.stopPropagation()
        item.select = !item.select
        this.props.dispatch({
            type: 'wx_knowledgeLibrary/updateTree',
            payload: {},
        })
    }

    handleCreate = (e) => {
        const {form, data} = this.formRef.props
        form.validateFields((err, values) => {
            if(err) {return}
            if(!values.name || !values.name.trim()) {
                message.warning('请输入分类名称！')
                return
            }else{
                values.name = values.name.trim()
                if(data.actionName === 'create') {
                    this.props.dispatch({
                        type: 'wx_knowledgeLibrary/createTree',
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
                        type: 'wx_knowledgeLibrary/editTree',
                        payload: {
                            name: values.name,
                            id: data.id,
                        },
                        callback: () => {
                            this.loadTree()
                            this.handleCancel()
                        },
                    })
                }
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

    saveFormRef = (formRef) => {
        this.formRef = formRef
    }

    onTreeDropdownClick = (item, action, e) => {
        e.domEvent.stopPropagation()
        item.select = !item.select
        let modalFormProp = {
            visible: true,
            label: '分类名称',
            placeholder: '请输入分类名称，最多20个字',
            validateRe: {
                pattern: /^.{1,20}$/,
                message: '限20个字',
            },
        }
        if(action === 'add') {
            modalFormProp.title = '添加子分类'
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
                content: '是否要删除该分类？',
                okText: '删除',
                cancelText: '取消',
                onOk: () => {
                    return new Promise((resolve, reject) => {
                        this.props.dispatch({
                            type: 'wx_knowledgeLibrary/removeTree',
                            payload: {
                                id: item.id,
                            },
                            callback: () => {
                                this.loadTree(() => {
                                    this.goPage(1)
                                })
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

        this.setState({
            modalFormProp,
        })
    }

    addSortClick = () => {
        let modalFormProp = {
            visible: true,
            label: '分类名称',
            placeholder: '请输入分类名称，最多20个字',
            validateRe: {
                pattern:  /^.{1,20}$/,
                message: '限20个字',
            },
            title: '添加分类',
            data: {
                actionName: 'create',
                parent_id: 0,
            },
        }
        this.setState({modalFormProp})
    }

    renderTreeDropdown = (item, nodeClick) => {
        const menu = (
            <Menu>
                <Menu.Item onClick={this.onTreeDropdownClick.bind(null, item, 'add')}>
                    添加子分类
                </Menu.Item>
                <Menu.Item onClick={this.onTreeDropdownClick.bind(null, item, 'changeName')}>
                    修改名称
                </Menu.Item>
                <Menu.Item onClick={this.onTreeDropdownClick.bind(null, item, 'remove')}>
                    删除分类
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
        const content = document.getElementById('content')
        if(content) {
            container = content
        }
        return container
    }

    handleOutside = (item) => {
        item.select = false

        this.props.dispatch({
            type: 'wx_knowledgeLibrary/updateTree',
            payload: {},
        })
    }

    renderTreeTitle = (item) => {
        let nodeClick = (
            <div className={styles.treeNodeClick}>
                <Icon
                    className={styles.treeNodeDot}
                    type="ellipsis"
                    onClick={this.onEllipsisClick.bind(null, item)}
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

    onSelect = (checkedKeys, e) => {
        const {node, selected} = e
        if(!selected) {
            const {dataRef, isLeaf, expanded} = node.props
            if(isLeaf) {
                return
            }
            let {expandedKeys} = this.props.wx_knowledgeLibrary
            let newExpandedKeys = expandedKeys.slice()

            const id = String(dataRef.id)
            const index = newExpandedKeys.indexOf(id)

            if(expanded && index >= 0) {
                newExpandedKeys.splice(index, 1)
            }else if(!expanded && index === -1) {
                newExpandedKeys.push(id)
            }

            this.props.dispatch({
                type: 'wx_knowledgeLibrary/setProperty',
                payload: {expandedKeys: newExpandedKeys},
            })

        }else {
            this.props.dispatch({
                type: 'wx_knowledgeLibrary/setActiveSort',
                payload: node.props.dataRef,
            })
            this.goPage(1)
        }
    }

    onExpand = (expandedKeys) => {
        this.props.dispatch({
            type: 'wx_knowledgeLibrary/setProperty',
            payload: {expandedKeys},
        })
    }

    handleChange = (key, e) => {
        let val = ''
        if(key === 'key') {
            val = e.target.value
        }else if(key === 'exclude_children_category') {
            val = e.target.checked ? 1: 0
        }
        this.props.dispatch({
            type: 'wx_knowledgeLibrary/setParams',
            payload: {
                [key]: val,
            },
        })
    }

    handleCheckboxChange = (e) => {
        let exclude_children_category = e.target.checked ? 1: 0
        this.props.dispatch({
            type: 'wx_knowledgeLibrary/setParams',
            payload: { exclude_children_category },
        })
        setTimeout(() => {
            this.goPage()
        }, 100)
    }

    search = () => {
        this.goPage(1)
    }

    handleChangeSize = (current, size) => {
        let params = {...this.props.wx_knowledgeLibrary.params}
        params.limit = size
        this.props.dispatch({
            type: 'wx_knowledgeLibrary/setProperty',
            payload: {params: params},
        })
        this.goPage(1)
    }

    addQuestion = () => {
        const { activeSort, tree } = this.props.wx_knowledgeLibrary
        if(!activeSort && !tree?.length) {
            message.warning('请添加分类！')
            return
        }
        router.push({
            pathname:'/wx/knowledge_library/new_question',
            query: {
                treeId: activeSort?.id
            }
        })
    }

    deleteQuestion = (record) => {
        confirm({
            icon: 'info-circle',
            title: '提示',
            content: '是否要删除该问题？',
            okText: '删除',
            cancelText: '取消',
            onOk: () => {
                return new Promise((resolve, reject) => {
                    this.props.dispatch({
                        type: 'wx_knowledgeLibrary/removeQuestion',
                        payload: {
                            id: record.id,
                        },
                        callback: () => {
                            this.goPage()
                        },
                    })
                    resolve()
                }).catch((err) => console.log(err))
            },
        })
    }

    handleMoveOk = (selectedValue) => {
        const { record } = this.state
        this.props.dispatch({
            type: 'wx_knowledgeLibrary/moveQuestion',
            payload: {
                id: record?.id,
                body: {
                    category_id: selectedValue
                }
            },
            callback: () => {
                this.goPage()
            },
        })
    }

    goEdit = (id) => {
        router.push(`/wx/knowledge_library/edit_question/${id}`)
    }

    render() {
        const {
            params, total, current, list,
            tree, activeSort, expandedKeys,
        } = this.props.wx_knowledgeLibrary
        const { getTreeLoading } = this.props
        const selectedKeys = _.get(activeSort, 'id', '')

        const formItemLayout = { labelCol: {span: 6}, wrapperCol: {span: 18}, }
        const columns = [
            {
                title: '问题描述',
                dataIndex: 'des',
                className: styles.columnsDes,
                render: (text, record) => {
                    return  <EllipsisPopover content={text} lines={2} ellipsisClassName={styles.ellipsisPopoverTxt}/>
                },
            },
            {
                title: '备注',
                dataIndex: 'comment',
                className: styles.columnsRemark,
                render: (text, record) => {
                    return <EllipsisPopover content={text} lines={2} ellipsisClassName={styles.ellipsisPopoverTxt}/>
                },
            },
            {
                title: '回复内容',
                dataIndex: 'reply_msg_count',
                render: (text, record) => {
                    return (
                        <MsgContentModal
                            contents={this.state.replyContents}
                            renderBtn={(setTrue) => {
                                return (
                                    <span
                                        className={styles.canEdit}
                                        onClick={() => {
                                            this.props.dispatch({
                                                type: 'wx_knowledgeLibrary/getReplyContents',
                                                payload: {id: record.id},
                                                callback: (data) => {
                                                    this.setState({
                                                        replyContents: data.reply_contents,
                                                    })
                                                },
                                            })
                                            setTrue()
                                        }}
                                    >
                                        {record.reply_msg_count || 0}条消息
                                    </span>
                                )
                            }}
                        />
                    )
                },
            },
            {
                title: '创建人',
                dataIndex: 'creator_nickname',
            },
            {
                title: '操作',
                dataIndex: 'edit',
                className: styles.columnsEdit,
                render: (text, record) => {
                    return <>
                        <span className={styles.canEdit} onClick={() => {this.goEdit(record?.id)}}>编辑</span>
                        <span className={styles.canEdit} onClick={this.deleteQuestion.bind(null, record)}>删除</span>
                        <MoveQuestionModal
                            renderBtn={(setTrue) => {
                                return <span
                                    className={styles.canEdit}
                                    onClick={
                                        () => {
                                            this.setState({record})
                                            setTrue()
                                        }
                                    }>
                                    移动分类
                                </span>
                            }}
                            treeData={tree}
                            onOk={this.handleMoveOk}
                        />
                    </>
                },
            },
        ]

        return (
            <div className={styles.knowledgeLibraryWrap}>
                <ContentHeader
                    contentType={'title'}
                    content={{title: this.props.documentTitle,}}
                    help={{url: 'https://www.kancloud.cn/newsystem51/manual/content/%E4%B8%AA%E4%BA%BA%E5%8F%B7/%E5%86%85%E5%AE%B9%E7%AE%A1%E7%90%86.md',}}
                />
                <div className={styles.content} id='content'>
                    <div className={styles.searchWrap}>
                        <Col span={10}>
                            <FormItem {...formItemLayout} label="问题描述：" colon={false} >
                                <Input placeholder="请输入问题描述/备注" value={params.key} onChange={(e) => this.handleChange('key', e)} />
                            </FormItem>
                        </Col>
                        <Button
                            style={{marginLeft: 20}}
                            type='primary'
                            prefix={<Icon type="search" className={styles.prefixIcon}/>}
                            onClick={this.search}
                        >搜索</Button>
                    </div>
                    <Row>
                        <Col span={6} className={styles.contentLeft}>
                            <div className={getTreeLoading ? styles.loadingWarp : styles.loadingWarpHide}>
                                {/*<div className={styles.loadingWarp}>*/}
                                <Spin className={styles.loading}/>
                            </div>
                            <Button
                                onClick={this.addSortClick}
                                style={{width: '96%'}}
                            ><Icon type="plus" />添加分类</Button>
                            <Tree
                                onExpand={this.onExpand}
                                expandedKeys={expandedKeys}
                                autoExpandParent={false}
                                className={getTreeLoading ? `${styles.tree} ant-spin-blur` : styles.tree}
                                onSelect={this.onSelect}
                                selectedKeys={[String(selectedKeys)]}
                            >
                                {this.renderTreeNodes(tree)}
                            </Tree>
                        </Col>
                        <Col span={18} className={styles.contentRight}>
                            <div className={styles.tableTop}>
                                <Button
                                    type='primary'
                                    style={{marginRight: 20}}
                                    onClick={this.addQuestion}
                                >添加回复问题</Button>
                                <Checkbox
                                    onChange={this.handleCheckboxChange}
                                    checked={params.exclude_children_category}
                                >只显示直属问题</Checkbox>
                            </div>
                            <div className={styles.table}>
                                <Table
                                    columns={columns}
                                    dataSource={list}
                                    rowKey={record => record.id}
                                    pagination={false}
                                    loading={this.props.tableLoading}
                                />
                                {list.length ? (
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
                                        pageSizeOptions={pageSizeOptions}
                                    />
                                ) : ('')}
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

            </div>
        )
    }
}
