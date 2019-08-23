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
import FullTypeMessageModal from 'business/FullTypeMessageModal'
import {getTabName, MsgContent} from 'business/FullTypeMessage'
import styles from './index.less'
import {hot} from "react-hot-loader"
import _ from 'lodash'

@hot(module)
@connect(({community_groupRules, loading}) => ({
    community_groupRules,
    categoryUpdateLoading: loading.effects['community_groupRules/categoryUpdate'],
    categoryLoading: loading.effects['community_groupRules/category'],
}))
export default class Index extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {

    }

    move = (record, preIndex, nextIndex) => {
        const {
            auto_reply_reply_contents: list,
        } = this.props.community_groupRules
        let ord = 0
        if(nextIndex === 0) {
            ord = list[nextIndex].ord - 1
        }else if(preIndex === (list.length - 1)) {
            ord = list[preIndex].ord + 1
        }else {
            ord = (list[preIndex].ord + list[nextIndex].ord) / 2
        }

        this.props.dispatch({
            type: 'community_groupRules/editReply',
            payload: {id: record.id, ord},
        })
        message.success('移动成功')
    }

    handleRemove = (record) => {
        Modal.confirm({
            title: '确定删除该内容？',
            okText: '删除',
            okType: 'danger',
            cancelText: '取消',
            onOk: () => {
                this.props.dispatch({
                    type: 'community_groupRules/deleteReply',
                    payload: {id: record.id},
                })
                message.success('删除成功')
            },
            onCancel() {
            },
        })
    }

    render() {
        const {
            categoryUpdateLoading,
            community_groupRules,
            categoryLoading,
        } = this.props
        const {
            auto_reply_reply_contents: list,
        } = community_groupRules

        const columns = [
            {
                title: '回复类型',
                dataIndex: 'type',
                width: 100,
                render: (text, record, index) => {
                    return getTabName(_.get(record, 'common_msg_content.type'))

                },
            },
            {
                title: '内容',
                dataIndex: 'content',
                render: (text, record, index) => {
                    return (
                        <MsgContent
                            type={_.get(record, 'common_msg_content.type')}
                            values={_.get(record, 'common_msg_content.values')}
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
                            <FullTypeMessageModal
                                tabsActiveKey={record.common_msg_content.type}
                                typeValue={{
                                    type: record.common_msg_content.type,
                                    values: record.common_msg_content.values,
                                }}
                                typeSourceType={{
                                    type: record.common_msg_content.type,
                                    sourceType: record.common_msg_content.source_type,
                                }}
                                handleOk={({data, handleCancel}) => {
                                    const formData = {
                                        common_msg_content: data,
                                        id: record.id,
                                    }
                                    this.props.dispatch({
                                        type: 'community_groupRules/editReply',
                                        payload: formData,
                                    })
                                    message.success('更新成功！')

                                    handleCancel()
                                }}
                                renderBtn={(setTrue) => {
                                    return (
                                        <span
                                            className={styles.operatorBtn}
                                            onClick={setTrue}
                                        >
                                            编辑
                                        </span>
                                    )
                                }}
                                modalOption={{
                                    title: '编辑回复',
                                }}
                            />
                            <Divider type="vertical"/>
                            <span
                                className={styles.operatorBtn}
                                onClick={() => {
                                    this.handleRemove(record)
                                }}
                            >
                                删除
                            </span>
                            {
                                index !== 0 && (
                                    <>
                                        <Divider type="vertical"/>
                                        <span
                                            className={styles.operatorBtn}
                                            onClick={() => {
                                                this.move(record, index - 2, index - 1)
                                            }}
                                        >
                                            上移
                                        </span>
                                    </>
                                )
                            }
                            {
                                index !== list.length - 1 && (
                                    <>
                                        <Divider type="vertical"/>
                                        <span
                                            className={styles.operatorBtn}
                                            onClick={() => {
                                                this.move(record, index + 1, index + 2)
                                            }}
                                        >
                                            下移
                                        </span>
                                    </>
                                )
                            }
                        </div>
                    )
                },
            },
        ]

        return (
            <div className={styles.replyContents}>
                <div className={styles.title}>
                    回复内容
                </div>
                <div className={styles.content}>
                    <div className={styles.option}>
                        <FullTypeMessageModal
                            handleOk={({data, handleCancel}) => {
                                const formData = {
                                    common_msg_content: data,
                                }
                                this.props.dispatch({
                                    type: 'community_groupRules/addReply',
                                    payload: formData,
                                })
                                message.success('创建成功！')

                                handleCancel()
                            }}
                            renderBtn={(setTrue) => {
                                return (
                                    <Button
                                        type="primary"
                                        loading={categoryUpdateLoading || categoryLoading}
                                        onClick={() => {
                                            if(list.length >= 10) {
                                                message.warning('请勿设置超过10条的回复')
                                                return
                                            }
                                            setTrue()
                                        }}
                                        icon="plus"
                                    >
                                        添加回复
                                    </Button>
                                )
                            }}
                            modalOption={{
                                title: '新建回复',
                            }}
                        />
                        <span className={styles.mark}>建议回复内容不要创建过多，以1~3条为佳</span>
                    </div>
                    <div className={styles.table}>
                        <Table
                            columns={columns}
                            dataSource={list}
                            rowKey={(record) => {
                                return record.id
                            }}
                            loading={categoryUpdateLoading || categoryLoading}
                            pagination={false}
                        />
                    </div>
                </div>
            </div>
        )
    }
}
