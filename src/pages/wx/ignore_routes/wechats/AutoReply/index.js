/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/10/15
 */

import React, {PureComponent} from 'react'
import {
    Checkbox,
    Table,
} from 'antd'
import {connect} from "dva/index"
import Toggle from 'components/Toggle'
import modalWarp from 'hoc/modalWarp'
import MatchContents from './components/MatchContents'
import {MsgContentModal} from 'business/FullTypeMessage'
import styles from './index.less'
import {hot} from "react-hot-loader"

@hot(module)
@connect(({wx_weChatsAutoReply, loading}) => ({
    wx_weChatsAutoReply,
    autoReplyLoading: loading.effects['wx_weChatsAutoReply/autoReply'],
}))
@modalWarp()
export default class Index extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            replyContents: [],
        }
        props.setModalOkFn(this.handleOk)
    }

    componentDidMount() {
        this.goPage(1)
    }

    handleOk = () => {
        this.props.dispatch({
            type: 'wx_weChatsAutoReply/autoReplyOneUpdate',
            payload: this.getUin(),
            callback: () => {
                this.props.refresh()
                this.props.onModalCancel()
            },
        })
    }

    getUin = () => {
        return this.props.record.uin
    }

    changeStatus = (e) => {
        this.props.dispatch({
            type: 'wx_weChatsAutoReply/setStateByPath',
            payload: {
                path: 'status',
                value: e.target.checked,
            },
        })
    }

    handleChangeSize = (current, size) => {
        this.props.dispatch({
            type: 'wx_weChatsAutoReply/autoReply',
            payload: {
                page: 1,
                limit: size,
            },
        })
    }

    goPage = page => {
        if(typeof page === 'undefined') {
            page = this.props.wx_weChatsAutoReply.current
        }
        this.props.dispatch({
            type: 'wx_weChatsAutoReply/autoReply',
            payload: {page: page},
        })
    }

    render() {
        const {
            autoReplyLoading,
            wx_weChatsAutoReply,
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
        } = wx_weChatsAutoReply

        const columns = [
            {
                title: '问题描述',
                dataIndex: 'des',
                width: 400,
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
                                    <MatchContents
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
                                                type: 'wx_weChatsAutoReply/category',
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
                                        {record.reply_content_count || 0}条消息
                                    </span>
                                )
                            }}
                        />
                    )
                },
            },
        ]

        return (
            <div className={styles.newFriends}>
                <div>
                    <Checkbox
                        checked={status}
                        onChange={this.changeStatus}
                    >
                        开启此功能
                    </Checkbox>
                    <span className={styles.mark}>
                        开启后，好友发送关键内容，将自动回复对应消息
                    </span>
                </div>
                <div className={styles.content}>
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
