import React, {Component} from 'react'
import {Row, Col, Form, Button, Table, Radio, Spin, notification} from 'antd'
import {connect} from 'dva'
import createG2 from 'g2-react'
import moment from 'moment'
import ContentHeader from 'components/business/ContentHeader'
import documentTitleDecorator from 'hoc/documentTitle'
import DateRange from 'components/DateRange'
import config from 'community/common/config'
import styles from './index.less'

const FormItem = Form.Item
const RadioGroup = Radio.Group
const RadioButton = Radio.Button
const {DateFormat} = config

const Line = createG2(chart => {
    chart.line().position('时间*数量').color('类型', (cValue)=>{
        if (cValue === '出现次数') {
            return '#52C21A'
        } else if (cValue === '发送用户数') {
            return '#1890FF'
        } else {
            return '#FACC14'
        }
    }).shape('spline').size(2)
    chart.axis('时间', {
        title: {
            fontSize: '12',
            textAlign: 'center',
            textBaseline: 'top'
        },
    })
    chart.render()
})

@connect(({base, community_keyword_detail, loading}) => ({
    base, community_keyword_detail,
    listLoading: loading.effects['community_keyword_detail/list']
}))
@documentTitleDecorator()
export default class extends Component {
    constructor(props) {
        super(props)
        this.state = {
            height: 350,
            plotCfg: {
                margin: [10, 100, 80, 120],
            },
            filterValue: 'sender_count',
            filterName: '发送用户数',
            sortedInfo: null,
        }
    }

    componentDidMount() {
        this.query({})
    }

    componentWillUnmount() {
        this.resetParams()
    }

    handleChange = (key, e) => {
        let val = ''
        if (e && e.target) {
            val = e.target.value
        } else {
            val = e
        }
        let params = {...this.props.community_keyword_detail.params}
        params[key] = val
        this.props.dispatch({
            type: 'community_keyword_detail/setParams',
            payload: {params: params},
        })
    }

    handleTableChange = (pagination, filters, sorter) => {
        const sortedInfo = {
            order: sorter.order,
            columnKey: sorter.field,
        }
        this.setState({
            sortedInfo: sortedInfo
        })
    }

    resetSortedInfo = () => {
        this.setState({
            sortedInfo: null
        })
    }

    handleChangeDate = (startValue, endValue) => {
        let params = {...this.props.community_keyword_detail.params}
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
        this.setTimeRange(startValue, endValue)
        this.props.dispatch({
            type: 'community_keyword_detail/setParams',
            payload: {params: params}
        })
    }

    setTimeRange = (startValue, endValue) => {
        let range = ''
        if(moment().subtract(1, 'days').isSame(startValue, 'day')
            && moment().subtract(1, 'days').isSame(endValue, 'day')){
            range = 'yesterday'
        }else if(moment().subtract(6, 'days').isSame(startValue, 'day')
            && moment().isSame(endValue, 'day')){
            range = 'week'
        }else if(moment().subtract(29, 'days').isSame(startValue,'day')
            && moment().isSame(endValue, 'day')){
            range = 'month'
        }
        this.props.dispatch({
            type: 'community_keyword_detail/setProperty',
            payload: {
                range: range
            }
        })
    }

    handleSearch = () => {
        const {params} = this.props.community_keyword_detail
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
        this.query({})

    }

    query = (params) => {
        this.props.dispatch({
            type: 'community_keyword_detail/list',
            payload: {
                id: this.props.match.params.id,
                params: params
            },
        })
    }

    handleChangeFilter = (e) => {
        let val = e.target.value
        let stat = {}
        stat.filterValue = val
        if (val === 'show_count') {
            stat.filterName = '出现次数'
        } else if (val === 'sender_count') {
            stat.filterName = '发送用户数'
        } else if (val === 'group_count') {
            stat.filterName = '出现群数'
        }
        this.setState({...stat})
    }

    handleChangeTimeRange = (e) => {
        const value = e.target.value
        this.changeTimeRange(value)
        this.props.dispatch({
            type: 'community_keyword_detail/setProperty',
            payload: {
                range: value
            }
        })
    }

    changeTimeRange = (value) => {
        switch (value) {
            case 'yesterday':
                this.setTimeParams(1)
                break
            case 'week':
                this.setTimeParams(6)
                break
            case 'month':
                this.setTimeParams(29)
                break
            default:
        }
    }

    setTimeParams = (days) => {
        const startTime = moment().subtract(days, 'days').format(DateFormat) + ' 00:00:00'
        let endTime = ''
        if (days === 1) {
            endTime = moment().subtract(days, 'days').format(DateFormat) + ' 23:59:59'
        } else {
            endTime = moment().format(DateFormat) + ' 23:59:59'
        }
        this.props.dispatch({
            type: 'community_keyword_detail/setParams',
            payload: {
                params: {
                    start_time: startTime,
                    end_time: endTime
                }
            }
        })
        const endDay = days === 1 ? moment().subtract(days, 'days') : moment()
        this.dateRange.setDate(moment().subtract(days, 'days'), endDay)
    }

