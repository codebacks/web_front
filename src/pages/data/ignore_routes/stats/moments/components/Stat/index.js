/**
 * @description 朋友圈统计
 * @author liyan
 * @date 2018/12/28
 */
import React, {Fragment, Component} from 'react'
import {Table, Button, Form, Radio, notification, Row, Col, Spin, Popover, Icon} from 'antd'
import {connect} from 'dva'
import moment from 'moment'
import numeral from 'numeral'
import createG2 from 'g2-react'
import 'moment/locale/zh-cn'
import config from 'data/common/config'
import DateRange from 'components/DateRange'
import DepartmentSelect from 'components/business/DepartmentSelect'
import UserSelect from 'components/business/UserSelect'
import WeChatSelectSingle from 'components/business/WeChatSelectSingle'
import ExportExcel from 'components/business/ExportExcel'
import styles from './index.scss'

moment.locale('zh-cn')

const FormItem = Form.Item
const RadioButton = Radio.Button
const RadioGroup = Radio.Group

const {DateFormat, pageSizeOptions} = config

const Line = createG2(chart => {
    chart.line().position('时间*数量').color('类型', (cValue)=>{
        if (cValue === '发圈数') {
            return '#1890FF'
        } else if (cValue === '点赞数') {
            return '#52C21A'
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

@connect(({ base, data_stat_moments, loading}) => ({
    base,
    data_stat_moments,
    statLoading: loading.effects['data_stat_moments/momentsStat'],
    summaryLoading: loading.effects['data_stat_moments/momentsSummary'],
    statByDateLoading: loading.effects['data_stat_moments/momentsStatByDate'],
    taskIdLoading: loading.effects['data_stat_moments/exportTask']
}))
export default class extends Component {
    constructor(props) {
        super(props)
        this.state = {
            filterValue: 'moments',
            filterName: '发圈数',
            height: 350,
            plotCfg: {
                margin: [10, 100, 80, 120],
            },
        }
    }


    componentDidMount() {
        this.loadData()
    }

    componentWillUnmount() {
        this.resetParams()
    }

    resetParams = () => {
        this.props.dispatch({
            type: 'data_stat_moments/resetParams'
        })
        this.props.dispatch({
            type: 'data_stat_moments/resetRange',
        })
    }

    loadData = () => {
        this.loadSummary()
        this.loadStatByDate()
        this.loadStat()
    }

    loadSummary = () => {
        let params = {...this.props.data_stat_moments.params}
        for(let prop in params) {
            if(prop === 'offset' || prop === 'limit') {
                delete params[prop]
            }
        }
        this.props.dispatch({
            type: 'data_stat_moments/momentsSummary',
            payload: params,
        })
    }

    loadStat = () => {
        this.goPage(1)
    }

    loadStatByDate = () => {
        let params = {...this.props.data_stat_moments.params}
        for(let prop in params) {
            if(prop === 'offset' || prop === 'limit') {
                delete params[prop]
            }
        }
        this.props.dispatch({
            type: 'data_stat_moments/momentsStatByDate',
            payload: params,
        })
    }

    handleChangeDate = (startValue, endValue) => {
        let params = {...this.props.data_stat_moments.params}
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
            type: 'data_stat_moments/setParams',
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
            type: 'data_stat_moments/setProperty',
            payload: {range: range}
        })
    }
    handleSearch = () => {
        let { params } = this.props.data_stat_moments
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
        this.loadData()
    }

    handleChangeFilter = (e) => {
        let val = e.target.value
        let stat = {}
        stat.filterValue = val
        if (val === 'moments') {
            stat.filterName = '发圈数'
        } else if (val === 'likes') {
            stat.filterName = '点赞数'
        } else if (val === 'comments') {
            stat.filterName = '评论数'
        }
        this.setState({...stat})
    }

    handleChange(key, e) {
        let val = ''
        if (e && e.target) {
            val = e.target.value
        } else {
            val = e
        }
        let params = {...this.props.data_stat_moments.params}
        params[key] = val
        if (key === 'department_id') {
            params['user_id'] = undefined
            params['uin'] = undefined
        } else if (key === 'user_id') {
            params['uin'] = undefined
        }
        this.props.dispatch({
            type: 'data_stat_moments/setParams',
            payload: {params: params},
        })
    }

    handleChangeTimeRange = (e) => {
        const value = e.target.value
        switch(value) {
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
        this.props.dispatch({
            type: 'data_stat_moments/setProperty',
            payload: {range: value}
        })
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
            type: 'data_stat_moments/setParams',
            payload: {
                params: {
                    start_time: startTime,
                    end_time: endTime
                }
            }
        })
        const endDay = days === 1 ? moment().subtract(days, 'days') : moment()
        this.refs.momentTime.setDate(moment().subtract(days, 'days'), endDay)
    }

    handleChangeSize = (current, size) => {
        let params = {...this.props.data_stat_moments.params}
        params.limit = size
        this.props.dispatch({
            type: 'data_stat_moments/setParams',
            payload: {params: params},
        })
        this.goPage(1)
    }

    goPage = (page) => {
        this.props.dispatch({
            type: 'data_stat_moments/momentsStat',
            payload: {page: page}
        })
    }

    resetSearch = () => {
        this.resetParams()
        setTimeout(() => {
            this.handleSearch()
        }, 0)
    }


    getExportTaskId = (callback) => {
        let params = {...this.props.data_stat_moments.searchParams}
        params = JSON.parse(JSON.stringify(params, (key, value) => {
            if (key === 'limit' || key === 'offset') {
                return undefined
            } else {
                return value
            }
        }))
        this.props.dispatch({
            type: 'data_stat_moments/exportTask',
            payload: {
                params: params
            },
            callback: (data) => {
                callback && callback(data)
            }
        })
    }

    exportExcel = (taskId, callback) => {
        this.props.dispatch({
            type: 'data_stat_moments/exportExcel',
            payload: {
                taskId: taskId
            },
            callback: (res) => {
                callback && callback(res)
            }
        })
    }

    render() {
        const columns = [{
            title: '微信昵称',
            dataIndex: 'nickname',
            key: 'nickname',
            className: styles.firstColumn,
        },
        {
            title: '备注',
            dataIndex: 'remark',
            key: 'remark',
        },
        {
            title: '微信号',
            dataIndex: 'alias',
            key: 'alias',
            render: (text, record, index) => {
                return text || record.username
            }
        },
        {
            title: () => { return <span>发圈数<Popover placement="right"
                content="当前微信号，在筛选时间内，发圈成功的条数"
                title={null}>
                <Icon className={styles.questionCircle} type="question-circle-o"/>
            </Popover></span>},
            dataIndex: 'moments',
        },
        {
            title: () => { return <span>好友数<Popover placement="right"
                content="当前微信号，状态正常的微信好友数"
                title={null}>
                <Icon className={styles.questionCircle} type="question-circle-o"/>
            </Popover></span> },
            dataIndex: 'friend_count',
        },
        {
            title: () => { return <span>点赞数<Popover placement="right"
                content="当前微信号，在筛选时间内，收获的点赞数"
                title={null}>
                <Icon className={styles.questionCircle} type="question-circle-o"/>
            </Popover></span> },
            dataIndex: 'likes',
        },
        {
            title: () => { return <span>评论数<Popover placement="right"
                content="当前微信号，在筛选时间内，收获的评论数"
                title={null}>
                <Icon className={styles.questionCircle} type="question-circle-o"/>
            </Popover></span> },
            dataIndex: 'comments',
        },
        {
            title: () => { return <span>平均点赞数<Popover placement="right"
                content="平均点赞数 = 点赞数/发圈数"
                title={null}>
                <Icon className={styles.questionCircle} type="question-circle-o"/>
            </Popover></span> },
            dataIndex: 'like_avg',
            render: (text, record) => {
                if (record.moments && record.likes) {
                    const avg = record.likes / record.moments
                    return numeral(avg).format('0.0')
                }
                return 0
            }
        },
        {
            title: () => { return <span>平均评论数<Popover placement="right"
                content="平均评论数 = 评论数/发圈数"
                title={null}>
                <Icon className={styles.questionCircle} type="question-circle-o"/>
            </Popover></span> },
            dataIndex: 'comment_avg',
            render: (text, record) => {
                if (record.moments && record.comments) {
                    const avg = record.comments / record.moments
                    return numeral(avg).format('0.0')
                }
                return 0
            }
        },
        ]

        const formItemLayout = {
            labelCol: {span: 8},
            wrapperCol: {span: 16},
        }
        const timeFormItemLayout = {
            labelCol: {span: 4},
            wrapperCol: {span: 20},
        }

        const {summaryLoading, statByDateLoading, statLoading, taskIdLoading} = this.props
        const {params, list, current, total, line, summary, range } = this.props.data_stat_moments

        const getList = () => {
            return line.filter((item) => {
                return item['类型'] === this.state.filterName
            })
        }

        return (
            <div className={styles.momentsStat}>
                <div className={styles.searchWrap}>
                    <Row gutter={20}>
                        <Col span={7}>
                            <FormItem {...formItemLayout} label="所属部门：" colon={false}>
                                <DepartmentSelect
                                    departmentId={params.department_id}
                                    onChange={(value)=>{this.handleChange('department_id', value)}}
                                />
                            </FormItem>
                        </Col>
                        <Col span={7}>
                            <FormItem {...formItemLayout} label="所属员工：" colon={false}>
                                <UserSelect
                                    departmentId={params.department_id}
                                    userId={params.user_id}
                                    onChange={(value)=>{this.handleChange('user_id', value)}}
                                />
                            </FormItem>
                        </Col>
                        <Col span={7}>
                            <FormItem {...formItemLayout} label="所属微信：" colon={false}>
                                <WeChatSelectSingle
                                    departmentId={params.department_id}
                                    userId={params.user_id}
                                    uin={params.uin}
                                    onChange={(value)=>{this.handleChange('uin', value)}}
                                />
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={20}>
                        <Col span={11} style={{marginLeft: '19px'}}>
                            <FormItem {...timeFormItemLayout} label="日期：" colon={false}>
                                <DateRange {...this.props}
                                    ref="momentTime"
                                    startValue={params.start_time ? moment(params.start_time, DateFormat) : ''}
                                    endValue={params.end_time ? moment(params.end_time, DateFormat) : ''}
                                    onChange={this.handleChangeDate}
                                    maxRangeDays={60}
                                    maxToday={true}/>
                            </FormItem>
                        </Col>
                        <Radio.Group className={styles.range}
                            value={range}
                            onChange={this.handleChangeTimeRange}
                        >
                            <Radio.Button value="yesterday" className={styles.item}>昨日</Radio.Button>
                            <Radio.Button value="week" className={styles.item}>近7日</Radio.Button>
                            <Radio.Button value="month" className={styles.item}>近30日</Radio.Button>
                        </Radio.Group>
                        <div className={styles.searchBtn}>
                            <Button type="primary" icon="search" onClick={this.handleSearch}>查询</Button>
                        </div>
                    </Row>
                </div>
                <Spin spinning={summaryLoading}>
                    <div className={styles.summary}>
                        { summary.length ? <Fragment>
                            <div className={styles.item}>
                                <p>{summary[0].moments || 0}</p>
                                <h3>发圈数</h3>
                            </div>
                            <div className={styles.item}>
                                <p>{summary[0].likes || 0}</p>
                                <h3>点赞数</h3>
                            </div>
                            <div className={styles.item}>
                                <p>{summary[0].comments || 0}</p>
                                <h3>评论数</h3>
                            </div>
                        </Fragment> : ''}
                    </div>
                </Spin>

                <div className={styles.lineWrap}>
                    <div className={styles.filterType}>
                        <RadioGroup value={this.state.filterValue} onChange={this.handleChangeFilter}>
                            <RadioButton value="moments">发圈数</RadioButton>
                            <RadioButton value="likes">点赞数</RadioButton>
                            <RadioButton value="comments">评论数</RadioButton>
                        </RadioGroup>
                    </div>
                    <div className={styles.lineChat}>
                        <Spin spinning={statByDateLoading}>
                            <Line
                                data={getList()}
                                width={window.innerWidth - 300}
                                height={this.state.height}
                                plotCfg={this.state.plotCfg}
                                label={null}
                            />
                        </Spin>
                    </div>
                </div>
                <ExportExcel name={'朋友圈统计'}
                    taskIdLoading={taskIdLoading}
                    taskFunc={this.getExportTaskId}
                    exportFunc={this.exportExcel}
                />
                <div className={styles.tableWrap}>
                    <Table columns={columns}
                        dataSource={list}
                        rowKey={(record, index) => index}
                        loading={statLoading}
                        pagination={
                            list.length ? {
                                size: 'middle',
                                total: total,
                                current: current,
                                showQuickJumper: true,
                                pageSizeOptions: pageSizeOptions,
                                showTotal: total => `共${total}条`,
                                pageSize: params.limit,
                                showSizeChanger: true,
                                onShowSizeChange: this.handleChangeSize,
                                onChange: this.goPage,
                            } : false
                        }
                    />
                </div>
            </div>
        )
    }
}

