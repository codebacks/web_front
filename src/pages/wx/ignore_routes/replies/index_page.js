/**
 * 文件说明: 快捷回复公共模板库
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 2018/8/23
 */

import React, {Component} from 'react'
import {connect} from 'dva'
import {
    Row,
    Col,
    Button,
    Icon,
    Menu,
    Table,
    Divider,
    Dropdown,
    Spin,
    Modal,
    message,
} from 'antd'
import documentTitleDecorator from 'hoc/documentTitle'
import moment from 'moment'
import _ from 'lodash'
import HzDropdown from '../../components/HzDropdown'
import config from '../../common/config'
import styles from './index.less'
import CategoryForm from './components/CategoryForm'
import ReplyForm from './components/ReplyForm'
import helper from '../../utils/helper'
import ContentHeader from 'business/ContentHeader'

@connect(({wx_replies, wx_replyCategories, base, loading}) => ({
    wx_replies,
    wx_replyCategories,
    base,
    replyLoading: loading.effects['wx_replies/query'],
    categoryLoading: loading.effects['wx_replyCategories/query'],
}))
@documentTitleDecorator()
export default class Index_page extends Component {
    constructor(props) {
        super(props)
        this.state = {
            offsetTop: 234,
            category: {},
            record: {},
            showCategoryForm: false,
            showReplyForm: false,
        }
    }

    componentDidMount() {
        this.loadCategory()
        this.loadReplies()
    }

    loadReplies = () => {
        this.props.dispatch({
            type: 'wx_replies/query',
            payload: {type: 1},
        })
    }

    loadCategory = () => {
        this.props.dispatch({
            type: 'wx_replyCategories/query',
            payload: {type: 1},
        })
    }

    handleCreateCategory = () => {
        this.setState({showCategoryForm: true})
    }

    handleCancelCategory = () => {
        this.setState({showCategoryForm: false, category: {}})
    }

    handleCreate = () => {
        this.setState({showReplyForm: true})
    }

    handleCancelReply = () => {
        this.setState({showReplyForm: false, record: {}})

    }

    onMenuDropdownClick = (item, option) => {
        if(option === 'changeName') {
            this.setState({category: item, showCategoryForm: true})
        }else {
            const {wx_replies: {list}, wx_replyCategories: {activeId}} = this.props
            const categoryReplies = list.filter((item) => {
                return item.category_id === +activeId
            })
            if(categoryReplies.length) {
                Modal.error({
                    title: '删除提示',
                    content: `要先删除分组下快捷回复，才能删分组...`,
                })
            }else {
                Modal.confirm({
                    title: '确认删除？',
                    content: item.name,
                    okText: '删除',
                    icon: 'info-circle',
                    onOk: () => {
                        this.props.dispatch({
                            type: 'wx_replyCategories/remove',
                            payload: {id: item.id},
                            callback: () => {
                                message.success('分组删除成功')
                            },
                        })
                    },
                    onCancel() {
                    },
                })

            }
        }
    }
    handleOutside = () => {
        this.props.dispatch({
            type: 'wx_replyCategories/setProperty',
            payload: {selectedId: ''},
        })
    }

    getContent = (record) => {
        if(record.content_type === 1) {
            try {
                let content = window.JSON.parse(record.content)
                return <img className={styles.thumb} src={helper.getThumb(content[0].url)} alt=""/>
            }catch(e) {
                console.error(e)
            }
        }else {
            return record.content
        }
    }

    renderMenuDropdown = (item, nodeClick) => {
        const menu = (
            <Menu>
                <Menu.Item
                    onClick={this.onMenuDropdownClick.bind(null, item, 'changeName')}
                >
                    修改分组
                </Menu.Item>
                <Menu.Item
                    onClick={this.onMenuDropdownClick.bind(null, item, 'remove')}
                >
                    删除分组
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
                className={styles.dropdown}
                placement="bottomRight"
            >
                {nodeClick}
            </HzDropdown>
        )
    }

