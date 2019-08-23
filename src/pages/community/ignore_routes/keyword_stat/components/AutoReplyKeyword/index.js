/**
 * @Description
 * @author XuMengPeng
 * @date 2019/4/23
 */

import React, {Component} from 'react'
import {Row, Col, Form, Input, Button, Table, Pagination, message, Alert, Popconfirm} from 'antd'
import {connect} from 'dva'
import moment from 'moment'
import DateRange from 'components/DateRange'
import config from 'community/common/config'
import EllipsisPopover from 'components/EllipsisPopover'
import helper from 'utils/helper'
import styles from './index.less'

const FormItem = Form.Item
const Search = Input.Search
const {DateFormat, pageSizeOptions} = config

@connect(({base, community_keywordStat_autoReplyKeyword, loading}) => ({
    base, community_keywordStat_autoReplyKeyword,
    queryLoading: loading.effects['community_keywordStat_autoReplyKeyword/query'],
}))
export default class Management extends Component {
    constructor(props) {
        super(props)
        this.state = {
            sortedInfo: null
        }
    }

    componentDidMount() {
        this.goPage(1)
    }

    componentWillUnmount() {
    }

    handleChange = (key, e) => {
        let val = ''
        if (e && e.target) {
            val = e.target.value
        } else {
            val = e
        }
        if (key === 'query') {
            if (helper.isEmojiCharacter(val)) {
                val = helper.filterEmojiCharacter(val)
                message.warning('不支持输入表情符号')
            }
        }
        let params = {...this.props.community_keywordStat_autoReplyKeyword.params}
        params[key] = val
        this.props.dispatch({
            type: 'community_keywordStat_autoReplyKeyword/setParams',
            payload: {params: params},
        })
    }

    handleChangeDate = (startValue, endValue) => {
        let params = {...this.props.community_keywordStat_autoReplyKeyword.params}
        if (startValue) {
            params.start_time = moment(startValue).format(DateFormat) + ' 00:00:00'
        } else {
            params.start_time = ''
        }
        if (endValue) {
            params.end_time = moment(endValue).format(DateFormat) + ' 23:59:59'
        } else {
            params.end_time = ''
        }
        this.props.dispatch({
            type: 'community_keywordStat_autoReplyKeyword/setParams',
            payload: {params: params}
        })
    };

    goPage = (page) => {
        this.props.dispatch({
            type: 'community_keywordStat_autoReplyKeyword/query',
            payload: {page: page},
        })
    }

    handleTableChange = (pagination, filters, sorter) => {
        const field = sorter.field || ''
        const order = sorter.order || ''
        const sortedInfo = {
            order: sorter.order,
            columnKey: sorter.field,
        }
        let params = {...this.props.community_keywordStat_autoReplyKeyword.params}
        if (order === 'descend') {
            params['order_by'] = `-${field}`
        } else {
            params['order_by'] = field
        }
        this.props.dispatch({
            type: 'community_keywordStat_autoReplyKeyword/query',
            payload: {
                params: params,
            },
        })
        this.setState({
            sortedInfo: sortedInfo
        })
    }

    handleChangeSize = (current, size) => {
        let params = {...this.props.community_keywordStat_autoReplyKeyword.params}
        params.limit = size
        this.props.dispatch({
            type: 'community_keywordStat_autoReplyKeyword/setParams',
            payload: {params: params},
        })
        this.goPage(1)
    }

    handleSearch = () => {
        this.goPage(1)
    }

    resetSearch = () => {
        this.resetParams()
        setTimeout(() => {
            this.handleSearch()
            this.resetSortedInfo()
        }, 0)
    }

    resetSortedInfo = () => {
        this.setState({
            sortedInfo: null
        })
    }

    resetParams = () => {
        this.props.dispatch({
            type: 'community_keywordStat_autoReplyKeyword/resetParams',
        })
        setTimeout(() => {
            const {params} = this.props.community_keywordStat_autoReplyKeyword
            this.keywordMgtTime.setDate(moment(params.start_time, DateFormat) || null, moment(params.end_time, DateFormat) || null)
        }, 500)
    }

