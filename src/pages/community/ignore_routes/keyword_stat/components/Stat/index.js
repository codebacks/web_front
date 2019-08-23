/** @description 关键词统计
 */
import React, {Component} from 'react'
import {Row, Col, Form, Input, Button, Table, Pagination, Spin, Alert, notification, message} from 'antd'
import {connect} from 'dva'
import Link from 'umi/link'
import moment from 'moment'
import DateRange from 'components/DateRange'
import WordCloud from 'community/components/Charts/WordCloud'
import config from 'community/common/config'
import styles from './index.less'
import helper from 'utils/helper'

const FormItem = Form.Item
const Search = Input.Search
const {DateFormat, DateTimeFormat, pageSizeOptions} = config

@connect(({base, community_keyword_stat, loading}) => ({
    base, community_keyword_stat,
    listLoading: loading.effects['community_keyword_stat/list'],
    summaryLoading: loading.effects['community_keyword_stat/summary'],
}))
export default class Stat extends Component {
    constructor(props) {
        super(props)
        this.state = {
            summary: {},
            sortedInfo: null,
        }
    }

    componentDidMount() {
        this._isMounted = true
        this.goPage()
        this.loadSummary()
    }

    componentWillUnmount() {
        this._isMounted = false
    }

    loadSummary = () => {
        let params = {...this.props.community_keyword_stat.params}
        for (let prop in params) {
            if (prop !== 'key' && prop !== 'start_time' && prop !== 'end_time') {
                delete params[prop]
            }
        }
        this.props.dispatch({
            type: 'community_keyword_stat/summary',
            payload: {
                params: params
            },
            callback: (data) => {
                if (this._isMounted) {
                    this.setState({
                        summary: data
                    })
                }
            }
        })
    }

    handleChange = (key, e) => {
        let val = ''
        if (e && e.target) {
            val = e.target.value
        } else {
            val = e
        }
        if (key === 'key') {
            if (helper.isEmojiCharacter(val)) {
                val = helper.filterEmojiCharacter(val)
                message.warning('不支持输入表情符号')
            }
        }
        let params = {...this.props.community_keyword_stat.params}
        params[key] = val
        this.props.dispatch({
            type: 'community_keyword_stat/setParams',
            payload: {params: params},
        })
    }

