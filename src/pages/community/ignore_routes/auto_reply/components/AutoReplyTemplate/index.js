/**
 * @Description
 * @author XuMengPeng
 * @date 2019/3/28
 */

import React, {PureComponent} from 'react'
import { Button, message, Table, Modal, Pagination, } from 'antd'
import {connect} from "dva/index"
import router from "umi/router"
import config from 'community/common/config'
import UpdateTemplateModal from './components/UpdateTemplateModal'
import styles from './index.less'

const { pageSizeOptions, } = config

@connect(({community_autoReplyTemplate, loading}) => ({
    community_autoReplyTemplate,
    queryLoading: loading.effects['community_autoReplyTemplate/query'],
    addLoading: loading.effects['community_autoReplyTemplate/add'],
    editLoading: loading.effects['community_autoReplyTemplate/edit'],
    removeLoading: loading.effects['community_autoReplyTemplate/remove'],
}))
export default class Index extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            record: null,
        }
    }

    componentDidMount() {
        this.goPage(1)
    }

    goPage = page => {
        if(typeof page === 'undefined') {
            page = this.props.community_autoReplyTemplate.current
        }
        this.props.dispatch({
            type: 'community_autoReplyTemplate/query',
            payload: {page: page},
        })
    }

    remove = (record) => {
        new  Promise((resolve, reject) => {
            this.props.dispatch({
                type: 'community_autoReplyTemplate/removeCheck',
                payload: {
                    template_id: record?.id,
                },
                callback: (data) => {
                    resolve(data)
                }
            })
        }).then((data) => {
            const can_delete = data?.can_delete
            const used_uin_size = data?.used_uin_size
            if(can_delete) {
                Modal.confirm({
                    title: '是否确定要删除该模板？',
                    onOk: () => {
                        return new Promise((resolve) => {
                            this.props.dispatch({
                                type: 'community_autoReplyTemplate/remove',
                                payload: {
                                    template_id: record?.id,
                                },
                                callback: () => {
                                    resolve()
                                    message.success('删除成功！')
                                    this.goPage(this.props.community_autoReplyTemplate.current ||1)
                                }
                            })
                        })
                    },
                    onCancel() {
                    },
                })
            }else {
                Modal.info({
                    title: `该模板当前有${used_uin_size}个微信号正在使用，若要删除请先移除`,
                    onOk: () => {
                        return new Promise((resolve) => {
                            resolve()
                        })
                    },
                })
            }
        }).catch((err) => {
            console.log(err)
        })
    }

    goDetail = (record) => {
        router.push(`/community/auto_reply/templateDetail/${record.id}`)
    }

    handleChangeSize = (current, size) => {
        let params = {...this.props.community_autoReplyTemplate.params}
        params.limit = size
        this.props.dispatch({
            type: 'community_autoReplyTemplate/setProperty',
            payload: {params: params},
        })
        this.goPage(1) // 重置个数时回到首页
    }

    onUpdateTemplateModalOk = (type, inputValue, record) => {
        const { dispatch } = this.props
        if(type === 'add') { // add
            dispatch({
                type: 'community_autoReplyTemplate/add',
                payload: {
                    body: {title: inputValue}
                },
                callback: () => {
                    message.success('创建成功！')
                    this.goPage(1)
                }
            })
        }else{ // edit
            if(inputValue === record?.title) { // title未改变
                return
            }
            dispatch({
                type: 'community_autoReplyTemplate/edit',
                payload: {
                    template_id: record?.id,
                    body: {
                        title: inputValue,
                    }
                },
                callback: () => {
                    message.success('修改成功！')
                    this.goPage(this.props.community_autoReplyTemplate.current ||1)
                }
            })
        }
    }

    render() {
        const { queryLoading, addLoading, editLoading, community_autoReplyTemplate,  } = this.props
        const { list, params: {limit}, current, total } = community_autoReplyTemplate

        const columns = [
            {
                title: '模板标题',
                dataIndex: 'title',
            },
            {
                title: '关键词数量',
                dataIndex: 'key_word_count',
                align: 'center',
                render: (text, record) => {
                    return <span className={styles.canEdit} onClick={() => {this.goDetail(record)}}>{text}</span>
                },
            },
            {
                title: '创建人',
                dataIndex: 'creator_nickname',
            },
            {
                title: '创建时间',
                dataIndex: 'create_at',
            },
            {
                title: '操作',
                key: 'operator',
                render: (text, record) => {
                    return (
                        <div className={`${styles.canEdit} ${styles.operatorBtns}`}>
                            <span onClick={() => {this.goDetail(record)}}>详情</span>
                            <UpdateTemplateModal
                                renderBtn={(setTrue) => {
                                    return (
                                        <span onClick={setTrue}>编辑</span>
                                    )
                                }}
                                type={'edit'}
                                record={record}
                                onOk={this.onUpdateTemplateModalOk}
                                modalOption={{
                                    title: '编辑',
                                    okButtonProps: {loading: editLoading},
                                }}
                            />

                            <span onClick={() => {this.remove(record)}}>删除</span>
                        </div>
                    )
                },
            },
        ]

        return (
            <div className={styles.autoReplyTemplate}>
                <div className={styles.tableHeader}>
                    <UpdateTemplateModal
                        renderBtn={(setTrue) => {
                            return (
                                <Button onClick={setTrue}>创建回复模板</Button>
                            )
                        }}
                        type={'add'}
                        onOk={this.onUpdateTemplateModalOk}
                        modalOption={{
                            title: '创建模板',
                            okButtonProps: {loading: addLoading},
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
                    {list.length ?
                        <Pagination
                            className="ant-table-pagination"
                            total={total}
                            current={current}
                            showQuickJumper={true}
                            pageSizeOptions={pageSizeOptions}
                            showTotal={total => `共 ${total} 条`}
                            pageSize={limit}
                            showSizeChanger={true}
                            onShowSizeChange={this.handleChangeSize}
                            onChange={this.goPage}
                        />
                        : ''}
                </div>
            </div>
        )
    }
}