    render() {
        const {params, list, total, current} = this.props.community_keywordStat_autoReplyKeyword
        const {queryLoading} = this.props
        let {sortedInfo} = this.state
        sortedInfo = sortedInfo || {}

        const formItemLayout = {
            labelCol: {span: 6},
            wrapperCol: {span: 16},
        }
        const timeFormItemLayout = {
            labelCol: {span: 6},
            wrapperCol: {span: 18},
        }

        const columns = [
            {
                title: '关键词',
                dataIndex: 'keyword',
                className: styles.keywordColumn,
                render: (text) => {
                    return <>
                        {
                            text ? <EllipsisPopover content={text} lines={2} ellipsisClassName={styles.ellipsisOver}/> : ''
                        }
                    </>
                }
            },
            {
                title: '触发群数',
                dataIndex: 'chatroom_count',
                className: styles.column,
                sorter: true,
                sortOrder: sortedInfo.columnKey === 'chatroom_count' && sortedInfo.order,
                align: 'center',
            },
            {
                title: '触发次数',
                dataIndex: 'trigger_count',
                className: styles.column,
                sorter: true,
                sortOrder: sortedInfo.columnKey === 'trigger_count' && sortedInfo.order,
                align: 'center',
            },
            {
                title: '平均触发数（群）',
                dataIndex: 'average_chatroom_trigger_count',
                className: styles.column,
                sorter: true,
                sortOrder: sortedInfo.columnKey === 'average_chatroom_trigger_count' && sortedInfo.order,
                align: 'center',
            },
            {
                title: '触发成员数',
                dataIndex: 'member_count',
                className: styles.column,
                sorter: true,
                sortOrder: sortedInfo.columnKey === 'member_count' && sortedInfo.order,
                align: 'center',
            },
            {
                title: '平均触发数（成员）',
                dataIndex: 'average_member_trigger_count',
                className: styles.column,
                sorter: true,
                sortOrder: sortedInfo.columnKey === 'average_member_trigger_count' && sortedInfo.order,
                align: 'center',
            },
        ]

        return (
            <div className={styles.autoReplyKeyword}>
                <Alert className={styles.alert}
                    type="info"
                    showIcon
                    message="统计数据保留近90天的关键词触发数据"
                />
                <div className={styles.searchWrap}>
                    <Row gutter={20}>
                        <Col span={12}>
                            <FormItem {...formItemLayout} label="搜索：" colon={false}>
                                <Search placeholder="输入关键词搜索" value={params.query}
                                    onChange={(e)=>{this.handleChange('query', e)}}
                                    onSearch={this.handleSearch}
                                    maxLength={20}
                                />
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem {...timeFormItemLayout} label="日期：" colon={false}>
                                <DateRange
                                    {...this.props}
                                    ref={(ref) => {this.keywordMgtTime = ref}}
                                    startValue={params.start_time ? moment(params.start_time, DateFormat) : ''}
                                    endValue={params.end_time ? moment(params.end_time, DateFormat) : ''}
                                    startPlaceholder="不限"
                                    endPlaceholder="不限"
                                    onChange={this.handleChangeDate}
                                    maxRangeDays={90}
                                    maxToday={true}
                                />
                            </FormItem>
                        </Col>
                    </Row>
                    <Row  className={styles.operateBtn} gutter={20}>
                        <Col span={12}>
                            <Col offset={6}>
                                <Button type="primary" icon="search" onClick={this.handleSearch}>搜索</Button>
                                <Button onClick={this.resetSearch}>重置</Button>
                            </Col>
                        </Col>
                    </Row>
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
                </div>
                {
                    list.length ? <Pagination
                        className="ant-table-pagination"
                        total={total}
                        current={current}
                        showQuickJumper={true}
                        pageSizeOptions={pageSizeOptions}
                        showTotal={total => `共${total}条`}
                        pageSize={params.limit}
                        showSizeChanger={true}
                        onShowSizeChange={this.handleChangeSize}
                        onChange={this.goPage}
                    /> : null
                }
            </div>
        )
    }
}
