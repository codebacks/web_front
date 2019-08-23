import React from 'react'
import {Button, Table, Icon, message} from 'antd'
import styles from './index.less'
import {hot} from 'react-hot-loader'
import {connect} from 'dva/index'
import documentTitleDecorator from 'hoc/documentTitle'
import DepartmentSelect from 'components/business/DepartmentSelect'
import UserSelect from 'components/business/UserSelect'
import RangeDatePicker from 'components/RangeDatePicker'
import config from "risk_control/common/constants"
import moment from 'moment'
import EllipsisPopover from 'components/EllipsisPopover'
import _ from "lodash"
import qs from 'qs'
import api from 'risk_control/common/api/devices'
import MsgOperateModal from "./components/MsgOperateModal"
import MsgInfoModal from "./components/MsgInfoModal"
import SearchBar from 'business/SearchBar'

const {pageSizeOptions, DateTimeFormat} = config

const statusMap = {
    '0': '异常',
    '1': '正常',
}

const operateStatus = {
    '0': '未处理',
    '1': '已处理',
}

@hot(module)
@connect(({base, risk_control_sensitiveMsg, loading}) => ({
    base,
    risk_control_sensitiveMsg,
    tableLoading: loading.effects['risk_control_sensitiveMsg/details'],
    sensitiveTextMessagesBatchOperateLoading: loading.effects['risk_control_sensitiveMsg/sensitiveTextMessagesBatchOperate'],
}))
@documentTitleDecorator({
    overrideTitle: '敏感短信',
})
export default class Index extends React.Component {
    componentDidMount() {
        this.goPage(1)
    }

    goPage = (page) => {
        this.props.dispatch({
            type: 'risk_control_sensitiveMsg/details',
            payload: {page: page},
        })
    }

    handleSearch = () => {
        this.goPage(1)
    }

    handleChangeSize = (current, size) => {
        this.props.dispatch({
            type: 'risk_control_sensitiveMsg/setStateByPath',
            payload: {
                path: 'params.limit',
                value: size,
            },
        })
        this.goPage(1)
    }

    handleChange = (key, e) => {
        let val = ''
        if (e && e.target) {
            val = e.target.value
        }else {
            val = e
        }
        let params = {...this.props.risk_control_sensitiveMsg.params}
        params[key] = val
        if (key === 'department_id') {
            params['user_id'] = undefined
        }

        this.props.dispatch({
            type: 'risk_control_sensitiveMsg/setStateByPath',
            payload: {
                path: 'params',
                value: params,
            },
        })
    }

    resetSearch = () => {
        this.props.dispatch({
            type: 'risk_control_sensitiveMsg/resetParams',
        })
        this.goPage(1)
    }

