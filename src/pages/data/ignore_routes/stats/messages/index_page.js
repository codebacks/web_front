'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 16/12/27
 */
import React from 'react'
import {Card, Table, notification, Row, Col, Form, Button, Radio, Popover, Icon, Spin} from 'antd'
import {connect} from 'dva'
import moment from 'moment'
import 'moment/locale/zh-cn'
import createG2 from 'g2-react'
import ContentHeader from 'components/business/ContentHeader'
import documentTitleDecorator from 'hoc/documentTitle'
import DateRange from 'components/DateRange'
import config from 'data/common/config'
import DepartmentSelect from 'components/business/DepartmentSelect'
import UserSelect from 'components/business/UserSelect'
import WeChatSelectSingle from 'components/business/WeChatSelectSingle'
import ExportExcel from 'components/business/ExportExcel'

import styles from './index.scss'

moment.locale('zh-cn')
const FormItem = Form.Item

const {DateFormat} = config
const Line = createG2(chart => {
    chart.line().position('时间*数量').color('类型', ['#DD6666', '#00C853', '#2196F3', '#FFEB3B']).shape('spline').size(2)
    chart.axis('时间', {
        title: {
            fontSize: '12',
            textAlign: 'center',
            textBaseline: 'top'
        }, // 坐标轴标题设置，如果值为 null，则不显示标题
    })
    chart.render()
    // let timer = 0, flag = true
    // window.addEventListener('resize', () => {
    // 	flag = true;
    // 	timer = setTimeout(() => {
    // 		if (flag) {
    // 			chart.changeSize(window.innerWidth - 300, 350);
    // 		}
    // 		flag = false;
    // 		clearTimeout(timer);
    // 	}, 500);
    // });
})

@connect(({ base, data_stat_message, loading}) => ({
    base, data_stat_message,
    listLoading: loading.effects['data_stat_message/query'],
    taskIdLoading: loading.effects['data_stat_message/exportTask']
}))
@documentTitleDecorator()
export default class extends React.Component {
    constructor(props) {
        super()
        this.state = {
            width: 1100,
            height: 350,
            plotCfg: {
                margin: [10, 100, 80, 120],
                title: {
                    offset: 60
                },
                tooltip: {
                    showTitle: false
                }
            },
            range: 'week',
        }
    }
    componentDidMount() {
        this.loadMessage()
    }

    componentWillUnmount() {
        this.resetParams()
    }

    resetParams = () => {
        this.props.dispatch({
            type: 'data_stat_message/resetParams'
        })
    }

    loadMessage = () => {
        let params = {...this.props.data_stat_message.params}
        if (params.start_time && params.end_time) {
            this.props.dispatch({
                type: 'data_stat_message/query',
                payload: {params: {}}
            })
        }
    };

    handleChangeDate = (startValue, endValue) => {
        let params = {...this.props.data_stat_message.params}
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
            type: 'data_stat_message/setParams',
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
        this.setState({
            range: range
        })
    }

    handleChange(key, e) {
        let val = ''
        if (key === 'query') {
            val = e.target.value
        } else {
            val = e
        }
        let params = {...this.props.data_stat_message.params}
        params[key] = val
        if (key === 'department_id') {
            params['user_id'] = undefined
            params['uin'] = undefined
        } else if (key === 'user_id') {
            params['uin'] = undefined
        }
        this.props.dispatch({
            type: 'data_stat_message/setParams',
            payload: {params: params},
        })
    }