    resetSearch = () => {
        this.resetParams()
        setTimeout(() => {
            this.handleSearch()
            this.resetSortedInfo()
        }, 0)
    }

    resetParams = () => {
        this.props.dispatch({
            type: 'community_keyword_detail/resetParams',
        })
        this.props.dispatch({
            type: 'community_keyword_detail/resetRange',
        })
        this.changeTimeRange('week')
    }

    render() {
        const {params, original, keyword, list, range} = this.props.community_keyword_detail
        const {listLoading} = this.props
        const {filterValue, filterName} = this.state
        let sortedInfo = this.state.sortedInfo || {}

        const orderColumn = [
            {
                title: '出现次数',
                dataIndex: 'show_count',
                sortOrder: sortedInfo.columnKey === 'show_count' && sortedInfo.order,
                sorter: (a, b) => (a.show_count || 0) - (b.show_count || 0),
                render: (count) => {
                    return count || 0
                }
            },
            {
                title: '发送用户数',
                dataIndex: 'sender_count',
                sortOrder: sortedInfo.columnKey === 'sender_count' && sortedInfo.order,
                sorter: (a, b) => (a.sender_count || 0) - (b.sender_count || 0),
                render: (count) => {
                    return count || 0
                }
            },
            {
                title: '出现群数',
                dataIndex: 'group_count',
                sortOrder: sortedInfo.columnKey === 'group_count' && sortedInfo.order,
                sorter: (a, b) => (a.group_count || 0) - (b.group_count || 0),
                render: (count) => {
                    return count || 0
                }
            },
        ]

        const columns = [
            {
                title: '日期',
                dataIndex: 'day',
            },
            ...orderColumn
        ]

        const timeFormatLayout = {
            labelCol: {span: 6},
            wrapperCol: {span: 18},
        }

        const getCurrentList = () => {
            return list.filter((item) => {
                return item['类型'] === filterName
            })
        }

        let _original = []
        if (original && original.length) {
            _original = Array.from(original)
            _original.reverse()
        }

        return (
            <div className={styles.wrapper}>
                <ContentHeader
                    contentType={'breadcrumb'}
                    content={
                        [
                            {
                                name: '关键词统计',
                                path: '/community/keyword_stat',
                            },
                            {
                                name: '明细',
                            },
                        ]
                    }
                />
                <h3 className={styles.title}>
                    <span className={styles.label}>关键词：</span>{keyword}
                </h3>
                <div className={styles.searchWrap}>
                    <Row gutter={20}>
                        <Col span={8}>
                            <FormItem {...timeFormatLayout} label="日期：" colon={false}>
                                <DateRange {...this.props}
                                    ref={(ref)=>{ this.dateRange = ref}}
                                    startValue={params.start_time ? moment(params.start_time, DateFormat) : ''}
                                    endValue={params.end_time ? moment(params.end_time, DateFormat) : ''}
                                    onChange={this.handleChangeDate}
                                    maxToday={true}
                                    maxRangeDays={60}
                                />
                            </FormItem>
                        </Col>
                        <RadioGroup className={styles.range}
                            value={range}
                            onChange={this.handleChangeTimeRange}
                        >
                            <RadioButton value="yesterday" className={styles.item}>昨日</RadioButton>
                            <RadioButton value="week" className={styles.item}>近7日</RadioButton>
                            <RadioButton value="month" className={styles.item}>近30日</RadioButton>
                        </RadioGroup>
                    </Row>
                    <Row className={styles.operateBtn} gutter={20}>
                        <Col span={8}>
                            <Col offset={6}>
                                <Button type="primary" icon="search" onClick={this.handleSearch}>搜索</Button>
                                <Button onClick={this.resetSearch}>重置</Button>
                            </Col>
                        </Col>
                    </Row>
                </div>
                <div className={styles.lineWrap}>
                    <Spin spinning={!!listLoading}>
                        <div className={styles.filterType}>
                            <RadioGroup value={filterValue} onChange={this.handleChangeFilter}>
                                <RadioButton value="show_count">出现次数</RadioButton>
                                <RadioButton value="sender_count">发送用户数</RadioButton>
                                <RadioButton value="group_count">出现群数</RadioButton>
                            </RadioGroup>
                        </div>
                        <div className={styles.lineChat}>
                            <Line
                                data={getCurrentList()}
                                width={window.innerWidth - 300}
                                height={this.state.height}
                                plotCfg={this.state.plotCfg}
                            />
                        </div>
                    </Spin>
                </div>
                <div className={styles.tableWrap}>
                    <Table
                        columns={columns}
                        dataSource={_original}
                        size="middle"
                        loading={listLoading}
                        rowKey={(record, index) => index}
                        pagination={false}
                        onChange={this.handleTableChange}
                    />
                </div>
            </div>
        )
    }
}
