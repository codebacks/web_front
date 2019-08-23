import React, {Component} from 'react'
import {Table, Button, Form, Radio, notification, Row, Col, Popover, Icon, Spin, Alert} from 'antd'
import {connect} from 'dva'
import moment from 'moment'
import createG2 from 'g2-react'
import 'moment/locale/zh-cn'
import config from 'community/common/config'
// import DateRange from 'components/DateRange'
import DateRange from 'community/components/DateRange'
import DepartmentSelect from 'components/business/DepartmentSelect'
import UserSelect from 'components/business/UserSelect'
import WeChatSelectSingle from 'components/business/WeChatSelectSingle'
import ExportExcel from 'components/business/ExportExcel'
import styles from './index.less'

moment.locale('zh-cn')

const FormItem = Form.Item
const RadioButton = Radio.Button
const RadioGroup = Radio.Group

const {DateFormat} = config

const Line = createG2(chart => {
    chart.line().position('时间*数量').color('类型', ['#1890FF']).shape('spline').size(2)
    chart.axis('时间', {
        title: {
            fontSize: '12',
            textAlign: 'center',
            textBaseline: 'top',
        },
    })
    chart.axis('数量', {
        formatter: function(val) {
            if(Math.round(val) === Number(val)) {
                return val
            }
        },
    })
    chart.render()
    // let timer = 0, flag = true
    // window.addEventListener('resize', () => {
    //     flag = true;
    //     timer = setTimeout(() => {
    //         if (flag) {
    //             chart.changeSize(window.innerWidth - 300, 350);
    //         }
    //         flag = false;
    //         clearTimeout(timer);
    //     }, 500);
    // });
})

@connect(({community_group_stat, loading}) => ({
    community_group_stat,
    listLoading: loading.effects['community_group_stat/query'],
    taskIdLoading: loading.effects['community_group_stat/exportTask']
}))
export default class extends Component {
    constructor(props) {
        super(props)
        this.state = {
            filterValue: 'member_count',
            filterName: '群成员总数',
            height: 350,
            plotCfg: {
                margin: [10, 112, 80, 120],
            },
            params: {},
        }
    }

    componentDidMount() {
        this._isMounted = true
        let params = {...this.props.community_group_stat.params}
        if(params.start_time && params.end_time) {
            this.props.dispatch({
                type: 'community_group_stat/query',
                payload: {},
            })
        }
    }

    componentWillUnmount() {
        this._isMounted = false
        clearTimeout(this.timer)
        this.resetParams()
    }

    resetParams = () => {
        this.props.dispatch({
            type: 'community_group_stat/resetParams',
        })
        this.props.dispatch({
            type: 'community_group_stat/resetRange',
        })
        this.changeTimeRange('week')
    }

    handleChangeDate = (startValue, endValue) => {
        let params = {...this.props.community_group_stat.params}
        if(startValue) {
            params.start_time = moment(startValue).format(DateFormat) + ' 00:00:00'
        }else {
            params.start_time = ''
        }
        if(endValue) {
            params.end_time = moment(endValue).format(DateFormat) + ' 23:59:59'
        }else {
            params.end_time = ''
        }
        this.setTimeRange(startValue, endValue)
        this.props.dispatch({
            type: 'community_group_stat/setParams',
            payload: {params: params},
        })
    }

    setTimeRange = (startValue, endValue) => {
        let range = ''
        if(moment().subtract(1, 'days').isSame(startValue, 'day')
            && moment().subtract(1, 'days').isSame(endValue, 'day')) {
            range = 'yesterday'
        }else if(moment().subtract(6, 'days').isSame(startValue, 'day')
            && moment().isSame(endValue, 'day')) {
            range = 'week'
        }else if(moment().subtract(29, 'days').isSame(startValue, 'day')
            && moment().isSame(endValue, 'day')) {
            range = 'month'
        }
        this.props.dispatch({
            type: 'community_group_stat/setProperty',
            payload: {range: range}
        })

    }

    handleSearch = () => {
        let {params} = this.props.community_group_stat
        if(!params.start_time) {
            notification.error({
                message: '错误提示',
                description: '开始时间不能为空',
            })
            return false
        }
        if(!params.end_time) {
            notification.error({
                message: '错误提示',
                description: '截止时间不能为空',
            })
            return false
        }
        setTimeout(() => {
            this.props.dispatch({
                type: 'community_group_stat/query',
                payload: {},
            })
        }, 100)
    }
    handleChangeFilter = (e) => {
        let val = e.target.value
        let stat = {}
        stat.filterValue = val
        if (val === 'member_count') {
            stat.filterName = '群成员总数'
        } else if (val === 'new_member_count') {
            stat.filterName = '群成员净增'
        } else if (val === 'new_chatroom_count') {
            stat.filterName = '群净增'
        } else if (val === 'chatroom_count') {
            stat.filterName = '群总数'
        }
        // else if (val === 'u_member_count') {
        //     stat.filterName = '群成员去重总数'
        // }
        this.setState({...stat})
    }

