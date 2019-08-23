/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/10/15
 */

import React, {PureComponent} from 'react'
import {
    Button,
    Checkbox,
    message,
    Table,
    Modal,
    Divider,
} from 'antd'
import {connect} from "dva/index"
import Toggle from 'components/Toggle'
import styles from './index.less'
import {hot} from "react-hot-loader"
import router from "umi/router"
import MatchContentsModal from "../MatchContentsModal"
import {MsgContentModal} from 'business/FullTypeMessage'

@hot(module)
@connect(({wx_autoReply, loading}) => ({
    wx_autoReply,
    autoReplyLoading: loading.effects['wx_autoReply/autoReply'],
    autoReplyUpdateLoading: loading.effects['wx_autoReply/autoReplyUpdate'],
    categoryDeleteLoading: loading.effects['wx_autoReply/categoryDelete'],
}))
export default class Index extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            replyContents: [],
        }
    }

    componentDidMount() {
        this.goPage(1)
    }

    changeStatus = (e) => {
        const {reply_categories} = this.props.wx_autoReply
        const checked = e.target.checked
        if(!reply_categories.length && checked) {
            message.warning('请添加回复问题')
            return
        }

        this.props.dispatch({
            type: 'wx_autoReply/autoReplyUpdate',
            payload: checked,
            callback: () => {
                if(checked) {
                    message.success('启用成功')
                }else {
                    message.warning('禁用成功')
                }
            },
        })
    }

    handleChangeSize = (current, size) => {
        this.props.dispatch({
            type: 'wx_autoReply/autoReply',
            payload: {
                page: 1,
                limit: size,
            },
        })
    }

    goPage = page => {
        if(typeof page === 'undefined') {
            page = this.props.wx_autoReply.current
        }
        this.props.dispatch({
            type: 'wx_autoReply/autoReply',
            payload: {page: page},
        })
    }

    handleRemove = (record) => {
        Modal.confirm({
            title: '确定删除该内容？',
            okText: '删除',
            okType: 'danger',
            cancelText: '取消',
            onOk: () => {
                return new Promise((resolve) => {
                    this.props.dispatch({
                        type: 'wx_autoReply/categoryDelete',
                        payload: {category_id: record.id},
                        confirmLoading: this.props.categoryDeleteLoading,
                        callback: () => {
                            this.goPage(1)
                            message.success('删除成功')
                            resolve()
                        },
                    })
                })
            },
            onCancel() {
            },
        })
    }

    goNewPage = () => {
        router.push('/wx/auto_reply/new_rules')
    }

    goto = (record) => {
        router.push(`/wx/auto_reply/rules/${record.id}`)
    }

    render() {
        const {
            autoReplyLoading,
            wx_autoReply,
            autoReplyUpdateLoading,
            dispatch,
        } = this.props
        const {
            reply_categories,
            status,
            current,
            params: {
                limit,
            },
            total,
        } = wx_autoReply

        const columns = [
            {
                title: '问题描述',
                dataIndex: 'des',
                width: 300,
            },
            {
                title: '关键内容',
                dataIndex: 'match_content_count',
                render: (text, record, index) => {
                    return (
                        <Toggle>
                            {(
                                {
                                    setTrue,
                                    status,
                                    setFalse,
                                },
                            ) => (
                                <>
                                    <span
                                        className={styles.operatorBtn}
                                        onClick={setTrue}
                                    >
                                        {`${text}条关键内容`}
                                    </span>
                                    <MatchContentsModal
                                        dispatch={dispatch}
                                        record={record}
                                        modalOption={{
                                            footer: null,
                                            visible: status,
                                            onCancel: setFalse,
                                            width: '50%',
                                            destroyOnClose: true,
                                            title: '关键内容',
                                        }}
                                    />
                                </>
                            )}
                        </Toggle>
                    )
                },
            },
            {
                title: '回复内容',
                dataIndex: 'content1',
                render: (text, record, index) => {
                    return (
                        <MsgContentModal
                            contents={this.state.replyContents}
                            renderBtn={(setTrue) => {
                                return (
                                    <span
                                        className={styles.operatorBtn}
                                        onClick={() => {
                                            this.props.dispatch({
                                                type: 'wx_autoReply/category',
                                                payload: record.id,
                                                callback: (data) => {
                                                    this.setState({
                                                        replyContents: data.auto_reply_reply_contents,
                                                    })
                                                },
                                            })
                                            setTrue()
                                        }}
                                    >
                                        {/*{`${record.reply_content_text_count + record.reply_content_img_count + record.reply_content_video_count}条消息（${record.reply_content_text_count}条文本，${record.reply_content_img_count}条图片，${record.reply_content_video_count}条视频）`}*/}
                                        {/*{`${record.reply_content_text_count + record.reply_content_img_count}条消息（${record.reply_content_text_count}条文本，${record.reply_content_img_count}条图片）`}*/}
                                        {record.reply_content_count || 0}条消息
                                    </span>
                                )
                            }}
                        />
                    )
                },
            },
            {
                title: '操作',
                key: 'operator',
                width: 180,
                render: (text, record, index) => {
                    return (
                        <div className={styles.operator}>
                            <span
                                className={styles.operatorBtn}
                                onClick={() => {
                                    this.goto(record)
                                }}
                            >
                                编辑
                            </span>
                            <Divider type="vertical"/>
                            <span
                                className={styles.operatorBtn}
                                onClick={() => {
                                    this.handleRemove(record)
                                }}
                            >
                                删除
                            </span>
                        </div>
                    )
                },
            },
        ]

        return (
            <div className={styles.newFriends}>
                <div>
                    <Checkbox
                        disabled={autoReplyLoading || autoReplyUpdateLoading}
                        checked={status}
                        onChange={this.changeStatus}
                    >
                        开启此功能
                    </Checkbox>
                    <span className={styles.mark}>
                        默认的功能开关，若在【<span className={styles.point}>微信号管理-智能管理</span>】中配置了，则不受此处的开关限制
                    </span>
                </div>
                <div className={styles.content}>
                    <div className={styles.option}>
                        <Button
                            type="primary"
                            onClick={this.goNewPage}
                            icon="plus"
                        >
                            添加回复问题
                        </Button>
                    </div>
                    <div className={styles.table}>
                        <Table
                            columns={columns}
                            dataSource={reply_categories}
                            rowKey={record => record.id}
                            pagination={reply_categories.length ? {
                                total,
                                current,
                                showQuickJumper: true,
                                showTotal: total => `共 ${total} 条`,
                                pageSize: limit,
                                showSizeChanger: true,
                                onChange: this.goPage,
                                onShowSizeChange: this.handleChangeSize,
                                pageSizeOptions: ['10', '20', '50', '100'],
                            } : false}
                            loading={autoReplyLoading}
                        />
                    </div>
                </div>
            </div>
        )
    }
}
