import React from 'react'
import {Button, Table, Icon, message, Divider} from 'antd'
import styles from './index.less'
import {hot} from 'react-hot-loader'
import {connect} from 'dva/index'
import documentTitleDecorator from 'hoc/documentTitle'
import config from "risk_control/common/constants"
import moment from 'moment'
import _ from "lodash"
import qs from 'qs'
import api from 'risk_control/common/api/devices'
import MsgOperateModal from "./components/MsgOperateModal"
import SearchBlock from "./components/SearchBlock"
import MsgInfoModal from "./components/MsgInfoModal"
import ContentHeader from "business/ContentHeader"
import ViewContextModal from "business/HistoryMessages/ViewContextModal"
import GroupViewContextModal from "business/HistoryMessages/GroupViewContextModal"
import {getOptionsMap} from './utils'

const {pageSizeOptions, DateTimeFormat} = config

@hot(module)
@connect(({base, risk_control_sensitiveBehavior, loading}) => ({
    base,
    risk_control_sensitiveBehavior,
    tableLoading: loading.effects['risk_control_sensitiveBehavior/details'],
    changeWxSensitiveOperationRecordsLoading: loading.effects['risk_control_sensitiveBehavior/changeWxSensitiveOperationRecords'],
    wxSensitiveOperationAllRecordsLoading: loading.effects['risk_control_sensitiveBehavior/wxSensitiveOperationAllRecords'],
    wxDivideOptionsLoading: loading.effects['risk_control_sensitiveBehavior/wxDivideOptions'],
    groupsAllLoading: loading.effects['risk_control_sensitiveBehavior/groupsAll'],
}))
@documentTitleDecorator()
export default class Index_page extends React.Component {
    componentDidMount() {
        this.goPage(1)
    }

    goPage = (page) => {
        this.props.dispatch({
            type: 'risk_control_sensitiveBehavior/details',
            payload: {page: page},
        })
    }

    handleSearch = () => {
        this.goPage(1)
    }

    handleChangeSize = (current, size) => {
        this.props.dispatch({
            type: 'risk_control_sensitiveBehavior/setStateByPath',
            payload: {
                path: 'params.limit',
                value: size,
            },
        })
        this.goPage(1)
    }

    resetSearch = () => {
        this.props.dispatch({
            type: 'risk_control_sensitiveBehavior/resetParams',
        })
        this.goPage(1)
    }

    onSelectChange = (selectedRowKeys) => {
        this.props.dispatch({
            type: 'risk_control_sensitiveBehavior/setProperty',
            payload: {
                selectedRowKeys,
            },
        })
    }

    getExportUrl = (params) => {
        let query = _.cloneDeep(params)
        delete query.limit
        delete query.offset
        if (params.call_time[0]) {
            query.start_time = `${moment(params.call_time[0]).format('YYYY-MM-DD')} 00:00:00`
        }

        if (params.call_time[1]) {
            query.end_time = `${moment(params.call_time[1]).format('YYYY-MM-DD')} 23:59:59`
        }

        delete query.call_time

        return `${api.wxSensitiveOperationRecordsExport.url}?${qs.stringify(query)}&access_token=${_.get(this, 'props.base.accessToken')}&t=${new Date().getTime()}`
    }

    batchMsgOperateModalCheck = ({setTrue, selectedRowKeys}) => {
        if (!selectedRowKeys.length) {
            message.warning('请勾选未处理短信')
            return
        }

        setTrue()
    }

    renderHistoryModal = (record) => {
        if (record.target_type === 0) {
            return (
                <ViewContextModal
                    activeRecord={{
                        create_time: record.msg_create_time,
                    }}
                    fromUin={record.uin}
                    toUsername={record.target_wechat_id}
                    renderBtn={(setTrue) => {
                        return (
                            <span
                                className={styles.operate}
                                onClick={setTrue}
                            >
                                聊天记录
                            </span>
                        )
                    }}
                />
            )
        }else if (record.target_type === 1) {
            return (
                <GroupViewContextModal
                    activeRecord={{
                        create_time: record.msg_create_time,
                    }}
                    activeSession={{
                        from: {
                            uin: record.uin,
                            username: record.username,
                        },
                        target: {
                            username: record.target_chatroom_id,
                        },
                    }}
                    renderBtn={(setTrue) => {
                        return (
                            <span
                                className={styles.operate}
                                onClick={setTrue}
                            >
                                聊天记录
                            </span>
                        )
                    }}
                />
            )
        }
    }

    render() {
        const {
            tableLoading,
            risk_control_sensitiveBehavior,
            dispatch,
            changeWxSensitiveOperationRecordsLoading,
        } = this.props
        const {list, current, total, params = {}, selectedRowKeys = []} = risk_control_sensitiveBehavior

        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
            getCheckboxProps: (record) => {
                return {
                    disabled: Number(record.handle_status) === 1,
                }
            },
        }