    handleChange(key, e) {
        let val = ''
        if(e && e.target) {
            val = e.target.value
        }else {
            val = e
        }
        let params = {...this.props.community_group_stat.params}
        params[key] = val
        if(key === 'department_id') {
            params['user_id'] = undefined
            params['uin'] = undefined
        }else if(key === 'user_id') {
            params['uin'] = undefined
        }
        this.props.dispatch({
            type: 'community_group_stat/setParams',
            payload: {params: params},
        })
    }

    handleChangeTimeRange = (e) => {
        const value = e.target.value
        this.changeTimeRange(value)
        this.props.dispatch({
            type: 'community_group_stat/setProperty',
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
                // this.setTimeParams(6)
                this.setTimeParams(7)
                break
            case 'month':
                // this.setTimeParams(29)
                this.setTimeParams(30)
                break
            default:
        }
    }

    setTimeParams = (days) => {
        // const startTime = moment().subtract(days, 'days').format(DateFormat) + ' 00:00:00'
        // let endTime = ''
        // if(days === 1) {
        //     endTime = moment().subtract(days, 'days').format(DateFormat) + ' 23:59:59'
        // }else {
        //     endTime = moment().format(DateFormat) + ' 23:59:59'
        // }
        const startTime = moment().subtract(days, 'days')
        const endTime = moment().subtract(1, 'days')
        this.props.dispatch({
            type: 'community_group_stat/setParams',
            payload: {
                params: {
                    // start_time: startTime,
                    // end_time: endTime,
                    start_time: startTime.format(DateFormat) + ' 00:00:00',
                    end_time: endTime.format(DateFormat) + ' 23:59:59',
                },
            },
        })
        // const endDay = days === 1 ? moment().subtract(days, 'days') : moment()
        // this.groupStatTime.setDate(moment().subtract(days, 'days'), endDay)
        this.groupStatTime.setDate(startTime, endTime)
    }

    formatDay = (day) => {
        day = day.toString().substr(4, 4)
        return `${day.substring(0, 2)}/${day.substring(2, 4)}`
    }

    resetSearch = () => {
        this.resetParams()
        setTimeout(() => {
            this.handleSearch()
        }, 0)
    }

    getExportTaskId = (callback) => {
        let params = {...this.props.community_group_stat.searchParams}
        params = JSON.parse(JSON.stringify(params, (key, value) => {
            if (key === 'limit' || key === 'offset') {
                return undefined
            } else {
                return value
            }
        }))

        this.props.dispatch({
            type: 'community_group_stat/exportTask',
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
            type: 'community_group_stat/exportExcel',
            payload: {
                taskId: taskId
            },
            callback: (res) => {
                callback && callback(res)
            }
        })
    }

    render() {
        const {params, original, range} = this.props.community_group_stat
        const {listLoading, taskIdLoading} = this.props

        const columns = [
            {
                title: '日期',
                dataIndex: 'day',
                key: 'day',
                className: styles.firstColumn,
                render: (day) => {
                    day = day.toString()
                    return `${day.substring(0, 4)}/${day.substring(4, 6)}/${day.substring(6, 8)}`
                }
            },
            {
                title: () => {
                    return (
                        <span>
                            群净增
                            <Popover
                                placement="right"
                                content={
                                    <div>当天累计的微信群数 - 前一天累计的微信群数</div>
                                }
                                title={null}
                            >
                                <Icon className={styles.questionCircle} type="question-circle-o"/>
                            </Popover>
                        </span>
                    )
                },
                dataIndex: 'new_chatroom_count',
                key: 'new_chatroom_count',
            },
            {
                title: () => {
                    return (
                        <span>
                            群总数
                            <Popover
                                placement="right"
                                content="当天累计的微信群数"
                                title={null}
                            >
                                <Icon className={styles.questionCircle} type="question-circle-o"/>
                            </Popover>
                        </span>
                    )
                },
                dataIndex: 'chatroom_count',
                key: 'chatroom_count',
            },
            {
                title: () => {
                    return (
                        <span>
                            群成员净增
                            <Popover
                                placement="right"
                                content={
                                    <div>当天累计的群成员数 - 前一天累计的群成员数</div>
                                }
                                title={null}
                            >
                                <Icon className={styles.questionCircle} type="question-circle-o"/>
                            </Popover>
                        </span>
                    )
                },
                dataIndex: 'new_member_count',
                key: 'new_member_count',
            },
            {
                title: () => {
                    return (
                        <span>
                            群成员总数
                            <Popover
                                placement="right"
                                content="当天累计的群成员数"
                                title={null}
                            >
                                <Icon className={styles.questionCircle} type="question-circle-o"/>
                            </Popover>
                        </span>
                    )
                },
                dataIndex: 'member_count',
                key: 'member_count',
            },
            // {
            //     title: () => {
            //         return (
            //             <span>
            //                 群成员去重总数
            //                 <Popover
            //                     placement="right"
            //                     content="群成员总数筛选去掉重复成员后的总数"
            //                     title={null}
            //                 >
            //                     <Icon className={styles.questionCircle} type="question-circle-o"/>
            //                 </Popover>
            //             </span>
            //         )
            //     },
            //     dataIndex: 'u_member_count',
            //     key: '',
            // },
        ]

        let _original = []
        if(original && original.length) {
            _original = Array.from(original)
            _original.reverse()
        }
        const getList = () => {
            let day, arr = []
            original.forEach((item) => {
                day = this.formatDay(item.day)
                arr.push({
                    '时间': day,
                    '数量': item[this.state.filterValue],
                    '类型': this.state.filterName,
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
            <div className={styles.groupStat}>
                <Alert className={styles.alert}
                    type="info"
                    showIcon
                    message="仅统计开启工作群的群聊数据，统计时间截止前一天24:00，即可查询最新数据日期为当前日期前一天" />
                <div className={styles.searchWrap}>
                    <Row gutter={20}>
                        <Col span={7}>
                            <FormItem {...formItemLayout} label="所属部门：" colon={false}>
                                <DepartmentSelect
                                    departmentId={params.department_id}
                                    onChange={(value) => {
                                        this.handleChange('department_id', value)
                                    }}
                                />
                            </FormItem>
                        </Col>
                        <Col span={7}>
                            <FormItem {...formItemLayout} label="所属员工：" colon={false}>
                                <UserSelect
                                    departmentId={params.department_id}
                                    userId={params.user_id}
                                    onChange={(value) => {
                                        this.handleChange('user_id', value)
                                    }}
                                />
                            </FormItem>
                        </Col>
                        <Col span={7}>
                            <FormItem {...formItemLayout} label="所属微信：" colon={false}>
                                <WeChatSelectSingle
                                    departmentId={params.department_id}
                                    userId={params.user_id}
                                    uin={params.uin}
                                    onChange={(value) => {
                                        this.handleChange('uin', value)
                                    }}
                                />
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={20}>
                        <Col span={11} style={{marginLeft: '19px'}}>
                            <FormItem {...timeFormItemLayout} label="日期：" colon={false}>
                                <DateRange
                                    {...this.props}
                                    ref={(ref) => {
                                        this.groupStatTime = ref
                                    }}
                                    startValue={params.start_time ? moment(params.start_time, DateFormat) : ''}
                                    endValue={params.end_time ? moment(params.end_time, DateFormat) : ''}
                                    onChange={this.handleChangeDate}
                                    maxRangeDays={60}
                                    ago={1}
                                />
                            </FormItem>
                        </Col>
                        <Radio.Group
                            className={styles.range}
                            value={range}
                            onChange={this.handleChangeTimeRange}
                        >
                            <Radio.Button value="yesterday" className={styles.item}>昨日</Radio.Button>
                            <Radio.Button value="week" className={styles.item}>近7日</Radio.Button>
                            <Radio.Button value="month" className={styles.item}>近30日</Radio.Button>
                        </Radio.Group>
                    </Row>
                    <Row gutter={20} className={styles.operateBtn}>
                        <Col span={7}>
                            <Col offset={8}>
                                <Button type="primary" icon="search" onClick={this.handleSearch}>搜索</Button>
                                <Button onClick={this.resetSearch}>重置</Button>
                            </Col>
                        </Col>
                    </Row>
                </div>
                <div className={styles.lineWrap}>
                    <div className={styles.filterType}>
                        <RadioGroup value={this.state.filterValue} onChange={this.handleChangeFilter}>
                            <RadioButton value="new_chatroom_count">群净增</RadioButton>
                            <RadioButton value="chatroom_count">群总数</RadioButton>
                            <RadioButton value="new_member_count">群成员净增</RadioButton>
                            <RadioButton value="member_count">群成员总数</RadioButton>
                            {/*<RadioButton value="u_member_count">群成员去重总数</RadioButton>*/}
                        </RadioGroup>
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
                <div className={styles.tableWrap}>
                    <ExportExcel name={'群统计'}
                        taskIdLoading={taskIdLoading}
                        taskFunc={this.getExportTaskId}
                        exportFunc={this.exportExcel}
                    />
                    <Table
                        columns={columns}
                        dataSource={_original}
                        size="middle"
                        rowKey={record => record.day}
                        loading={listLoading}
                        pagination={false}
                    />
                </div>
            </div>
        //  <div className={styles.main}>
        //     <div className={styles.title}>
        //         群统计功能正在紧急改造中，请耐心等待功能恢复
        //     </div>
        // </div>
        )
    }
}
