'use strict'

import React from 'react'
import {Table, Button, Tabs, DatePicker, Form, Row, Col} from 'antd'
import config from 'common/config'
import {connect} from 'dva'
import moment from 'moment'
import 'moment/locale/zh-cn'
import qs from 'qs'
import documentTitleDecorator from 'hoc/documentTitle'
import helper from 'data/utils/helper'
import DepartmentSelect from 'components/business/DepartmentSelect'
import styles from './index.scss'
import API from 'data/common/api/business'

moment.locale('zh-cn')

const TabPane = Tabs.TabPane
const {MonthPicker} = DatePicker
const FormItem = Form.Item
const {DateFormat} = config

@connect(({base, data_business_group_report}) => ({
    base, data_business_group_report
}))
@documentTitleDecorator()
export default class extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dailyParams: {
                stat_time: moment().subtract(1, 'days').format(DateFormat) + ' 23:59:59',
                department_id: undefined
            },
            monthParams: {
                stat_time: moment().endOf('month').format(DateFormat) + ' 23:59:59',
                department_id: undefined
            },
            rankParams: {
                stat_time: moment().subtract(1, 'days').format(DateFormat) + ' 23:59:59',
                department_id: undefined
            },
        }
    }

    componentDidMount() {
        this.handleSearch('daily')
    }

    getLastMonth = (type) => {
        let statTime = this.getStatTime(type)
        return moment(statTime).subtract(1, 'months').month() + 1
    };

    handleDayChangeDate = (value) => {
        this.handleChangeDate('dailyParams', value)
    };
    handleChangeTab = (activeKey) => {
        const {
            hasLoadDaily, hasLoadMonth, hasLoadRank
        } = this.props.data_business_group_report
        let params = {...this.props.data_business_group_report.params}
        params.stat_type = parseInt(activeKey, 10)
        let type = ''
        let hasLoad = false
        this.props.dispatch({
            type: 'data_business_group_report/setProperty',
            payload: {
                params: params,
            }
        })
        switch (activeKey) {
            case '1':
                type = 'daily'
                hasLoad = hasLoadDaily
                break
            case '2':
                type = 'month'
                hasLoad = hasLoadMonth
                break
            case '3':
                type = 'rank'
                hasLoad = hasLoadRank
                break
            default:
        }

        if (hasLoad) {
            return
        }
        this.handleSearch(type)
    };
    handleSearch = (type) => {
        this.setParams(`${type}Params`)
        setTimeout(()=>{
            this.query(type)
        },0)
    };

    setParams = (key) => {
        let params = {...this.state[key]}
        this.props.dispatch({
            type: 'data_business_group_report/setProperty',
            payload: {
                [key]: params,
            }
        })
    };

    query = (type) => {
        if (type === 'daily') {
            this.props.dispatch({
                type: 'data_business_group_report/query',
                payload: {},
                callback: () => {
                    this.props.dispatch({
                        type: 'data_business_group_report/setProperty',
                        payload: {
                            hasLoadDaily: true,
                        }
                    })
                }
            })
        } else {
            let key = type === 'month' ? 'hasLoadMonth' : 'hasLoadRank'
            this.props.dispatch({
                type: 'data_business_group_report/query',
                payload: {},
                callback: () => {
                    this.props.dispatch({
                        type: 'data_business_group_report/setProperty',
                        payload: {
                            [key]: true,
                        }
                    })
                }
            })
        }
    };

    handleMonthChangeDate = (value) => {
        this.handleChangeDate('monthParams', value)
    };
    handleRankChangeDate = (value) => {
        this.handleChangeDate('rankParams', value, value)
    };
    getStatTime = (type) => {
        let {dailyParams, monthParams, rankParams} = this.props.data_business_group_report
        let statTime = ''
        switch (type) {
            case 1:
                statTime = dailyParams.stat_time
                break
            case 2:
                statTime = monthParams.stat_time
                break
            case 3:
                statTime = rankParams.stat_time
                break
            default:
        }
        return statTime
    };

    handleChangeDate = (key, value) => {
        let params = {...this.state[key]}
        if (key === 'monthParams') {
            params.stat_time = moment(value).endOf('month').format(DateFormat) + ' 23:59:59'
        } else {
            params.stat_time = moment(value).format(DateFormat) + ' 23:59:59'
        }
        this.setState({
            [key]: params,
        })
    };

    disabledDateMonth = (current) => {
        return current && current > moment().endOf('month')
    };

    getExportUrl = (params) => {
        const accessToken = this.props.base.accessToken
        return `${API.statsExportExcel.url}?${qs.stringify(params)}&access_token=${accessToken}&t=${new Date().getTime()}`
    };

    disabledDate = (current) => {
        return current && current >= moment().startOf('day')
    };

    handleChange = (type, key, e) => {
        let val = ''
        if (e && e.target) {
            val = e.target.value
        } else {
            val = e
        }
        let params = {...this.state[type]}
        params[key] = val
        this.setState({
            [type]: params,
        })
    }

    getOneDayAgo = (params) => {
        let statTime = params.stat_time
        return moment(statTime).subtract(1, 'day').format('MMM Do')
    }

    getThatDay = (params) => {
        let statTime = params.stat_time
        return moment(statTime).format('MMM Do')
    }

    accMul = (arg1, arg2) => {
        let m = 0, s1 = arg1.toString(), s2 = arg2.toString()
        try {
            m += s1.split('.')[1].length
        }
        catch (e) {
        }
        try {
            m += s2.split('.')[1].length
        }
        catch (e) {
        }
        return Number(s1.replace('.', '')) * Number(s2.replace('.', '')) / Math.pow(10, m)
    }

    treeToArray  = (tree, name, currentName, data, level, index) => {
        currentName = currentName || []
        name = name || []
        data = data || []

        for(let i = 0; i < tree.length; i++) {
            if(i !== 0) {
                currentName.pop()
            }
            currentName.push(tree[i].name)
            if (tree[i].children && tree[i].children.length) {
                this.treeToArray(tree[i].children, name, currentName, data, level, index + 1)
            } else {
                name.push(currentName.slice(0))
                if (index === level) {
                    let item = tree[i]
                    delete item.children
                    data.push(item)
                } else {
                    data.push({})
                }
            }
        }
        currentName.pop()
        return name
    }

    parseDailyData = (trees) => {
        let dailyData = []
        if (trees && trees.length) {
            let tree = trees[0].children
            let name = []
            let currentName = []
            let data = []
            this.treeToArray(tree, name, currentName, data, 4, 1) // 固定到第4级
            dailyData = name.map((item, index) => {
                let department = {}
                item.forEach((v, idx) => {
                    let filed = ''
                    if (idx === 0) {
                        filed = 'area'
                    } else if (idx === 1) {
                        filed = 'city'
                    } else if (idx === 2) {
                        filed = 'manager'
                    } else if (idx === 3) {
                        filed = 'name'
                    }
                    department[filed] = v
                })
                return {...department, ...data[index]}
            })
        }
        return dailyData
    }

    parseMonthData = (trees) => {
        let monthData = []
        if (trees && trees.length) {
            let tree = trees[0].children
            let name = []
            let currentName = []
            let data = []
            this.treeToArray(tree, name, currentName, data, 3, 1) // 固定到第3级
            monthData = name.map((item, index) => {
                let department = {}
                item.forEach((v, idx) => {
                    let filed = ''
                    if (idx === 0) {
                        filed = 'area'
                    } else if (idx === 1) {
                        filed = 'city'
                    } else if (idx === 2) {
                        filed = 'manager'
                    } else if (idx === 3) {
                        filed = 'name'
                    }
                    department[filed] = v
                })
                return {...department, ...data[index]}
            })
        }
        return monthData
    }

    parseRankData = (trees) => {
        let rankData = []
        if (trees && trees.length) {
            let tree = trees[0].children
            let name = []
            let currentName = []
            let data = []
            this.treeToArray(tree, name, currentName, data, 3, 1) // 固定到第3级
            rankData = name.map((item, index) => {
                let department = {}
                item.forEach((v, idx) => {
                    let filed = ''
                    if (idx === 0) {
                        filed = 'area'
                    } else if (idx === 1) {
                        filed = 'city'
                    } else if (idx === 2) {
                        filed = 'manager'
                    } else if (idx === 3) {
                        filed = 'name'
                    }
                    department[filed] = v
                })
                return {...department, ...data[index]}
            })
        }
        // 按活跃度排序 that_day_talk_activity_shop_average
        rankData.sort(function(a, b) {
            let t1 = a.that_day_talk_activity_shop_average || 0
            let t2 = b.that_day_talk_activity_shop_average || 0
            return t2 - t1
        })
        return rankData
    }


    render() {
        let {
            params, dailyParams, monthParams, rankParams,
            loading, dayStat, monthStat, rankStat
        } = this.props.data_business_group_report

        let { dailyParams: stateDailyParams,
            monthParams: stateMonthParams,
            rankParams: stateRankParams
        } = this.state

        // 日报表
        const dayStatData = helper.orderBy(this.parseDailyData(dayStat), ['area', 'city', 'manager'], 'asc')
        const dailyGroup = dayStatData.totalSum
        dayStat = dayStatData.results

        // 月报表
        const monthStatData = helper.orderBy(this.parseMonthData(monthStat), ['area', 'city'], 'asc')
        const monthGroup = monthStatData.totalSum
        monthStat = monthStatData.results

        // 排行榜
        rankStat =this.parseRankData(rankStat)

        const oneDayAgo = this.getOneDayAgo(dailyParams)
        const thatDay = this.getThatDay(dailyParams)

        // 日报表
        const dailyColumns = [
            {
                title: '区域',
                dataIndex: 'area',
                key: 'area',
                render: (text, record, index) => {
                    const obj = {
                        children: text,
                        props: {},
                    }
                    let start = 0
                    let groupLength = 0

                    let groupSum = Object.keys(dailyGroup).map((item) => {
                        return dailyGroup[item]
                    })
                    for (let i = 0; i < groupSum.length; i++) {
                        if (groupSum[i].name === text) {
                            groupLength = groupSum[i].value
                            break
                        } else {
                            start += groupSum[i].value
                        }
                    }

                    if (index === start) {
                        obj.props.rowSpan = groupLength
                    } else {
                        obj.props.rowSpan = 0
                    }
                    return obj
                }
            },
            {
                title: '城市',
                dataIndex: 'city',
                key: 'city',
                render: (text, record, index) => {
                    const obj = {
                        children: text,
                        props: {},
                    }

                    let start = 0
                    let groupLength = 0
                    let util = 0
                    let currentArea = 0

                    let groupFirst = Object.keys(dailyGroup).map((item) => {
                        return dailyGroup[item]
                    })

                    for (let i = 0; i < groupFirst.length; i++) {
                        if (index < util) {
                            break
                        } else {
                            currentArea = i
                            start = util
                            util += groupFirst[i].value
                        }
                    }

                    let groupSecond = Object.keys(groupFirst[currentArea].children).map((item) => {
                        return groupFirst[currentArea].children[item]
                    })

                    for (let i = 0; i < groupSecond.length; i++) {
                        if (groupSecond[i].name === text) {
                            groupLength = groupSecond[i].value
                            break
                        } else {
                            start += groupSecond[i].value
                        }
                    }

                    if (index === start) {
                        obj.props.rowSpan = groupLength
                    } else {
                        obj.props.rowSpan = 0
                    }

                    return obj
                }
            },
            {
                title: '片区经理',
                dataIndex: 'manager',
                key: 'manager',
                render: (text, record, index) => {
                    const obj = {
                        children: text,
                        props: {},
                    }

                    let start = 0
                    let groupLength = 0
                    let util = 0
                    let currentArea = 0
                    let currentCity = 0

                    let groupFirst = Object.keys(dailyGroup).map((item) => {
                        return dailyGroup[item]
                    })

                    let groupSecond = Object.keys(dailyGroup).map((item) => {
                        return Object.keys(dailyGroup[item].children).map((v) => {
                            return dailyGroup[item].children[v]
                        })
                    })

                    for (let i = 0; i < groupFirst.length; i++) {
                        if (index < util) {
                            break
                        } else {
                            currentArea = i
                            start = util
                            util += groupFirst[i].value
                        }
                    }

                    for (let j = 0; j < groupSecond[currentArea].length; j++) {
                        if (index > start && index >= (start + groupSecond[currentArea][j].value)) {
                            start += groupSecond[currentArea][j].value
                        } else {
                            currentCity = j
                            break
                        }
                    }

                    let groupThird = Object.keys(groupSecond[currentArea][currentCity].children).map(item => {
                        return groupSecond[currentArea][currentCity].children[item]
                    })

                    for (let i = 0; i < groupThird.length; i++) {
                        if (groupThird[i].name === text) {
                            groupLength = groupThird[i].value
                            break
                        } else {
                            start += groupThird[i].value
                        }
                    }

                    if (index === start) {
                        obj.props.rowSpan = groupLength
                    } else {
                        obj.props.rowSpan = 0
                    }
                    return obj
                }
            },
            {
                title: '门店名称',
                dataIndex: 'name',
                key: 'name',
            },
            {
                title: '群总数',
                dataIndex: 'total_count',
                key: 'total_count',
                render: (text) => {
                    if (typeof(text) === 'undefined') {
                        return 0
                    }
                    return text
                }
            },
            {
                title: `${this.getLastMonth(1)}月群成员总数`,
                dataIndex: 'one_month_ago_member_count',
                key: 'one_month_ago_member_count',
                render: (text) => {
                    if (typeof(text) === 'undefined') {
                        return 0
                    }
                    return text
                }
            },
            {
                title: `${oneDayAgo}群成员总数`,
                dataIndex: 'one_day_ago_member_count',
                key: 'one_day_ago_member_count',
                render: (text) => {
                    if (typeof(text) === 'undefined') {
                        return 0
                    }
                    return text
                }
            },
            {
                title: `${thatDay}群成员总数`,
                dataIndex: 'that_day_member_count',
                key: 'that_day_member_count',
                render: (text) => {
                    if (typeof(text) === 'undefined') {
                        return 0
                    }
                    return text
                }
            },
            {
                title: '昨日成员新增',
                dataIndex: 'one_day_ago_new_member_count',
                key: 'one_day_ago_new_member_count',
                render: (text) => {
                    if (typeof(text) === 'undefined') {
                        return 0
                    }
                    return text
                }
            },
            {
                title: '本周成员新增',
                dataIndex: 'that_week_new_member_count',
                key: 'that_week_new_member_count',
                render: (text) => {
                    if (typeof(text) === 'undefined') {
                        return 0
                    }
                    return text
                }
            },
            {
                title: '本月成员新增',
                dataIndex: 'that_month_new_member_count',
                key: 'that_month_new_member_count',
                render: (text) => {
                    if (typeof(text) === 'undefined') {
                        return 0
                    }
                    return text
                }
            },
            {
                title: '发言数',
                dataIndex: 'that_day_talk_count',
                key: 'that_day_talk_count',
                render: (text) => {
                    if (typeof(text) === 'undefined') {
                        return 0
                    }
                    return text
                }
            },
            {
                title: '发言用户数',
                dataIndex: 'that_day_talk_member_count',
                key: 'that_day_talk_member_count',
                render: (text) => {
                    if (typeof(text) === 'undefined') {
                        return 0
                    }
                    return text
                }
            },
            {
                title: '活跃度',
                dataIndex: 'that_day_talk_activity',
                key: 'that_day_talk_activity',
                render: (text) => {
                    if (typeof(text) === 'undefined' || text === 0) {
                        return '0%'
                    }
                    let percent = this.accMul(parseFloat(text), 100)
                    if (Math.round(percent) === Number(percent)) {
                        return `${percent}%`
                    } else {
                        return  `${percent.toFixed(2)}%`
                    }
                }
            }
        ]

        // 月报表
        const monthColumns = [
            {
                title: '区域',
                dataIndex: 'area',
                key: 'area',
                render: (text, record, index) => {
                    const obj = {
                        children: text,
                        props: {},
                    }
                    let start = 0
                    let groupLength = 0

                    let groupSum = Object.keys(monthGroup).map((item) => {
                        return monthGroup[item]
                    })
                    for (let i = 0; i < groupSum.length; i++) {
                        if (groupSum[i].name === text) {
                            groupLength = groupSum[i].value
                            break
                        } else {
                            start += groupSum[i].value // 下一个的index
                        }
                    }

                    if (index === start) {
                        obj.props.rowSpan = groupLength
                    } else {
                        obj.props.rowSpan = 0
                    }
                    return obj
                }
            },
            {
                title: '城市',
                dataIndex: 'city',
                key: 'city',
            },
            {
                title: '片区经理',
                dataIndex: 'manager',
                key: 'manager',
            },
            {
                title: '门店数',
                dataIndex: 'shop_count',
                key: 'shop_count',
                render: (text) => {
                    if (typeof(text) === 'undefined') {
                        return 0
                    }
                    return text
                }
            },
            {
                title: `${this.getLastMonth(2)}月店均人数`,
                dataIndex: 'one_month_ago_member_shop_average',
                key: 'one_month_ago_member_shop_average',
                render: (text) => {
                    if (typeof(text) === 'undefined') {
                        return 0
                    }
                    return text
                }
            },
            {
                title: '群总数',
                dataIndex: 'that_month_count',
                key: 'that_month_count',
                render: (text) => {
                    if (typeof(text) === 'undefined') {
                        return 0
                    }
                    return text
                }
            },
            {
                title: '群成员数',
                dataIndex: 'that_month_member_count',
                key: 'that_month_member_count',
                render: (text) => {
                    if (typeof(text) === 'undefined') {
                        return 0
                    }
                    return text
                }
            },
            {
                title: '店均人数',
                dataIndex: 'that_month_member_shop_average',
                key: 'that_month_member_shop_average',
                render: (text) => {
                    if (typeof(text) === 'undefined') {
                        return 0
                    }
                    return text
                }
            },
            {
                title: '店均新增人数',
                dataIndex: 'that_month_new_member_shop_average',
                key: 'that_month_new_member_shop_average',
                render: (text) => {
                    if (typeof(text) === 'undefined') {
                        return 0
                    }
                    return text
                }
            },
            {
                title: '店均发言数',
                dataIndex: 'that_month_talk_shop_average',
                key: 'that_month_talk_shop_average',
                render: (text) => {
                    if (typeof(text) === 'undefined') {
                        return 0
                    }
                    return text
                }
            },
            {
                title: '店均发言用户数',
                dataIndex: 'that_month_talk_member_shop_average',
                key: 'that_month_talk_member_shop_average',
                render: (text) => {
                    if (typeof(text) === 'undefined') {
                        return 0
                    }
                    return text
                }
            },
            {
                title: '店均活跃度', // 发言数/发言用户数*100%
                dataIndex: 'that_month_talk_activity_shop_average',
                key: 'that_month_talk_activity_shop_average',
                render: (text) => {
                    if (typeof(text) === 'undefined' || text === 0) {
                        return '0%'
                    }
                    let percent = this.accMul(parseFloat(text), 100)
                    if (Math.round(percent) === Number(percent)) {
                        return `${percent}%`
                    } else {
                        return  `${percent.toFixed(2)}%`
                    }
                }
            },
        ]

        // 排行榜
        const rankColumns = [
            {
                title: '区域',
                dataIndex: 'area',
                key: 'area',
            },
            {
                title: '城市',
                dataIndex: 'city',
                key: 'city',
            },
            {
                title: '片区经理',
                dataIndex: 'manager',
                key: 'manager',
            },
            {
                title: '门店数',
                dataIndex: 'shop_count',
                key: 'shop_count',
                render: (text) => {
                    if (typeof(text) === 'undefined') {
                        return 0
                    }
                    return text
                }
            },
            {
                title: '群总数',
                dataIndex: 'that_day_count',
                key: 'that_day_count',
                render: (text) => {
                    if (typeof(text) === 'undefined') {
                        return 0
                    }
                    return text
                }
            },
            {
                title: '群成员数',
                dataIndex: 'that_day_member_count',
                key: 'that_day_member_count',
                render: (text) => {
                    if (typeof(text) === 'undefined') {
                        return 0
                    }
                    return text
                }
            },
            {
                title: '店均人数',
                dataIndex: 'that_day_member_shop_average',
                key: 'that_day_member_shop_average',
                render: (text) => {
                    if (typeof(text) === 'undefined') {
                        return 0
                    }
                    return text
                }
            },
            {
                title: '店均发言数',
                dataIndex: 'that_day_talk_shop_average',
                key: 'that_day_talk_shop_average',
                render: (text) => {
                    if (typeof(text) === 'undefined') {
                        return 0
                    }
                    return text
                }
            },
            {
                title: '店均发言用户数',
                dataIndex: 'that_day_talk_member_shop_average',
                key: 'that_day_talk_member_shop_average',
                render: (text) => {
                    if (typeof(text) === 'undefined') {
                        return 0
                    }
                    return text
                }
            },
            {
                title: '店均活跃度',
                dataIndex: 'that_day_talk_activity_shop_average',
                key: 'that_day_talk_activity_shop_average',
                render: (text) => {
                    if (typeof(text) === 'undefined' || text === 0) {
                        return '0%'
                    }
                    let percent = this.accMul(parseFloat(text), 100)
                    if (Math.round(percent) === Number(percent)) {
                        return `${percent}%`
                    } else {
                        return  `${percent.toFixed(2)}%`
                    }
                }
            },
        ]

        const formItemLayout = {
            labelCol: {span: 8},
            wrapperCol: {span: 16},
        }

        return (
            <div className={styles.groupReport}>
                <Tabs onChange={this.handleChangeTab}>
                    <TabPane tab="日报表" key="1">
                        <div>
                            <div className={styles.searchWrap}>
                                <Row gutter={20}>
                                    <Col span={7}>
                                        <FormItem {...formItemLayout}
                                            label="日期："
                                            colon={false}
                                        >
                                            <DatePicker
                                                allowClear={false}
                                                showToday={false}
                                                disabledDate={this.disabledDate}
                                                value={stateDailyParams.stat_time ? moment(stateDailyParams.stat_time, DateFormat) : null}
                                                onChange={this.handleDayChangeDate}
                                            />
                                        </FormItem>
                                    </Col>
                                    <Col span={7}>
                                        <FormItem {...formItemLayout}
                                            label="所属部门："
                                            colon={false}
                                        >
                                            <DepartmentSelect
                                                departmentId={stateDailyParams.department_id}
                                                onChange={(value) => {
                                                    this.handleChange('dailyParams', 'department_id', value)
                                                }}
                                            />
                                        </FormItem>
                                    </Col>
                                    <div className={styles.searchBtn}>
                                        <Button type="primary" icon="search" onClick={()=>{this.handleSearch('daily')}}>查询</Button>
                                    </div>
                                    <Button className={styles.export}>
                                        <a target="_blank"
                                            rel="noopener noreferrer"
                                            href={this.getExportUrl({...dailyParams, ...params})}
                                        >导出数据</a>
                                    </Button>
                                </Row>
                            </div>
                            <div className={styles.tableWrap}>
                                <Table
                                    loading={loading}
                                    columns={dailyColumns}
                                    dataSource={dayStat}
                                    rowKey={(record, index) => index}
                                    bordered
                                    pagination={false}
                                />
                            </div>
                        </div>
                    </TabPane>
                    <TabPane tab="月报表" key="2">
                        <div>
                            <div className={styles.searchWrap}>
                                <Row gutter={20}>
                                    <Col span={7}>
                                        <FormItem {...formItemLayout}
                                            label="日期："
                                            colon={false}
                                        >
                                            <MonthPicker
                                                allowClear={false}
                                                value={stateMonthParams.stat_time ? moment(stateMonthParams.stat_time, DateFormat) : null}
                                                disabledDate={this.disabledDateMonth}
                                                onChange={this.handleMonthChangeDate}
                                            />
                                        </FormItem>
                                    </Col>
                                    <Col span={7}>
                                        <FormItem {...formItemLayout}
                                            label="所属部门："
                                            colon={false}
                                        >
                                            <DepartmentSelect
                                                departmentId={stateMonthParams.department_id}
                                                onChange={(value) => {
                                                    this.handleChange('monthParams', 'department_id', value)
                                                }}
                                            />
                                        </FormItem>
                                    </Col>
                                    <div className={styles.searchBtn}>
                                        <Button type="primary" icon="search" onClick={()=>{this.handleSearch('month')}}>查询</Button>
                                    </div>
                                    <Button className={styles.export}>
                                        <a target="_blank" rel="noopener noreferrer" href={this.getExportUrl({...monthParams, ...params})}>导出数据</a>
                                    </Button>
                                </Row>
                            </div>
                            <div className={styles.tableWrap}>
                                <Table
                                    loading={loading}
                                    columns={monthColumns}
                                    dataSource={monthStat}
                                    rowKey={(record, index) => index}
                                    bordered
                                    pagination={false}
                                />
                            </div>
                        </div>
                    </TabPane>
                    <TabPane tab="排行榜" key="3">
                        <div>
                            <div className={styles.searchWrap}>
                                <Row gutter={20}>
                                    <Col span={7}>
                                        <FormItem {...formItemLayout}
                                            label="日期："
                                            colon={false}
                                        >
                                            <DatePicker
                                                allowClear={false}
                                                showToday={false}
                                                disabledDate={this.disabledDate}
                                                value={moment(stateRankParams.stat_time)}
                                                onChange={this.handleRankChangeDate}
                                            />
                                        </FormItem>
                                    </Col>
                                    <Col span={7}>
                                        <FormItem {...formItemLayout}
                                            label="所属部门："
                                            colon={false}
                                        >
                                            <DepartmentSelect
                                                departmentId={stateRankParams.department_id}
                                                onChange={(value) => {
                                                    this.handleChange('rankParams', 'department_id', value)
                                                }}
                                            />
                                        </FormItem>
                                    </Col>
                                    <div className={styles.searchBtn}>
                                        <Button type="primary" icon="search" onClick={()=>{this.handleSearch('rank')}}>查询</Button>
                                    </div>
                                    <Button className={styles.export}>
                                        <a target="_blank" rel="noopener noreferrer" href={this.getExportUrl({...rankParams, ...params})}>导出数据</a>
                                    </Button>
                                </Row>
                            </div>
                            <div className={styles.tableWrap}>
                                <Table
                                    loading={loading}
                                    columns={rankColumns}
                                    dataSource={rankStat}
                                    rowKey={(record, index) => index}
                                    bordered
                                    pagination={false}
                                />
                            </div>
                        </div>
                    </TabPane>
                </Tabs>
            </div>)
    }
}
