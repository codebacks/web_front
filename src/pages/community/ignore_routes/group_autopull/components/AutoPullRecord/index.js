import React from 'react'
import {connect} from 'dva'
import {Table, Button, Form, Input, Select, Row, Col, Pagination, message, Badge} from 'antd'
import config from 'wx/common/config'
import styles from './index.less'
import moment from "moment/moment"
import _ from 'lodash'
import DateRange from 'components/DateRange/index'
import EllipsisPopover from 'components/EllipsisPopover'

const FormItem = Form.Item
const Option = Select.Option
const {pageSizeOptions, DateFormat, DefaultAvatar, DateTimeFormat} = config

@connect(({ community_autoPullRecord, loading}) => ({
    community_autoPullRecord,
    queryLoading: loading.effects['community_autoPullRecord/query']
}))
export default class extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            sortedInfo: null, // 排序
        }
    }

    componentDidMount() {
        this.props.dispatch({
            type: 'community_autoPullRecord/query',
            payload: {page: 1},
        })
        this.props.dispatch({type: 'community_autoPullRecord/autoPullRecordStatistics',})
    }
    componentWillUnmount() {}

    handleChangeDate = (startValue, endValue) => {
        let params = {...this.props.community_autoPullRecord.params}
        if (startValue) {
            params.execute_time_start = moment(startValue).format(DateFormat) + ' 00:00:00'
        } else {
            params.execute_time_start = ''
        }
        if (endValue) {
            params.execute_time_end = moment(endValue).format(DateFormat) + ' 23:59:59'
        } else {
            params.execute_time_end = ''
        }
        this.props.dispatch({
            type: 'community_autoPullRecord/setProperty',
            payload: {params: params}
        })
    };
    handleSearch = () => {
        this.goPage(1)
    };
    goPage = (page) => {
        this.props.dispatch({
            type: 'community_autoPullRecord/query',
            payload: {page: page}
        })
    };
    handleChange = (key, e) => {
        let val = ''
        if (key === 'query') {
            val = e.target.value
        } else {
            val = e
        }
        let params = {...this.props.community_autoPullRecord.params}
        params[key] = val
        this.props.dispatch({
            type: 'community_autoPullRecord/setProperty',
            payload: {params: params}
        })
    };
    handleChangeSize = (current, size) => {
        let params = {...this.props.community_autoPullRecord.params}
        params.limit = size
        this.props.dispatch({
            type: 'community_autoPullRecord/setProperty',
            payload: {params: params},
        })
        this.goPage(1) // 重置个数时回到首页
    };
    resetSearch = () => {
        this.resetAutoPullParams()
        this.DateRangeNode.setDate()
        this.goPage(1)
        this.resetSortedInfo()
    }
    resetAutoPullParams = () => {
        this.props.dispatch({
            type: 'community_autoPullRecord/resetAutoPullParams',
        })
    }

    handleTableChange = (pagination, filters, sorter) => {
        const field = sorter.field || '', order = sorter.order || ''
        const sortedInfo = {
            order: sorter.order,
            columnKey: sorter.field,
        }
        let params = {...this.props.community_autoPullRecord.params}
        if (order === 'descend') {
            params['order_by'] = `-${field}`
        } else {
            params['order_by'] = field
        }
        this.props.dispatch({
            type: 'community_autoPullRecord/query',
            payload: {params},
        })
        this.setState({sortedInfo})
    }
    resetSortedInfo = () => {
        this.setState({
            sortedInfo: null
        })
    }

    render() {
        const { params, total, current, list, statistics } = this.props.community_autoPullRecord
        const { queryLoading } = this.props
        let sortedInfo = this.state.sortedInfo || {}
        const formItemLayout = {labelCol: {span: 6}, wrapperCol: {span: 18},}
        const formTimeLayout = {labelCol: {span: 4}, wrapperCol: {span: 20},}
        const columns = [
            {
                title: '头像',
                dataIndex: 'friend.head_img_url',
                className: styles.avatar,
                align: 'center',
                render: (text, record) => {
                    return (
                        <img src={text} alt="" onError={(e) => {e.target.src=DefaultAvatar}} />
                    )
                }
            },
            {
                title: '微信昵称',
                dataIndex: 'friend.nickname',
                className: styles.nickname,
                render: (text, record) => {
                    return <span>{text ? text : '-'}</span>
                }
            },
            {
                title: '微信号',
                dataIndex: 'friend.alias',
                className: styles.wechatId,
                render: (text, record) => {
                    return <span>{text ? text : record.friend.username}</span>
                }
            },
            {
                title: '微信备注',
                dataIndex: 'friend.remark_name',
                className: styles.remark,
                render: (text) => {
                    return <span>{text ? text : '无'}</span>
                }
            },
            {
                title: '执行微信',
                dataIndex: 'executor.nickname',
                className: styles.executor,
            },
            {
                title: '目标群',
                dataIndex: 'chatroom.nickname',
                className: styles.desGroup,
                render: (text, record) => {
                    return <span>{text ? text : record.chatroom.display_name}</span>
                }
            },
            {
                title: '执行时间',
                dataIndex: 'execute_time',
                className: styles.time,
                sorter: true,
                sortOrder: sortedInfo.columnKey === 'execute_time' && sortedInfo.order,
                render: (text) => {
                    return <span>{ text ? moment(text*1000).format(DateTimeFormat) : '-' }</span>
                }
            },
            {
                title: '加群方式',
                dataIndex: 'task_type',
                className: styles.way,
                render: (text) => {
                    return <span>{!!text ? '暗号拉群' : '新好友拉群'}</span>
                }
            },
            {
                title: '暗号',
                dataIndex: 'keywords',
                className: styles.keywords,
                render: (text) => {
                    return  <EllipsisPopover
                        content={text}
                        lines={2}
                    />
                }
            },
            {
                title: '状态',
                dataIndex: 'status',
                className: styles.status,
                render: (text) => {
                    const statusEnum = {
                        '0': {text: '未发送', icon: 'default'},
                        '1': {text: '成功', icon: 'success'},
                        '-1': {text: '失败', icon: 'error'},
                        '2': {text: '执行中', icon: 'default'},
                        '-2': {text: '已取消', icon: 'default'}
                    }
                    return <span>
                        <Badge status={statusEnum[`${text}`].icon} text={statusEnum[`${text}`].text}/>
                    </span>
                },
            },
            {
                title: '失败原因',
                dataIndex: 'error_message',
                className: styles.failReason,
            },
        ]

        return (
            <div className={styles.autoPullWrap}>
                <div className={styles.searchWrap}>
                    <Row gutter={20}>
                        <Col span={7}>
                            <FormItem {...formItemLayout} label="搜索：" colon={false}>
                                <Input placeholder="输入微信昵称、备注或微信号搜索"
                                    value={params.query}
                                    onChange={(e)=>{this.handleChange('query', e)}}/>
                            </FormItem>
                        </Col>
                        <Col span={7}>
                            <FormItem {...formItemLayout} label="选择状态：" colon={false}>
                                <Select
                                    style={{width: '100%'}}
                                    value={params.status} onChange={(e)=>{this.handleChange('status', e)}}
                                    placeholder='全部'
                                >
                                    <Option value="">全部</Option>
                                    <Option value="0">未发送</Option>
                                    <Option value="1">成功</Option>
                                    <Option value="-1">失败</Option>
                                    <Option value="2">执行中</Option>
                                    <Option value="-2">已取消</Option>
                                </Select>
                            </FormItem>
                        </Col>
                        <Col span={10}>
                            <FormItem {...formTimeLayout} label="执行时间：" colon={false}>
                                <DateRange {...this.props}
                                    startValue={params.execute_time_start ? moment(params.execute_time_start, DateFormat) : null}
                                    endValue={params.execute_time_end ? moment(params.execute_time_end, DateFormat) : null}
                                    maxToday={true}
                                    onChange={this.handleChangeDate}
                                    ref={ node => this.DateRangeNode=node}
                                />
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={20}>
                        <Col span={7}>
                            <FormItem {...formItemLayout} label="加群方式：" colon={false}>
                                <Select
                                    style={{width: '100%'}}
                                    value={params.task_type} onChange={(e)=>{this.handleChange('task_type', e)}}
                                    placeholder='全部'
                                >
                                    <Option value="">全部</Option>
                                    <Option value={0}>好友加群</Option>
                                    <Option value={1}>暗号加群</Option>
                                </Select>
                            </FormItem>
                        </Col>
                    </Row>
                    <Row className={styles.searchBtn} gutter={20}>
                        <Col span={7}>
                            <Col offset={1}>
                                <Button type="primary" icon="search" onClick={this.handleSearch} loading={queryLoading}>搜索</Button>
                                <Button onClick={this.resetSearch}>重置</Button>
                            </Col>
                        </Col>
                    </Row>
                </div>
                <div className={styles.statusWrap}>
                    <div className={styles.statusItem}>
                        <div className={styles.num}>{statistics?.count_failed}</div>
                        <div>失败</div>
                    </div>
                    <div className={styles.statusItem}>
                        <div className={styles.num}>{statistics?.count_success}</div>
                        <div>成功</div>
                    </div>
                </div>
                <div className={styles.tableWrap}>
                    <Table
                        columns={columns}
                        dataSource={list}
                        size="middle"
                        loading={queryLoading}
                        rowKey={(record, index) => index}
                        pagination={false}
                        onChange={this.handleTableChange}
                    />
                    {list.length ?
                        <Pagination
                            className="ant-table-pagination"
                            total={total}
                            current={current}
                            showQuickJumper={true}
                            pageSizeOptions={pageSizeOptions}
                            showTotal={total => `共 ${total} 条`}
                            pageSize={params.limit}
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