        const columns = [
            {
                title: '敏感操作',
                dataIndex: 'sensitive_operation_title',
                render: (text, record, index) => {
                    return (
                        <>
                            <div>{text}</div>
                            {
                                record.sensitive_operation_id === 99999 && (
                                    <div className={styles.sensitiveWord}>{record.extra}</div>
                                )
                            }
                        </>
                    )
                },
            },
            {
                title: '状态',
                dataIndex: 'status',
                render: (text, record, index) => {
                    return getOptionsMap('status')[text]
                },
            },
            {
                title: '处理状态',
                dataIndex: 'handle_status',
                render: (text, record, index) => {
                    if (text === 0) {
                        return (
                            <MsgOperateModal
                                dispatch={dispatch}
                                list={list}
                                ids={[record.id]}
                                goPage={this.goPage}
                                renderBtn={(setTrue) => {
                                    return (
                                        <span
                                            className={styles.operate}
                                            onClick={setTrue}
                                        >
                                            {getOptionsMap('handle_status')[text]}
                                        </span>
                                    )
                                }}
                                modalOption={{
                                    confirmLoading: changeWxSensitiveOperationRecordsLoading,
                                }}
                            />
                        )
                    }else {
                        return getOptionsMap('handle_status')[text]
                    }
                },
            },
            {
                title: '所属微信',
                dataIndex: 'wechat',
                key: 'wx',
                render: (text = {}, record) => {
                    return text.remark || text.nickname
                },
            },
            {
                title: '微信号所属客服',
                dataIndex: 'user_nickname',
            },
            {
                title: '微信好友/群',
                dataIndex: 'target_type',
                render: (text, record) => {
                    const target_friend = record.target_friend || {}
                    return target_friend.remark || target_friend.nickname
                },
            },
            {
                title: '设备备注',
                dataIndex: 'wechat.serialno',
            },
            {
                title: '设备当时所属客服',
                dataIndex: 'current_user_nickname',
            },
            {
                title: '发生时间',
                dataIndex: 'msg_create_time',
                render: (text, record, index) => {
                    if (text) {
                        return moment(text).format(DateTimeFormat)
                    }
                    return ''
                },
            },
            {
                title: '操作',
                dataIndex: 'operate',
                render: (text, record, index) => {
                    return (
                        <>
                            <MsgInfoModal
                                dispatch={dispatch}
                                record={record}
                                renderBtn={(setTrue) => {
                                    return (
                                        <span
                                            className={styles.operate}
                                            onClick={setTrue}
                                        >
                                            详情
                                        </span>
                                    )
                                }}
                            />
                            <Divider type="vertical"/>
                            {this.renderHistoryModal(record)}
                        </>
                    )
                },
            },
        ]

        return (
            <div className={styles.main}>
                <ContentHeader
                    contentType={'title'}
                    content={{
                        title: this.props.documentTitle,
                    }}
                />
                <div className={styles.content}>
                    <SearchBlock
                        {...this.props}
                        handleSearch={this.handleSearch}
                        resetSearch={this.resetSearch}
                    />
                    <div className={styles.helpBar}>
                        <div className={styles.left}>
                            <MsgOperateModal
                                dispatch={dispatch}
                                list={list}
                                ids={selectedRowKeys}
                                goPage={this.goPage}
                                renderBtn={(setTrue) => {
                                    return (
                                        <Button
                                            disabled={tableLoading}
                                            onClick={() => {
                                                this.batchMsgOperateModalCheck({
                                                    setTrue,
                                                    selectedRowKeys,
                                                })
                                            }}
                                            type={'primary'}
                                        >
                                            处理
                                        </Button>
                                    )
                                }}
                                modalOption={{
                                    confirmLoading: changeWxSensitiveOperationRecordsLoading,
                                }}
                            />
                        </div>
                        <div className={styles.right}>
                            <a
                                target={'_blank'}
                                rel={'noopener noreferrer'}
                                href={this.getExportUrl(params)}
                            >
                                <Button>
                                    <Icon type="download"/>
                                    导出
                                </Button>
                            </a>
                        </div>
                    </div>
                    <div className={styles.table}>
                        <Table
                            columns={columns}
                            dataSource={list}
                            rowKey={(record) => record.id}
                            loading={tableLoading}
                            rowSelection={rowSelection}
                            pagination={
                                list.length
                                    ? {
                                        total,
                                        current,
                                        showQuickJumper: true,
                                        showTotal: (total) => `共 ${total} 条`,
                                        pageSize: params.limit,
                                        showSizeChanger: true,
                                        onChange: this.goPage,
                                        onShowSizeChange: this.handleChangeSize,
                                        pageSizeOptions,
                                    }
                                    : false
                            }
                        />
                    </div>
                </div>
            </div>
        )
    }
}
