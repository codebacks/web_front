/**
 * @Description
 * @author XuMengPeng
 * @date 2019/3/28
 */

import React, {PureComponent} from 'react'
import { Button, message, Table, Modal, Popconfirm, Icon, } from 'antd'
import {connect} from "dva/index"
import router from "umi/router"
import documentTitleDecorator from "hoc/documentTitle"
import config from 'community/common/config'
import ContentHeader from 'business/ContentHeader'
import {MsgContentModal} from 'business/FullTypeMessage'
import AddKeyword from './components/AddKeyword'
import styles from './index.less'

const { pageSizeOptions, } = config

@documentTitleDecorator()
@connect(({community_autoReply_templateDetail, loading}) => ({
    community_autoReply_templateDetail,
    queryLoading: loading.effects['community_autoReply_templateDetail/query'],
}))
export default class Index extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            replyContents: [], // 回复内容
        }
    }

    componentDidMount() {
        this.getData()
    }

    getData = () => {
        this.props.dispatch({
            type: 'community_autoReply_templateDetail/query',
            payload: {
                template_id: this.props.match?.params?.id
            }
        })
    }

    handleAddkeywordOk = () => {
        this.getData()
    }

    move = (record, preIndex, nextIndex) => {
        const { list } = this.props.community_autoReply_templateDetail
        let ord = 0
        if(nextIndex === 0) {
            ord = list[nextIndex].ord + 1
        }else if(preIndex === (list.length - 1)) {
            ord = list[preIndex].ord - 1
        }else {
            ord = (list[preIndex].ord + list[nextIndex].ord) / 2
        }
        console.log('ord:', ord)
        this.props.dispatch({
            type: 'community_autoReply_templateDetail/move',
            payload: {
                template_id: this.props.match?.params?.id,
                keyword_id: record.id,
                body: {ord}
            },
            callback: () => {
                message.success('移动成功!')
                this.getData()
            }
        })
    }

    removeKeyword = (record) => {
        this.props.dispatch({
            type: 'community_autoReply_templateDetail/removeKeyword',
            payload: {
                template_id: this.props.match?.params?.id,
                keyword_id: record.id,
            },
            callback: () => {
                message.success('删除成功!')
                this.getData()
            }
        })
    }

    render() {
        const { queryLoading, community_autoReply_templateDetail, } = this.props
        const { list, } = community_autoReply_templateDetail

        const columns = [
            {
                title: '关键词',
                dataIndex: 'content',
            },
            {
                title: '匹配规则',
                dataIndex: 'match_type',
                render: (text, record) => {
                    return <span>{text === 0 ? '完全匹配': '包含匹配'}</span>
                },
            },
            {
                title: '回复内容',
                dataIndex: 'knowledge_base_category_item_id',
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
                                                type: 'community_autoReply_templateDetail/getReplyContents',
                                                payload: {id: text},
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
                }
            },
            {
                title: '操作',
                key: 'operator',
                className: styles.editColumn,
                render: (text, record, index) => {
                    return <>
                        <AddKeyword
                            {...this.props}
                            renderBtn={(setTrue) => {
                                return (
                                    <span className={styles.canEdit} onClick={setTrue}>编辑</span>
                                )
                            }}
                            type={'edit'}
                            record={record}
                            onOk={this.handleAddkeywordOk}
                            modalOption={{
                                title: '修改关键词',
                            }}
                        />
                        {
                            index === 0 ? <span>上移</span>
                                : <span className={styles.canEdit} onClick={() => {
                                    this.move(record, index - 2, index - 1)
                                }}>上移</span>
                        }
                        {
                            index === list.length - 1 ? <span>下移</span>
                                : <span className={styles.canEdit} onClick={() => {
                                    this.move(record, index + 1, index + 2)
                                }}>下移</span>
                        }
                        <Popconfirm
                            placement="top"
                            title="确认删除该规则？"
                            icon={<Icon type="close-circle" style={{color: '#f00'}} />}
                            onConfirm={(e) => this.removeKeyword(record)}
                        >
                            <span className={styles.canEdit}>删除</span>
                        </Popconfirm>

                    </>
                },
            },
        ]

        return (
            <div className={styles.templateDetail}>
                <ContentHeader
                    contentType={'breadcrumb'}
                    content={
                        [
                            {
                                name: '自动回复',
                                path: '/community/auto_reply',
                            },
                            {
                                name: '详情',
                            },
                        ]
                    }
                />
                <div className={styles.tableHeader}>
                    <AddKeyword
                        {...this.props}
                        renderBtn={(setTrue) => {
                            return (
                                <Button type='primary' onClick={setTrue}>新建关键词</Button>
                            )
                        }}
                        type={'add'}
                        onOk={this.handleAddkeywordOk}
                        modalOption={{
                            title: '新建关键词',
                        }}
                    />
                </div>
                <div className={styles.table}>
                    <Table
                        columns={columns}
                        dataSource={list}
                        rowKey={(record, index) => index}
                        pagination={false}
                        loading={queryLoading}
                    />
                </div>
            </div>
        )
    }
}
