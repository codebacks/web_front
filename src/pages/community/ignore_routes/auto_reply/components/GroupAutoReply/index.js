/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/10/15
 */

import React, {PureComponent} from 'react'
import {
    Button,
    message,
    Table,
    Modal,
    Divider,
} from 'antd'
import {connect} from "dva/index"
import documentTitleDecorator from 'hoc/documentTitle'
import Toggle from 'components/Toggle'
import styles from './index.less'
import {hot} from "react-hot-loader"
import router from "umi/router"
import GroupMatchContentsModal from "../GroupMatchContentsModal"
import {MsgContentModal} from 'business/FullTypeMessage'

@hot(module)
@connect(({community_groupCompanyAutoReply, loading}) => ({
    community_groupCompanyAutoReply,
    autoReplyLoading: loading.effects['community_groupCompanyAutoReply/autoReply'],
    categoryDeleteLoading: loading.effects['community_groupCompanyAutoReply/categoryDelete'],
}))
@documentTitleDecorator({
    overrideTitle: '自动回复',
})
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

    handleChangeSize = (current, size) => {
        this.props.dispatch({
            type: 'community_groupCompanyAutoReply/autoReply',
            payload: {
                page: 1,
                limit: size,
            },
        })
    }

    goPage = page => {
        if(typeof page === 'undefined') {
            page = this.props.community_groupCompanyAutoReply.current
        }
        this.props.dispatch({
            type: 'community_groupCompanyAutoReply/autoReply',
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
                        type: 'community_groupCompanyAutoReply/categoryDelete',
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
        router.push('/community/auto_reply/new_group_rules')
    }

    goto = (record) => {
        router.push(`/community/auto_reply/group_rules/${record.id}`)
    }

    render() {
        const {
            autoReplyLoading,
            community_groupCompanyAutoReply,
            dispatch,
        } = this.props
        const {
            reply_categories,
            current,
            params: {
                limit,
            },
            total,
        } = community_groupCompanyAutoReply

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
                                    <GroupMatchContentsModal
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
                                                type: 'community_groupCompanyAutoReply/category',
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
            <div className={styles.groupAutoReply}>
                <div className={styles.content}>
                    <div className={styles.option}>
                        <Button
                            type="primary"
                            onClick={this.goNewPage}
                            icon="plus"
                        >
                            添加回复问题
                        </Button>
                        <span className={styles.mark}>
                            该功能仅支持单群各自开启配置，可在【<span className={styles.point}>群管理-操作-群设置</span>】中进行开启和关闭，开启后，所有群的群成员咨询关键内容系统将自动回复对应内容。
                        </span>
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
