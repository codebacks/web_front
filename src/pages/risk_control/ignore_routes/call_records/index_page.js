import React from 'react'
import {Button, Table, Checkbox, Icon, Modal} from 'antd'
import styles from './index.less'
import {hot} from 'react-hot-loader'
import {connect} from 'dva/index'
import documentTitleDecorator from 'hoc/documentTitle'
import ContentHeader from 'business/ContentHeader'
import DepartmentSelect from 'components/business/DepartmentSelect'
import UserSelect from 'components/business/UserSelect'
import RangeDatePicker from 'components/RangeDatePicker'
import config from "risk_control/common/constants"
import RangeInputNumber from 'components/RangeInputNumber'
import moment from 'moment'
import EllipsisPopover from 'components/EllipsisPopover'
import _ from "lodash"
import qs from 'qs'
import api from 'risk_control/common/api/devices'
import SearchBar from 'business/SearchBar'

const {pageSizeOptions, DateTimeFormat} = config

const typeMap = {
    '1': '呼入',
    '2': '呼出',
    '3': '未接',
    '4': '语音邮件',
    '5': '拒接',
}

@hot(module)
@connect(({base, risk_control_callRecords, loading}) => ({
    base,
    risk_control_callRecords,
    tableLoading: loading.effects['risk_control_callRecords/details'],
}))
@documentTitleDecorator()
export default class Index extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            record: null,
            isAudioModal: false,
        }
    }

    componentDidMount() {
        this.goPage(1)
    }

    goPage = (page) => {
        this.props.dispatch({
            type: 'risk_control_callRecords/details',
            payload: {page: page},
        })
    }

    handleSearch = () => {
        this.goPage(1)
    }

    handleChangeSize = (current, size) => {
        this.props.dispatch({
            type: 'risk_control_callRecords/setStateByPath',
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
        let params = {...this.props.risk_control_callRecords.params}
        params[key] = val
        if (key === 'department_id') {
            params['user_id'] = undefined
        }

        this.props.dispatch({
            type: 'risk_control_callRecords/setStateByPath',
            payload: {
                path: 'params',
                value: params,
            },
        })
    }

    resetSearch = () => {
        this.props.dispatch({
            type: 'risk_control_callRecords/resetParams',
        })
        this.goPage(1)
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

        if (params.call_duration[0]) {
            query.seconds_start = params.call_duration[0]
        }

        if (params.call_duration[1]) {
            query.seconds_end = params.call_duration[1]
        }

        delete query.call_duration

        return `${api.callRecordsExport.url}?${qs.stringify(query)}&access_token=${_.get(this, 'props.base.accessToken')}&t=${new Date().getTime()}`
    }

    onChange = (e) => {
        this.handleChange('is_marketing', e.target.checked ?  '0' : undefined)
        this.goPage()
    }

    showAudioModal = (e, record) => {
        e.preventDefault()
        this.setState({
            isAudioModal: true,
            record: record,
        })
    }

    audioModalCancel = () => {
        this.setState({
            isAudioModal: false,
            record: null,
        })
    }

    renderTypeMap = (type) => {
        let txt = ''
        switch (Number(type)) {
            case 1:
                txt = '呼入'
                break
            case 2:
                txt = '呼出'
                break
            case 3:
                txt = '未接'
                break
            case 4:
                txt = '语音邮件'
                break
            case 5:
                txt = '拒接'
                break
            default:
                txt = '其他'
                break
        }
        return <span>{txt}</span>
    }

    render() {
        const {record, isAudioModal} = this.state
        const {tableLoading, risk_control_callRecords} = this.props
        const {list, current, total, params = {}} = risk_control_callRecords

        const columns = [
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
                title: '呼叫类型',
                dataIndex: 'type',
                render: (text, record, index) => {
                    return this.renderTypeMap(text)
                },
            },
            {
                title: '通话号码',
                dataIndex: 'mobile',
            },
            {
                title: '开始时间',
                dataIndex: 'start_time',
                render: (text, record, index) => {
                    if (text) {
                        return moment(text * 1000).format(DateTimeFormat)
                    }
                    return ''
                },
            },
            {
                title: '结束时间',
                dataIndex: 'end_time',
                render: (text, record, index) => {
                    if (text) {
                        return moment(text * 1000).format(DateTimeFormat)
                    }
                    return ''
                },
            },
            {
                title: '通话时长（秒）',
                dataIndex: 'seconds',
            },
            {
                title: '操作',
                dataIndex: 'url',
                render: (text, record, index) => {
                    return (
                        text ? <a onClick={(e) => {this.showAudioModal(e, record)}}>播放录音</a> : '-'
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
                    <SearchBar
                        searchBlock={[
                            {
                                cols: [
                                    {
                                        formItemOption: {
                                            label: '通话时间',
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
                                            label: '通话时长',
                                        },
                                        component: (
                                            <RangeInputNumber
                                                value={params.call_duration}
                                                onChange={(value) => {
                                                    this.handleChange('call_duration', value.slice())
                                                }}
                                                min={0}
                                            />
                                        ),
                                    },
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
                                ],
                            },
                            {
                                cols: [
                                    {
                                        type: 'select',
                                        formItemOption: {
                                            label: '呼叫类型',
                                        },
                                        contentOption: {
                                            params,
                                            handleChange: this.handleChange,
                                            key: 'type',
                                            placeholder: '全部',
                                            optionsMap: typeMap,
                                        },
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
                    <div className={styles.helpBar}>
                        <div className={styles.left}>
                            <Checkbox
                                value={params.is_marketing}
                                disabled={tableLoading}
                                onChange={this.onChange}
                            >
                                隐藏营销号码
                            </Checkbox>
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

                {
                    isAudioModal ? (
                        <Modal
                            visible={isAudioModal}
                            onCancel={this.audioModalCancel}
                            width={800}
                            footer={null}
                        >
                            <h3>通话记录录音：</h3>
                            <audio controls="controls" autoplay="autoplay" style={{width: '700px'}}>
                                <source src={record?.url} type="audio/mpeg" />
                                <source src={record?.url} type="audio/ogg" />
                                <embed src={record?.url} />
                            </audio>
                        </Modal>
                    ) : null
                }

            </div>
        )
    }
}
