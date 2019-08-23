'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: liyan [randonely@gmail.com]
 * 创建日期: 18/11/13
 */
import React, {Component} from 'react'
import {Form, Table, Button, Radio, Row, Col, notification, Popover, Icon} from 'antd'
import {connect} from 'dva'
import 'moment/locale/zh-cn'
import moment from 'moment'
import config from 'data/common/config'
import styles from './index.scss'
import DateRange from 'components/DateRange'
import DepartmentSelect from 'components/business/DepartmentSelect'
import UserSelect from 'components/business/UserSelect'
import WeChatSelectSingle from 'components/business/WeChatSelectSingle'

moment.locale('zh-cn')

const FormItem = Form.Item

const {DateFormat, pageSizeOptions} = config

@connect(({data_stat_friends_pass, loading}) => ({
    data_stat_friends_pass,
    listLoading: loading.effects['data_stat_friends_pass/list']
}))
export default class Stat extends Component {
    constructor(props) {
        super(props)
        this.state = {
            range: 'week',
        }
    }
    componentDidMount() {
        this.handleSearch()
    }

    componentWillUnmount() {
        this.resetParams()
    }

    resetParams = () => {
        this.props.dispatch({
            type: 'data_stat_friends_pass/resetParams',
        })
    }

    handleChangeDate = (startValue, endValue) => {
        let params = {...this.props.data_stat_friends_pass.params}
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
            type: 'data_stat_friends_pass/setParams',
            payload: {params: params}
        })
    };

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

    handleChange = (key, e) => {
        let val = ''
        if (key === 'query') {
            val = e.target.value
        } else {
            val = e
        }
        let params = {...this.props.data_stat_friends_pass.params}
        params[key] = val
        if (key === 'department_id') {
            params['user_id'] = undefined
            params['uin'] = undefined
        } else if (key === 'user_id') {
            params['uin'] = undefined
        }
        this.props.dispatch({
            type: 'data_stat_friends_pass/setParams',
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
            type: 'data_stat_friends_pass/setParams',
            payload: {
                params: {
                    start_time: startTime,
                    end_time: endTime
                }
            }
        })
        const endDay = days === 1 ? moment().subtract(days, 'days') : moment()
        this.friendsPassTime.setDate(moment().subtract(days, 'days'), endDay)
    }

    handleSearch = () => {
        let params = {...this.props.data_stat_friends_pass.params}
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
        this.goPage(1)
    };

    handleChangeSize = (current, size) => {
        let params = {...this.props.data_stat_friends_pass.params}
        params.limit = size
        this.props.dispatch({
            type: 'data_stat_friends_pass/setProperty',
            payload: {params: params},
        })
        this.goPage(1)
    };

    goPage = (page) => {
        this.props.dispatch({
            type: 'data_stat_friends_pass/list',
            payload: {page: page}
        })
    };


    render() {
        const {params, list, total, current} = this.props.data_stat_friends_pass
        const {range} = this.state
        const {listLoading} = this.props
        const columns = [{
            title: '日期',
            dataIndex: 'date',
            className: styles.firstColumn,
        },
        {
            title: ()=>{
                return <span>新增申请数<Popover placement="right"
                    content={<p>当天的好友申请数</p>}
                    title={null}><Icon className={styles.questionCircle} type="question-circle-o"/>
                </Popover></span>
            },
            dataIndex: 'apply_num',
        },
        {
            title: ()=>{
                return <span>通过好友数<Popover placement="right"
                    content={<p>当天申请已通过的好友数</p>}
                    title={null}><Icon className={styles.questionCircle} type="question-circle-o"/>
                </Popover></span>
            },
            dataIndex: 'passed_num',
        },
        {
            title: ()=>{
                return <span>未自动通过数<Popover placement="right"
                    content={<p>当天未通过"自动通过"限制条件的好友数</p>}
                    title={null}><Icon className={styles.questionCircle} type="question-circle-o"/>
                </Popover></span>
            },
            dataIndex: 'auto_rej_num',
        },
        {
            title: ()=>{
                return <span>已过期数<Popover placement="right"
                    content={<p>当天申请已过期的好友数</p>}
                    title={null}><Icon className={styles.questionCircle} type="question-circle-o"/>
                </Popover></span>
            },
            dataIndex: 'expired_num',
        },
        {
            title: ()=>{
                return <span>已忽略数<Popover placement="right"
                    content={<p>当天申请已忽略的好友数</p>}
                    title={null}><Icon className={styles.questionCircle} type="question-circle-o"/>
                </Popover></span>
            },
            dataIndex: 'ignored_num',
        },
        {
            title: ()=>{
                return <span>未及时处理数<Popover placement="right"
                    content={<p>当天申请未处理的好友数</p>}
                    title={null}><Icon className={styles.questionCircle} type="question-circle-o"/>
                </Popover></span>
            },
            dataIndex: 'not_handled_num',
        }]

        const formItemLayout = {
            labelCol: {span: 8},
            wrapperCol: {span: 16},
        }
        const timeFormItemLayout = {
            labelCol: {span: 4},
            wrapperCol: {span: 20},
        }
        return (
            <div className={styles.friendsPass}>
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
                                    ref={(ref)=>{this.friendsPassTime = ref}}
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
                <div className={styles.tableWrap}>
                    <Table loading={listLoading}
                        dataSource={list}
                        size="middle"
                        columns={columns}
                        rowKey={(record, index) => index}
                        pagination={list.length ? {
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
                        } : false}
                    />
                </div>
            </div>
        )
    }
}