    onSelectChange = (selectedRowKeys) => {
        this.props.dispatch({
            type: 'risk_control_sensitiveMsg/setProperty',
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

        return `${api.sensitiveTextMessagesExcel.url}?${qs.stringify(query)}&access_token=${_.get(this, 'props.base.accessToken')}&t=${new Date().getTime()}`
    }

    batchMsgOperateModalCheck = ({setTrue, selectedRowKeys}) => {
        if (!selectedRowKeys.length) {
            message.warning('请勾选未处理短信')
            return
        }

        setTrue()
    }

    render() {
        const {
            tableLoading,
            risk_control_sensitiveMsg,
            dispatch,
            sensitiveTextMessagesBatchOperateLoading,
        } = this.props
        const {list, current, total, params = {}, selectedRowKeys = []} = risk_control_sensitiveMsg

        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
            getCheckboxProps: record => ({
                disabled: Number(record.operate_status) === 1,
            }),
        }

        const columns = [
            {
                title: '敏感消息',
                dataIndex: 'sensitive_words',
                render: (text, record) => {
                    let sensitiveWords = text
                    let content = ''
                    if (sensitiveWords && sensitiveWords.length) {
                        content = sensitiveWords.join('，')
                        return (
                            <EllipsisPopover
                                content={content}
                            />
                        )
                    }
                    return ''
                },
            },
            {
                title: '状态',
                dataIndex: 'status',
                render: (text, record, index) => {
                    return statusMap[text]
                },
            },
            {
                title: '处理状态',
                dataIndex: 'operate_status',
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
                                            未处理
                                        </span>
                                    )
                                }}
                                modalOption={{
                                    confirmLoading: sensitiveTextMessagesBatchOperateLoading,
                                }}
                            />
                        )
                    }else {
                        return operateStatus[text]
                    }
                },
            },
            {
                title: '编号',
                dataIndex: 'number',
            },
            {
                title: '序列号',
                dataIndex: 'serialno',
            },
            {
                title: '设备备注',
                dataIndex: 'remark',
            },
            {
                title: '设备当时所属客服',
                dataIndex: 'user.nickname',
            },
            {
                title: '所属部门',
                dataIndex: 'user.departments',
                render: (text, record) => {
                    let departments = text
                    let content = ''
                    if (departments && departments.length) {
                        content = departments.map((item) => {
                            return item.name
                        }).join('，')
                        return (
                            <EllipsisPopover
                                content={content}
                            />
                        )
                    }
                    return ''
                },
            },

            {
                title: '手机号',
                dataIndex: 'mobile',
            },
            {
                title: '发送时间',
                dataIndex: 'send_time',
                render: (text, record, index) => {
                    if (text) {
                        return moment(text * 1000).format(DateTimeFormat)
                    }
                    return ''
                },
            },
            {
                title: '短信内容',
                dataIndex: 'content',
                className: styles.columnsContent,
                render: (text, record) => {
                    return <EllipsisPopover content={text} lines={2} ellipsisClassName={styles.ellipsisTxt}/>
                }
            },
            {
                title: '操作',
                dataIndex: 'operate',
                render: (text, record, index) => {
                    return (
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
                    )
                },
            },
        ]

        return (
            <div className={styles.main}>
                <div className={styles.content}>
                    <div className={styles.searchWrap}>
                        <SearchBar
                            searchBlock={[
                                {
                                    cols: [
                                        {
                                            formItemOption: {
                                                label: '时间',
                                            },
                                            component: (
                                                <RangeDatePicker
                                                    maxToday={true}
                                                    value={params.call_time}
                                                    onChange={(value) => {
                                                        this.handleChange('call_time', value.slice())
                                                    }}
                                                />
                                            ),
                                        },
                                        {
                                            formItemOption: {
                                                label: '所属部门',
                                            },
                                            component: (
                                                <DepartmentSelect
                                                    departmentId={params.department_id}
                                                    onChange={(value) => {
                                                        this.handleChange('department_id', value)
                                                    }}
                                                />
                                            ),
                                        },
                                        {
                                            formItemOption: {
                                                label: '所属客服',
                                            },
                                            component: (
                                                <UserSelect
                                                    departmentId={params.department_id}
                                                    userId={params.user_id}
                                                    onChange={(value) => {
                                                        this.handleChange('user_id', value)
                                                    }}
                                                />
                                            ),
                                        },
                                    ],
                                },
                                {
                                    cols: [
                                        {
                                            type: 'inputSearch',
                                            formItemOption: {
                                                label: '搜索设备',
                                            },
                                            contentOption: {
                                                params,
                                                handleChange: this.handleChange,
                                                onSearch: this.handleSearch,
                                                key: 'keyword',
                                                placeholder: '输入序列号、设备备注、编号',
                                            },
                                        },
                                        {
                                            type: 'select',
                                            formItemOption: {
                                                label: '状态',
                                            },
                                            contentOption: {
                                                params,
                                                handleChange: this.handleChange,
                                                key: 'status',
                                                placeholder: '全部',
                                                optionsMap: statusMap,
                                            },
                                        },
                                        {
                                            type: 'select',
                                            formItemOption: {
                                                label: '处理状态',
                                            },
                                            contentOption: {
                                                params,
                                                handleChange: this.handleChange,
                                                key: 'operate_status',
                                                placeholder: '全部',
                                                optionsMap: operateStatus,
                                            },
                                        },
                                    ],
                                },
                                {
                                    cols: [
                                        {
                                            type: 'search',
                                            searchBtnOption: {
                                                onClick: this.handleSearch,
                                            },
                                            resetBtnOption: {
                                                onClick: this.resetSearch,
                                            },
                                        },
                                    ],
                                },
                            ]}
                        />
                    </div>
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
                                    confirmLoading: sensitiveTextMessagesBatchOperateLoading,
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