    handleChangeDate = (startValue, endValue) => {
        let params = {...this.props.community_keyword_stat.params}
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
            type: 'community_keyword_stat/setParams',
            payload: {params: params}
        })
    };

    goPage = (page) => {
        this.props.dispatch({
            type: 'community_keyword_stat/list',
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
        let params = {...this.props.community_keyword_stat.params}
        if (order === 'descend') {
            params['order_by'] = `-${field}`
        } else {
            params['order_by'] = field
        }
        this.props.dispatch({
            type: 'community_keyword_stat/list',
            payload: {
                params: params,
            },
        })
        this.setState({
            sortedInfo: sortedInfo
        })
    }

    handleChangeSize = (current, size) => {
        let params = {...this.props.community_keyword_stat.params}
        params.limit = size
        this.props.dispatch({
            type: 'community_keyword_stat/setParams',
            payload: {params: params},
        })
        this.goPage(1)
    }

    handleSearch = () => {
        const {params} = this.props.community_keyword_stat
        if (params.start_time || params.end_time) {
            if (!params.start_time) {
                notification.error({
                    message: '错误提示',
                    description: '开始时间不能为空'
                })
                return false
            }
            if (!params.end_time) {
                notification.error({
                    message: '错误提示',
                    description: '截止时间不能为空'
                })
                return false
            }
        }
        this.loadSummary()
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
            type: 'community_keyword_stat/resetParams',
        })
        this.keywordStatTime.setDate(null, null)
    }

    parseData = (data=[]) => {
        return data.map((v)=>{
            return {
                name: v.keyword,
                value: v.total_count,
            }
        })
    }

    render() {
        const {params, list, total, current} = this.props.community_keyword_stat
        const {listLoading, summaryLoading} = this.props
        let {summary, sortedInfo} = this.state
        sortedInfo = sortedInfo || {}

        const sorter = !(params.start_time || params.end_time)

        const formItemLayout = {
            labelCol: {span: 8},
            wrapperCol: {span: 16},
        }

        const timeFormItemLayout = {
            labelCol: {span: 4},
            wrapperCol: {span: 20},
        }

        const orderColumn = [
            {
                title: '创建时间',
                dataIndex: 'create_at',
                sorter: sorter,
                sortOrder: sortedInfo.columnKey === 'create_at' && sortedInfo.order,
                render: (timestamp) => {
                    if(timestamp) {
                        return moment(parseInt(timestamp, 10) * 1000).format(DateTimeFormat)
                    }
                }
            },
            {
                title: '出现总次数',
                dataIndex: 'total_count',
                sorter: sorter,
                sortOrder: sortedInfo.columnKey === 'total_count' && sortedInfo.order,
            },
            {
                title: '发送用户数',
                dataIndex: 'sender_count',
                sorter: sorter,
                sortOrder: sortedInfo.columnKey === 'sender_count' && sortedInfo.order,
            },
            {
                title: '出现群总数',
                dataIndex: 'group_count',
                sorter: sorter,
                sortOrder: sortedInfo.columnKey === 'group_count' && sortedInfo.order,
            },
        ]

        const columns = [
            {
                title: '关键词',
                dataIndex: 'keyword',
                className: styles.contentColumn
            },
            ...orderColumn,
            {
                title: '操作',
                dataIndex: 'operation',
                render: (text, record) => {
                    if(record.total_count) {
                        return <Link to={`/community/keyword_stat/detail/${record.id}`}>明细</Link>
                    }
                    return <span className={styles.disabled}>明细</span>
                }
            }
        ]

        const data = this.parseData(summary.statistics)

        const height = 220

        const option = {
            seriesName: '关键词',
            seriesData: data,
            seriesItem: {
                textStyle: {
                    normal: {
                        color: function () {
                            return '#4391FF'
                        }
                    },
                    emphasis: {
                        shadowBlur: 8,
                        shadowColor: '#333'
                    }
                },
                left: 'center',
                top: 'center',
                width: '99%',
                height: '99%',
            }
        }

        return (
            <div className={styles.wrapper}>
                <Alert className={styles.alert}
                    type="info"
                    showIcon
                    message={<div>仅统计工作群的群聊数据，最多可设50个关键词，每隔3小时统计一次。为保障统计数据的准确性，请勿随意转让群主。</div>}
                />
                <div className={styles.searchWrap}>
                    <Row gutter={20}>
                        <Col span={7}>
                            <FormItem {...formItemLayout} label="搜索：" colon={false}>
                                <Search placeholder="输入关键字搜索" value={params.key}
                                    onChange={(e)=>{this.handleChange('key', e)}}
                                    onSearch={this.handleSearch}
                                    maxLength={20}
                                />
                            </FormItem>
                        </Col>
                        <Col span={10}>
                            <FormItem {...timeFormItemLayout} label="日期：" colon={false}>
                                <DateRange
                                    {...this.props}
                                    ref={(ref) => {
                                        this.keywordStatTime = ref
                                    }}
                                    startValue={params.start_time ? moment(params.start_time, DateFormat) : ''}
                                    endValue={params.end_time ? moment(params.end_time, DateFormat) : ''}
                                    startPlaceholder="不限"
                                    endPlaceholder="不限"
                                    onChange={this.handleChangeDate}
                                    maxRangeDays={60}
                                    maxToday={true}
                                />
                            </FormItem>
                        </Col>
                        <div className={styles.btns}>
                            <Button type="primary" icon="search" onClick={this.handleSearch}>搜索</Button>
                            <Button onClick={this.resetSearch}>重置</Button>
                        </div>
                    </Row>
                </div>
                <Spin spinning={!!summaryLoading}>
                    <Row className={styles.wordCloudWrap}>
                        <h3 className={styles.title}>关键词展示</h3>
                        <WordCloud option={option} height={height}/>
                    </Row>
                </Spin>
                <div className={styles.tableWrap}>
                    <Table
                        columns={columns}
                        dataSource={list}
                        size="middle"
                        loading={listLoading}
                        rowKey={record => record.id}
                        pagination={false}
                        onChange={this.handleTableChange}
                    />
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
            </div>
        )
    }
}
