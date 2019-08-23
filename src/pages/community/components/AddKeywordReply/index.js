/**
 * @Description
 * @author XuMengPeng
 * @date 2019/3/29
*/

import React, {Component} from 'react'
import {connect} from 'dva'
import {
    Row, Col, Tree, Button, Icon, Menu, Input, Table, Pagination, Spin, Checkbox, Form, message,
} from 'antd'
import router from "umi/router"
import PropTypes from "prop-types"
import {hot} from 'react-hot-loader'
import toggleModalWarp from 'hoc/toggleModalWarp'
import {MsgContentModal} from 'business/FullTypeMessage/index'
import EllipsisPopover from 'components/EllipsisPopover/index'
import _ from 'lodash'
import config from 'wx/common/config'
import styles from './index.less'

const FormItem = Form.Item
const TreeNode = Tree.TreeNode
const { pageSizeOptions } = config

@hot(module)
@toggleModalWarp({
    title: '选择回复内容',
    width: 1000,
    destroyOnClose: true,
    maskClosable: false,
})
@connect(({community_addKeywordReply, loading}) => ({
    community_addKeywordReply,
    tableLoading: loading.effects['community_addKeywordReply/getQuestions'],
    getTreeLoading: loading.effects['community_addKeywordReply/getTree'],
}))
export default class Index extends Component {

    static propTypes = {
        onOk: PropTypes.func,
    }
    static defaultProps = {
        onOk: () => {},
    }

    constructor(props) {
        super(props)
        this.state = {
            replyContents: [], // 回复内容
        }
        props.setModalOkFn(this.handleOk)
    }

    componentDidMount() {
        this.loadTree(() => {
            this.goPage(1)
        })
    }

    componentWillUnmount() {
        this.props.dispatch({type: 'community_addKeywordReply/resetParams',})
    }

    handleOk = () => {
        const { onOk } = this.props
        const { selectedRows } = this.props.community_addKeywordReply
        if(!selectedRows.length) {
            message.warning('请先选择问题！')
            return
        }
        onOk && onOk(selectedRows)
        this.props.onModalCancel()
    }

    loadTree = (callback) => {
        this.props.dispatch({
            type: 'community_addKeywordReply/getTree',
            payload: {},
            callback,
        })
    }

    goPage = page => {
        const { activeSort, tree } = this.props.community_addKeywordReply
        if(typeof page === 'undefined') {
            page = this.props.community_addKeywordReply.current
        }
        if(!activeSort && !tree?.length) {
            message.warning('请先前往知识库添加内容！')
            return
        }
        this.props.dispatch({
            type: 'community_addKeywordReply/getQuestions',
            payload: {page: page || 1},
        })
    }

    onEllipsisClick = (item, e) => {
        e.stopPropagation()
        item.select = !item.select
        this.props.dispatch({
            type: 'community_addKeywordReply/updateTree',
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
            let {expandedKeys} = this.props.community_addKeywordReply
            let newExpandedKeys = expandedKeys.slice()

            const id = String(dataRef.id)
            const index = newExpandedKeys.indexOf(id)

            if(expanded && index >= 0) {
                newExpandedKeys.splice(index, 1)
            }else if(!expanded && index === -1) {
                newExpandedKeys.push(id)
            }

            this.props.dispatch({
                type: 'community_addKeywordReply/setProperty',
                payload: {expandedKeys: newExpandedKeys},
            })

        }else {
            this.props.dispatch({
                type: 'community_addKeywordReply/setActiveSort',
                payload: node.props.dataRef,
            })
            this.goPage(1)
        }
    }

    onExpand = (expandedKeys) => {
        this.props.dispatch({
            type: 'community_addKeywordReply/setProperty',
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
            type: 'community_addKeywordReply/setParams',
            payload: {
                [key]: val,
            },
        })
    }

    handleCheckboxChange = (e) => {
        let exclude_children_category = e.target.checked ? 1: 0
        this.props.dispatch({
            type: 'community_addKeywordReply/setParams',
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
        let params = {...this.props.community_addKeywordReply.params}
        params.limit = size
        this.props.dispatch({
            type: 'community_addKeywordReply/setProperty',
            payload: {params: params},
        })
        this.goPage(1)
    }

    render() {
        const {
            params, total, current, list,
            tree, activeSort, expandedKeys,
        } = this.props.community_addKeywordReply
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
                                                type: 'community_addKeywordReply/getReplyContents',
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
        ]
        const rowSelection = {
            type: 'radio',
            selectedRowKeys: this.props.community_addKeywordReply.selectedRowKeys,
            onChange: (selectedRowKeys, selectedRows) => {
                this.props.dispatch({
                    type: 'community_addKeywordReply/setProperty',
                    payload: {
                        selectedRows: selectedRows,
                        selectedRowKeys: selectedRowKeys,
                    }
                })
            },
        }

        return (
            <div className={styles.addKeywordReply}>

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
                                <Checkbox
                                    onChange={this.handleCheckboxChange}
                                    checked={params.exclude_children_category}
                                >只显示直属问题</Checkbox>
                            </div>
                            <div className={styles.table}>
                                <Table
                                    columns={columns}
                                    rowSelection={rowSelection}
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

            </div>
        )
    }
}
