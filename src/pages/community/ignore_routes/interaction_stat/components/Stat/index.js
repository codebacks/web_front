import React from 'react'
import {Table, Button, Form, Radio, notification, Row, Col, Popover, Icon, Alert} from 'antd'
import {connect} from 'dva'
import moment from 'moment'
import createG2 from 'g2-react'
import 'moment/locale/zh-cn'
import config from 'community/common/config'
import DateRange from 'community/components/DateRange'
import DepartmentSelect from 'components/business/DepartmentSelect/index'
import UserSelect from 'components/business/UserSelect/index'
import WeChatSelectSingle from 'components/business/WeChatSelectSingle/index'
import styles from './index.less'
import router from "umi/lib/router"
moment.locale('zh-cn')

const FormItem = Form.Item
const RadioButton = Radio.Button
const RadioGroup = Radio.Group

const {DateFormat} = config

@connect(({community_interaction_stat}) => ({
    community_interaction_stat,
}))
export default class extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            filterValue: 'talk_count',
            filterName: '群消息数',
            height: 350,
            plotCfg: {
                margin: [10, 100, 80, 120],
            },
            range: 'week',
        }
    }

    componentDidMount() {
        let params = {...this.props.community_interaction_stat.params}
        if(params.start_time && params.end_time) {
            this.props.dispatch({
                type: 'community_interaction_stat/query',
                payload: {},
            })
        }
    }

    componentWillUnmount() {
        this.resetParams()
    }

    resetParams = () => {
        this.props.dispatch({
            type: 'community_interaction_stat/resetParams',
        })
    }

    handleSearch = () => {
        let {params} = this.props.community_interaction_stat
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
                type: 'community_interaction_stat/query',
                payload: {},
            })
        }, 100)
    }
    handleChangeFilter = (e) => {
        let val = e.target.value
        let stat = {}
        stat.filterValue = val
        if(val === 'talk_count') {
            stat.filterName = '群消息数'
        }else if(val === 'talk_member_count') {
            stat.filterName = '群发言人数'
        }else if(val === 'chatroom_talk_count_avg') {
            stat.filterName = '群平均消息数'
        }else if(val === 'chatroom_talk_ratio') {
            stat.filterName = '群发言比例'
        }
        this.setState({...stat})
    }

    handleChangeDate = (startValue, endValue) => {
        let params = {...this.props.community_interaction_stat.params}
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
            type: 'community_interaction_stat/setParams',
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
        this.setState({
            range: range,
        })
    }
    handleChange = (key, e) => {
        let val = ''
        if(key === 'query') {
            val = e.target.value
        }else {
            val = e
        }
        let params = {...this.props.community_interaction_stat.params}
        params[key] = val
        if(key === 'department_id') {
            params['user_id'] = undefined
            params['uin'] = undefined
        }else if(key === 'user_id') {
            params['uin'] = undefined
        }
        this.props.dispatch({
            type: 'community_interaction_stat/setParams',
            payload: {params: params},
        })
    }

    accMul = (arg1, arg2) => {
        let m = 0, s1 = arg1.toString(), s2 = arg2.toString()
        try {
            m += s1.split('.')[1].length
        }catch(e) {
        }
        try {
            m += s2.split('.')[1].length
        }catch(e) {
        }
        return Number(s1.replace('.', '')) * Number(s2.replace('.', '')) / Math.pow(10, m)
    }

    handleChangeTimeRange = (e) => {
        const value = e.target.value
        switch(value) {
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
        this.setState({
            range: value,
        })
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
            type: 'community_interaction_stat/setParams',
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
        // this.interactionStatTime.setDate(moment().subtract(days, 'days'), endDay)
        this.interactionStatTime.setDate(startTime, endTime)
    }

    goGroupStat = () => {
        router.push({
            pathname: `/community/interaction_stat/by_group_stat`,
        })
    }

    render() {
        const {params, original, loading} = this.props.community_interaction_stat
        const {range} = this.state

        const columns = [
            {
                title: '日期',
                dataIndex: 'day',
                key: 'day',
                className: styles.firstColumn,
            },
            {
                title: () => {
                    return (
                        <span>群消息数
                            <Popover
                                placement="right"
                                content="当天群聊消息总数"
                                title={null}
                            >
                                <Icon className={styles.questionCircle} type="question-circle-o"/>
                            </Popover>
                        </span>
                    )
                },
                dataIndex: 'talk_count',
                key: 'talk_count',
            },
            {
                title: () => {
                    return (
                        <span>群发言人数
                            <Popover
                                placement="right"
                                content="当天群聊中发言的人数"
                                title={null}
                            >
                                <Icon className={styles.questionCircle} type="question-circle-o"/>
                            </Popover>
                        </span>
                    )
                },
                dataIndex: 'talk_member_count',
                key: 'talk_member_count',
            },
            {
                title: () => {
                    return (
                        <span>群平均消息数
                            <Popover
                                placement="right"
                                content="群消息数/群发言人数"
                                title={null}
                            >
                                <Icon className={styles.questionCircle} type="question-circle-o"/>
                            </Popover>
                        </span>
                    )
                },
                dataIndex: 'chatroom_talk_count_avg',
                key: 'chatroom_talk_count_avg',
            },
            {
                title: () => {
                    return (
                        <span>群发言比例
                            <Popover
                                placement="right"
                                content="当天群发言人数/群成员总数*100%"
                                title={null}
                            >
                                <Icon className={styles.questionCircle} type="question-circle-o"/>
                            </Popover>
                        </span>
                    )
                },
                dataIndex: 'chatroom_talk_ratio',
                key: 'chatroom_talk_ratio',
                render: (text) => {
                    if(typeof (text) === 'undefined') {
                        return '0%'
                    }
                    let percent = this.accMul(parseFloat(text), 100)
                    if(Math.round(percent) === Number(percent)) {
                        return `${percent}%`
                    }
                    return `${percent.toFixed(2)}%`
                },
            },
        ]

        const Line = createG2(chart => {
            chart.axis('时间', {
                title: {
                    fontSize: '12',
                    textAlign: 'center',
                    textBaseline: 'top',
                },
            })
            chart.axis('百分比', {
                formatter: (val) => {
                    if(typeof (val) === 'undefined') {
                        return '0%'
                    }
                    return `${(parseFloat(val) * 100).toFixed(0)}%`
                },
            })
            if(this.state.filterValue === 'chatroom_talk_ratio') {
                chart.on('tooltipchange', (ev) => {
                    let item = ev.items[0]
                    if(typeof (item.value) === 'undefined') {
                        item.value = '0%'
                    }
                    let percent = this.accMul(parseFloat(item.value), 100)
                    if(Math.round(percent) === Number(percent)) {
                        item.value = `${percent}%`
                    }else {
                        item.value = `${percent.toFixed(2)}%`
                    }
                })
                chart.line().position('时间*百分比').color('类型', ['#1890FF']).shape('spline').size(2)
            }else {
                chart.line().position('时间*数量').color('类型', ['#1890FF']).shape('spline').size(2)
            }
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

        let _original = []
        if(original && original.length) {
            _original = Array.from(original)
            _original.reverse()
        }
        const getList = () => {
            let day, arr = []
            let yLine = this.state.filterValue === 'chatroom_talk_ratio' ? '百分比' : '数量'
            original.forEach((item) => {
                day = ('' + item.day).substr(4, 4)
                day = `${day.substring(0, 2)}/${day.substring(2, 4)}`
                arr.push({
                    '时间': day,
                    [yLine]: item[this.state.filterValue],
                    '类型': this.state.filterName,
                })
            })
            return arr
        }
        const formItemLayout = {
            labelCol: {span: 8},
            wrapperCol: {span: 16},
        }

        const timeFormLayout = {
            labelCol: {span: 4},
            wrapperCol: {span: 20},
        }

        return (
            <div className={styles.container}>
                <Alert className={styles.alert}
                    type="info" showIcon
                    message="仅统计开启工作群的群聊数据，统计时间截止前一天24:00，即可查询最新数据日期为当前日期前一天"/>
                <div className={styles.searchWrap}>
                    <Form>
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
                                <FormItem {...timeFormLayout} label="日期：" colon={false}>
                                    <DateRange {...this.props}
                                        ref={(ref) => this.interactionStatTime = ref}
                                        startValue={params.start_time ? moment(params.start_time, DateFormat) : ''}
                                        endValue={params.end_time ? moment(params.end_time, DateFormat) : ''}
                                        onChange={this.handleChangeDate}
                                        maxRangeDays={60}
                                        ago={1}
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
                    </Form>
                </div>
                <div className={styles.lineWrap}>
                    <div className={styles.filterType}>
                        <RadioGroup value={this.state.filterValue} onChange={this.handleChangeFilter}>
                            <RadioButton value="talk_count">群消息数</RadioButton>
                            <RadioButton value="talk_member_count">群发言人数</RadioButton>
                            <RadioButton value="chatroom_talk_count_avg">群平均消息数</RadioButton>
                            <RadioButton value="chatroom_talk_ratio">群发言比例</RadioButton>
                        </RadioGroup>
                    </div>
                    <div className={styles.lineChat}>
                        <Line
                            data={getList()}
                            width={window.innerWidth - 300}
                            height={this.state.height}
                            plotCfg={this.state.plotCfg}
                            label={null}
                        />
                    </div>
                </div>
                <div className={styles.btns}>
                    <Button onClick={this.goGroupStat}>按群统计</Button>
                </div>
                <div className={styles.tableWrap}>
                    <Table
                        columns={columns}
                        dataSource={_original}
                        size="middle"
                        rowKey={record => record.day}
                        loading={loading}
                        pagination={false}
                    />
                </div>
            </div>
        )
    }
}