    handleSearch = () => {
        let params = {...this.props.data_stat_message.params}
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
        this.props.dispatch({
            type: 'data_stat_message/query',
            payload: {}
        })
    };

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
        this.setState({
            range: value
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
            type: 'data_stat_message/setParams',
            payload: {
                params: {
                    start_time: startTime,
                    end_time: endTime
                }
            }
        })
        const endDay = days === 1 ? moment().subtract(days, 'days') : moment()
        this.refs.messageTime.setDate(moment().subtract(days, 'days'), endDay)
    }

    getExportTaskId = (callback) => {
        let params = {...this.props.data_stat_message.searchParams}
        this.props.dispatch({
            type: 'data_stat_message/exportTask',
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
            type: 'data_stat_message/exportExcel',
            payload: {
                taskId: taskId
            },
            callback: (res) => {
                callback && callback(res)
            }
        })
    }

    render() {
        const {list, total, params, original} = this.props.data_stat_message
        const {taskIdLoading, listLoading} = this.props
        const {range} = this.state
        const columns = [{
            title: '时间',
            dataIndex: 'day',
            key: 'day',
            className: styles.firstColumn,
        }, {
            title: ()=>{
                return <span>发送好友数<Popover placement="right"
                    content="当天发送私聊消息触达的好友人数"
                    title={null}>
                    <Icon className={styles.questionCircle} type="question-circle-o"/>
                </Popover></span>
            },
            dataIndex: 'send_friend_count',
            key: 'send_friend_count',
        }, {
            title: ()=>{
                return <span>接收好友数<Popover placement="right"
                    content="当天接收私聊消息来自的好友人数"
                    title={null}>
                    <Icon className={styles.questionCircle} type="question-circle-o"/>
                </Popover></span>
            },
            dataIndex: 'receive_friend_count',
            key: 'receive_friend_count',
        }, {
            title: ()=> {
                return <span>收发好友比例<Popover placement="right"
                    content={<div>接收好友数/发送好友数*100%</div>}
                    title={null}>
                    <Icon className={styles.questionCircle} type="question-circle-o"/>
                </Popover></span>
            },
            dataIndex: 'r2',
            key: 'r2',
            render: (text, record) => (
                <span>{getPercent(record.receive_friend_count, record.send_friend_count)}</span>
            ),
        }, {
            title: ()=>{
                return <span>发送消息<Popover placement="right"
                    content="当天发送微信私聊消息的条数"
                    title={null}>
                    <Icon className={styles.questionCircle} type="question-circle-o"/>
                </Popover></span>
            },
            dataIndex: 'send_count',
            key: 'r3',
        }, {
            title: ()=>{
                return <span>接收消息<Popover placement="right"
                    content="当天接收微信私聊消息的条数"
                    title={null}>
                    <Icon className={styles.questionCircle} type="question-circle-o"/>
                </Popover></span>
            },
            dataIndex: 'receive_count',
            key: 'r4',
        }, {
            title: ()=>{
                return <span>收发消息比例<Popover placement="right"
                    content={<div>接收消息数/发送消息数*100%</div>}
                    title={null}>
                    <Icon className={styles.questionCircle} type="question-circle-o"/>
                </Popover></span>
            },
            dataIndex: 'r5',
            key: 'r5',
            render: (text, record) => (
                <span>{getPercent(record.receive_count, record.send_count)}</span>
            ),
        }]

        const getPercent = (num, total) => {
            return total <= 0 ? '0%' : (Math.round(num / total * 10000) / 100.00 + "%")
        }

        const getTotal = () => {
            return (
                <div className={styles.total}>
                    <div className={styles.item}>
                        <Card bodyStyle={{padding: 0}}>
                            <h3>发送总人数</h3>
                            <div className={styles.num}>{total.send_friend_count}</div>
                        </Card>
                    </div>
                    <div className={styles.item}>
                        <Card bodyStyle={{padding: 0}}>
                            <h3>接收总人数</h3>
                            <div className={styles.num}>{total.receive_friend_count}</div>
                        </Card>
                    </div>
                    <div className={styles.item}>
                        <Card bodyStyle={{padding: 0}}>
                            <h3>收发人数比例</h3>
                            <div
                                className={styles.num}>{getPercent(total.receive_friend_count, total.send_friend_count)}</div>
                        </Card>
                    </div>
                    <div className={styles.item}>
                        <Card bodyStyle={{padding: 0}}>
                            <h3>发送总消息数</h3>
                            <div className={styles.num}>{total.send_count}</div>
                        </Card>
                    </div>
                    <div className={styles.item}>
                        <Card bodyStyle={{padding: 0}}>
                            <h3>接收总消息数</h3>
                            <div className={styles.num}>{total.receive_count}</div>
                        </Card>
                    </div>
                    <div className={styles.item}>
                        <Card bodyStyle={{padding: 0}}>
                            <h3>收发总消息比例</h3>
                            <div className={styles.num}>{getPercent(total.receive_count, total.send_count)}</div>
                        </Card>
                    </div>
                </div>)
        }

        let _original = []
        if (original && original.length) {
            _original = Array.from(original)
            _original.reverse()
        }
        const formItemLayout = {
            labelCol: {span: 8},
            wrapperCol: {span: 16},
        }
        const timeFormatLayout = {
            labelCol: {span: 4},
            wrapperCol: {span: 20},
        }
        return (
            <div className={styles.messages}>
                <ContentHeader
                    contentType={'title'}
                    content={{
                        title: this.props.documentTitle,
                    }}
                    help={{
                        url: 'http://newhelp.51zan.cn/manual/content/%E6%95%B0%E6%8D%AE%E4%B8%AD%E5%BF%83/%E5%BE%AE%E4%BF%A1%E7%BB%9F%E8%AE%A1.md'
                    }}
                />
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
                            <FormItem {...timeFormatLayout} label="日期：" colon={false}>
                                <DateRange {...this.props}
                                    ref="messageTime"
                                    startValue={params.start_time ? moment(params.start_time, DateFormat) : ''}
                                    endValue={params.end_time ? moment(params.end_time, DateFormat) : ''}
                                    onChange={this.handleChangeDate}
                                    maxToday={true}
                                    maxRangeDays={60}
                                />
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
                <div className={styles.totalWrap}>
                    {getTotal()}
                </div>
                <div className={styles.lineWrap}>
                    <div className={styles.lineChat}>
                        <Spin spinning={listLoading}>
                            <Line
                                data={list}
                                width={window.innerWidth - 300}
                                height={this.state.height}
                                plotCfg={this.state.plotCfg}
                            />
                        </Spin>
                    </div>
                </div>
                <ExportExcel name={'私聊统计'}
                    taskIdLoading={taskIdLoading}
                    taskFunc={this.getExportTaskId}
                    exportFunc={this.exportExcel}
                />
                <div className={styles.tableWrap}>
                    <Table dataSource={_original}
                        columns={columns}
                        size="middle"
                        loading={listLoading}
                        pagination={false}
                        rowKey={(record) => record.day}/>
                </div>
            </div>
        )
    }
}