    onDotClick = (item, e) => {
        this.props.dispatch({
            type: 'wx_replyCategories/setProperty',
            payload: {activeId: item.id, selectedId: item.id},
        })
    }
    menuClick = (menu) => {
        this.props.dispatch({
            type: 'wx_replyCategories/setProperty',
            payload: {activeId: menu.key},
        })
    }
    renderCategory = () => {
        const {
            list,
            selectedId,
        } = this.props.wx_replyCategories
        return list.map((item, i) => {
            const nodeClick = (
                <div className={styles.menuItemClick}>
                    <Icon
                        className={styles.menuItemDot}
                        type="ellipsis"
                        onClick={(e) => this.onDotClick(item, e, i)}
                    />
                </div>
            )
            return (
                <Menu.Item key={item.id}>
                    <div className={styles.menuItem}>
                        <div className={styles.name}>{item.name}</div>
                        {
                            selectedId === item.id ? this.renderMenuDropdown(item, nodeClick, i) : nodeClick
                        }
                    </div>
                </Menu.Item>
            )
        })
    }
    handleMoveUp = (idx) => {
        const {wx_replies: {list}, wx_replyCategories: {activeId}} = this.props
        const categoryReplies = list.filter((item) => {
            return item.category_id === +activeId
        })
        const newList = _.cloneDeep(categoryReplies)
        newList[idx] = categoryReplies[idx - 1]
        newList[idx - 1] = categoryReplies[idx]
        let ids = [categoryReplies[idx].id, categoryReplies[idx - 1].id]
        this.props.dispatch({
            type: 'wx_replies/swap',
            payload: {ids, newList},
            callback: () => {
                message.success('排序成功')
            },
        })
    }

    handleMoveDown = (idx) => {
        const {wx_replies: {list}, wx_replyCategories: {activeId}} = this.props
        const categoryReplies = list.filter((item) => {
            return item.category_id === +activeId
        })
        const newList = _.cloneDeep(categoryReplies)
        newList[idx] = categoryReplies[idx + 1]
        newList[idx + 1] = categoryReplies[idx]
        let ids = [categoryReplies[idx].id, categoryReplies[idx + 1].id]
        this.props.dispatch({
            type: 'wx_replies/swap',
            payload: {ids, newList},
            callback: () => {
                message.success('排序成功')
            },
        })
    }

    handleSetTop = (idx) => {
        const {wx_replies: {list}, wx_replyCategories: {activeId}} = this.props
        const categoryReplies = list.filter((item) => {
            return item.category_id === +activeId
        })
        const newList = _.cloneDeep(categoryReplies)
        newList.splice(idx, 1)
        newList.unshift(categoryReplies[idx])
        this.props.dispatch({
            type: 'wx_replies/setTop',
            payload: {ids: [categoryReplies[idx].id], newList},
            callback: () => {
                message.success('置顶成功')
            },
        })

    }

    handleEditReply = (record) => {
        this.setState({record, showReplyForm: true})
    }

    handleRemove = (record, idx) => {
        const content = this.getContent(record)
        Modal.confirm({
            title: '确认删除？',
            content: content,
            okText: '删除',
            okType: 'danger',
            cancelText: '取消',
            onOk: () => {
                this.props.dispatch({
                    type: 'wx_replies/remove',
                    payload: {id: record.id, idx},
                    callback: () => {
                        message.success('删除成功')
                    },
                })
            },
            onCancel() {
            },
        })

    }

