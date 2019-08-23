'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 16/12/27
 */
import React from 'react'
import {Form, Table, Button, Radio, Row, Col, notification, Popover, Icon, Spin} from 'antd'
import {connect} from 'dva'
import createG2 from 'g2-react'
import 'moment/locale/zh-cn'
import moment from 'moment'
import config from 'data/common/config'
import styles from './index.scss'
import DateRange from 'components/DateRange'
import DepartmentSelect from 'components/business/DepartmentSelect'
import UserSelect from 'components/business/UserSelect'
import WeChatSelectSingle from 'components/business/WeChatSelectSingle'
import ExportExcel from 'components/business/ExportExcel'

moment.locale('zh-cn')

const FormItem = Form.Item

const {DateFormat} = config

const Line = createG2(chart => {
    chart.line().position('时间*数量').color('类型', ['#1890FF']).shape('spline').size(2)
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
@connect(({data_stat_friends, loading}) => ({
    data_stat_friends,
    listLoading: loading.effects['data_stat_friends/query'],
    taskIdLoading: loading.effects['data_stat_friends/exportTask']
}))
export default class Stat extends React.Component {
    constructor(props) {
        super()
        this.state = {
            // width: 1100,
            height: 350,
            plotCfg: {
                margin: [10, 100, 80, 120],
            },
            filterValue: 'friend_count',
            filterName: '总人数',
            range: 'week',
        }
    }
    componentDidMount() {
        this.loadFriends()
    }

    componentDidUpdate() {
    }

    componentWillUnmount() {
        this.resetParams()
    }

    resetParams = () => {
        this.props.dispatch({
            type: 'data_stat_friends/resetParams',
        })
    }

    loadFriends = () => {
        let params = {...this.props.data_stat_friends.params}
        if (params.start_time && params.end_time) {
            this.props.dispatch({
                type: 'data_stat_friends/query',
                payload: {params: {}}
            })
        }
    };

    handleChangeDate = (startValue, endValue) => {
        let params = {...this.props.data_stat_friends.params}
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
            type: 'data_stat_friends/setParams',
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
        let params = {...this.props.data_stat_friends.params}
        params[key] = val
        if (key === 'department_id') {
            params['user_id'] = undefined
            params['uin'] = undefined
        } else if (key === 'user_id') {
            params['uin'] = undefined
        }
        this.props.dispatch({
            type: 'data_stat_friends/setParams',
            payload: {params: params},
        })
    }

    handleSearch = () => {
        let params = {...this.props.data_stat_friends.params}
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
        setTimeout(() => {
            this.props.dispatch({
                type: 'data_stat_friends/query',
                payload: {}
            })
        }, 0)
    };

    handleChangeFilter = (e) => {
        let val = e.target.value
        let _stat = {}
        _stat.filterValue = val
        if (val === 'friend_count') {
            _stat.filterName = '总人数'
        } else if (val === 'new_friend_count') {
            _stat.filterName = '净增人数'
        } else if (val === 'block_friend_count') {
            _stat.filterName = '被删除人数'
        } else if (val === 'delete_friend_count') {
            _stat.filterName = '删除人数'
        }
        this.setState({..._stat})
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
            type: 'data_stat_friends/setParams',
            payload: {
                params: {
                    start_time: startTime,
                    end_time: endTime
                }
            }
        })
        const endDay = days === 1 ? moment().subtract(days, 'days') : moment()
        this.refs.customerTime.setDate(moment().subtract(days, 'days'), endDay)
    }

    getExportTaskId = (callback) => {
        let params = {...this.props.data_stat_friends.searchParams}
        this.props.dispatch({
            type: 'data_stat_friends/exportTask',
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
            type: 'data_stat_friends/exportExcel',
            payload: {
                taskId: taskId
            },
            callback: (res) => {
                callback && callback(res)
            }
        })
    }

    render() {
        const {params, original} = this.props.data_stat_friends
        const {listLoading, taskIdLoading} = this.props
        const {range} = this.state

        const columns = [{
            title: '时间',
            dataIndex: 'day',
            key: 'day',
            className: styles.firstColumn,
        },
        {
            title: ()=> { return <span>净增人数<Popover placement="right"
                content={<div>当天累计的微信好友数 - 前一天累计的微信好友数</div>}
                title={null}>
                <Icon className={styles.questionCircle} type="question-circle-o"/>
            </Popover></span>},
            dataIndex: 'new_friend_count',
            key: 'new_friend_count',
        },
        // {
        //     title: '被删除人数',
        //     dataIndex: 'block_friend_count',
        //     key: 'block_friend_count',
        // },
        // {
        //     title: '删除人数',
        //     dataIndex: 'delete_friend_count',
        //     key: 'delete_friend_count',
        // },
        // {
        //     title: '净增人数',
        //     dataIndex: 'other_friend_count',
        //     key: 'other_friend_count',
        // },
        {
            title: ()=> { return <span>总数<Popover placement="right"
                content="当天累计的微信好友数"
                title={null}>
                <Icon className={styles.questionCircle} type="question-circle-o"/>
            </Popover></span>
            },
            dataIndex: 'friend_count',
            key: 'friend_count',
        }]
        let _original = []
        if (original && original.length) {
            _original = Array.from(original)
            _original.reverse()
        }
        const getList = () => {
            let day, arr = []
            original.forEach((item) => {
                day = ('' + item.day).substr(4, 4)
                day = `${day.substring(0, 2)}/${day.substring(2, 4)}`
                arr.push({
                    '时间': day,
                    '数量': item[this.state.filterValue],
                    '类型': this.state.filterName
                })
            })
            return arr
        }
        const formItemLayout = {
            labelCol: {span: 8},
            wrapperCol: {span: 16},
        }
        const timeFormItemLayout = {
            labelCol: {span: 4},
            wrapperCol: {span: 20},
        }

        return (
            <div className={styles.customerStat}>
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
                                    ref="customerTime"
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
                <div className={styles.lineWrap}>
                    <div className={styles.filterType}>
                        <Radio.Group value={this.state.filterValue} onChange={this.handleChangeFilter}>
                            <Radio.Button value="friend_count">总人数</Radio.Button>
                            <Radio.Button value="new_friend_count">净增人数</Radio.Button>
                            {/*<Radio.Button value="block_friend_count">被删除人数</Radio.Button>*/}
                            {/*<Radio.Button value="delete_friend_count">删除人数</Radio.Button>*/}
                        </Radio.Group>
                    </div>
                    <div className={styles.lineChat}>
                        <Spin spinning={listLoading}>
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
                <ExportExcel name={'好友统计'}
                    taskIdLoading={taskIdLoading}
                    taskFunc={this.getExportTaskId}
                    exportFunc={this.exportExcel}
                />
                <div className={styles.tableWrap}>
                    <Table
                        dataSource={_original}
                        size="middle"
                        loading={listLoading}
                        columns={columns} pagination={false}
                        rowKey={(record) => record.day}/>
                </div>
            </div>
        )
    }
}