    render() {
        const {wx_replies, wx_replyCategories, categoryLoading, replyLoading, base} = this.props
        const {showCategoryForm, showReplyForm, offsetTop} = this.state
        const menuMinHeight = base.winHeight - offsetTop

        const replies = wx_replies.list.filter((item) => {
            return item.category_id === +wx_replyCategories.activeId
        })

        const columns = [
            {
                title: '内容',
                dataIndex: 'content',
                render: (text, record, index) => {
                    return this.getContent(record)
                },
            },
            {
                title: '创建人',
                dataIndex: 'user.nickname',
                width: 150,
            },
            {
                title: '创建时间',
                dataIndex: 'create_time',
                width: 180,
                render: (text, record, index) => {
                    return moment(+text * 1000).format(config.DateFormat)
                },
            },
            {
                title: '操作',
                key: 'operator',
                width: 180,
                render: (text, record, index) => {
                    const menu = (
                        <Menu className={styles.menu}>
                            <Menu.Item onClick={() => this.handleMoveUp(index)}
                                       disabled={index === 0 || wx_replies.list.length === 1}>
                                <div className={styles.menuItem}>上移</div>
                            </Menu.Item>
                            <Menu.Item onClick={() => this.handleMoveDown(index)}
                                       disabled={index === wx_replies.list.length - 1 || replies.length === 1}>
                                <div className={styles.menuItem}>下移</div>
                            </Menu.Item>
                            <Menu.Item onClick={() => this.handleRemove(record, index)}>
                                <div className={styles.menuItem}>删除</div>
                            </Menu.Item>
                        </Menu>
                    )
                    return (
                        <div>
                            <span
                                className={styles.operatorBtn}
                                onClick={() => this.handleEditReply(record)}
                            >
                                编辑
                            </span>
                            <Divider type="vertical"/>
                            {index !== 0 ?
                                <span className={styles.operatorBtn} onClick={() => this.handleSetTop(index)}>置顶</span>
                                : <span className={styles.tip}>置顶</span>
                            }

                            <Divider type="vertical"/>
                            <Dropdown overlay={menu}>
							<span
                                className={styles.operatorBtn}
                            >
								更多<Icon type="down"/>
                            </span>
                            </Dropdown>
                        </div>
                    )
                },
            },
        ]

        return (
            <div>
                <ContentHeader
                    contentType={'title'}
                    content={{
                        title: this.props.documentTitle,
                    }}
                    help={{
                        url: 'http://newhelp.51zan.cn/manual/content/%E4%B8%AA%E4%BA%BA%E5%8F%B7/%E6%99%BA%E8%83%BD%E7%AE%A1%E7%90%86.md',
                    }}
                />
                <div className={styles.content}>
                    <Row>
                        <Col span={4}>
                            <div className={styles.btnWrap}>
                                <Button
                                    onClick={this.handleCreateCategory}
                                    className={styles.addCategory}
                                    icon="plus"
                                    type="dashed"
                                >添加分组</Button>
                            </div>
                            <Menu
                                defaultSelectedKeys={[wx_replyCategories.activeId]}
                                mode="inline"
                                onClick={this.menuClick}
                                id="menuArea"
                                style={{minHeight: menuMinHeight}}
                            >
                                {this.renderCategory()}
                            </Menu>
                            {categoryLoading && <div className={styles.loading}><Spin/></div>}
                        </Col>
                        <Col span={20} className={styles.right}>
                            <div className={styles.option}>
                                <Button type="primary" onClick={this.handleCreate} icon="plus"
                                        disabled={!wx_replyCategories.activeId}>新增快捷回复</Button>
                            </div>
                            <div className={styles.replies}>
                                <div className={styles.table}>
                                    <Table
                                        columns={columns}
                                        dataSource={replies}
                                        rowKey={record => record.id}
                                        pagination={false}
                                        loading={replyLoading}
                                    />
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>
                {showCategoryForm &&
                <CategoryForm {...this.props} visible={showCategoryForm} record={this.state.category}
                              reload={this.loadCategory}
                              onCancel={this.handleCancelCategory}/>}
                {showReplyForm &&
                <ReplyForm {...this.props} visible={showReplyForm} record={this.state.record} reload={this.loadReplies}
                           onCancel={this.handleCancelReply}/>}
            </div>
        )
    }
}
