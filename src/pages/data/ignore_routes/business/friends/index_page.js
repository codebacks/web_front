'use strict'

import React from 'react'
import {Table, Button, Tabs, DatePicker, Form, Row, Col } from 'antd'
import config from 'common/config'
import {connect} from 'dva'
import moment from 'moment'
import 'moment/locale/zh-cn'
import _ from 'lodash'
import qs from 'qs'
import documentTitleDecorator from 'hoc/documentTitle'
import DepartmentSelect from 'components/business/DepartmentSelect'
import helper from 'data/utils/helper'
import styles from './index.scss'
import API from 'data/common/api/business'

moment.locale('zh-cn')

const TabPane = Tabs.TabPane
const {MonthPicker} = DatePicker
const FormItem = Form.Item
const {DateFormat} = config

@connect(({base, data_business_friends_report}) => ({
    base, data_business_friends_report
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
        } = this.props.data_business_friends_report
        let params = {...this.props.data_business_friends_report.params}
        params.stat_type = parseInt(activeKey, 10)
        let type = ''
        let hasLoad = false
        this.props.dispatch({
            type: 'data_business_friends_report/setProperty',
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
            type: 'data_business_friends_report/setProperty',
            payload: {
                [key]: params,
            }
        })
    };

    query = (type) => {
        if (type === 'daily') {
            this.props.dispatch({
                type: 'data_business_friends_report/query',
                payload: {},
                callback: () => {
                    this.props.dispatch({
                        type: 'data_business_friends_report/setProperty',
                        payload: {
                            hasLoadDaily: true,
                        }
                    })
                }
            })
        } else {
            let key = type === 'month' ? 'hasLoadMonth' : 'hasLoadRank'
            this.props.dispatch({
                type: 'data_business_friends_report/query',
                payload: {},
                callback: () => {
                    this.props.dispatch({
                        type: 'data_business_friends_report/setProperty',
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
    getCurrentMonth = (type) => {
        let statTime = this.getStatTime(type)
        return (moment(statTime).month() + 1)
    };
    handleRankChangeDate = (value) => {
        this.handleChangeDate('rankParams', value, value)
    };
    getStatTime = (type) => {
        let {dailyParams, monthParams, rankParams} = this.props.data_business_friends_report
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
        return `${API.statsFriendsExportExcel.url}?${qs.stringify(params)}&access_token=${accessToken}&t=${new Date().getTime()}`
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

    // 日报表
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

            dailyData = (helper.orderBy(_.cloneDeep(dailyData), ['area', 'city', 'manager'], 'asc')).results

            let total = {}
            let subgroup = {
                one_month_ago_count: 0,
                one_day_ago_count: 0,
                that_day_count: 0,
                one_day_ago_new_count: 0,
                that_week_new_count: 0,
                that_month_new_count: 0,
                that_day_message_count: 0,
                that_day_message_count_average: 0,
            }

            let next = 0
            for (let i = 0; i < dailyData.length; i++) {
                if (i < next) {
                    continue
                }
                let data = dailyData[i]
                if (!total[i]) {
                    let subgroups = dailyData.filter((item) => {
                        return item.area === data.area
                            && item.city === data.city
                            && item.manager === data.manager
                    })

                    let len = subgroups.length

                    if (len > 1) {
                        total[i] = {
                            value: len
                        }
                        next = i + len

                        let temp = _.cloneDeep(subgroup)
                        subgroups.forEach((item) => {
                            temp.one_month_ago_count += item.one_month_ago_count || 0
                            temp.one_day_ago_count += item.one_day_ago_count || 0
                            temp.that_day_count += item.that_day_count || 0
                            temp.one_day_ago_new_count += item.one_day_ago_new_count || 0
                            temp.that_week_new_count += item.that_week_new_count || 0
                            temp.that_month_new_count += item.that_month_new_count || 0
                            temp.that_day_message_count += item.that_day_message_count || 0
                        })

                        // 店均好友互动数
                        let remainder = temp.that_day_message_count % subgroups.length
                        let that_day_message_count_total = temp.that_day_message_count / subgroups.length
                        if (remainder) {
                            temp.that_day_message_count_average = that_day_message_count_total.toFixed(2)
                        } else {
                            temp.that_day_message_count_average = that_day_message_count_total
                        }

                        temp = {
                            ...{
                                area: subgroups[0].area,
                                city: subgroups[0].city,
                                manager: subgroups[0].manager,
                                name: '汇总'
                            },
                            ...temp
                        }
                        total[i].obj = temp
                    }
                }
            }
            Object.keys(total).forEach((key, idx) => {
                let item = total[key]
                let index = parseInt(key, 10)
                dailyData.splice(index + idx, 0, item.obj)
            })
        }

        let totalSum = (helper.orderBy(_.cloneDeep(dailyData), ['area', 'city', 'manager'], 'asc')).totalSum

        return {
            results: dailyData,
            totalSum: totalSum
        }
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
        return rankData
    }


    render() {
        let {
            params, dailyParams, monthParams, rankParams,
            loading, dayStat, monthStat, rankStat
        } = this.props.data_business_friends_report

        let { dailyParams: stateDailyParams,
            monthParams: stateMonthParams,
            rankParams: stateRankParams
        } = this.state

        // 日报表
        const dayStatData = this.parseDailyData(dayStat)
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
                title: `${this.getLastMonth(1)}月好友总数`,
                dataIndex: 'one_month_ago_count',
                key: 'one_month_ago_count',
                render: (text) => {
                    if (typeof(text) === 'undefined') {
                        return 0
                    }
                    return text
                }
            },
            {
                title: oneDayAgo,
                dataIndex: 'one_day_ago_count',
                key: 'one_day_ago_count',
                render: (text) => {
                    if (typeof(text) === 'undefined') {
                        return 0
                    }
                    return text
                }
            },
            {
                title: thatDay,
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
                title: '昨日新增',
                dataIndex: 'one_day_ago_new_count',
                key: 'one_day_ago_new_count',
                render: (text) => {
                    if (typeof(text) === 'undefined') {
                        return 0
                    }
                    return text
                }
            },
            {
                title: '本周新增',
                dataIndex: 'that_week_new_count',
                key: 'that_week_new_count',
                render: (text) => {
                    if (typeof(text) === 'undefined') {
                        return 0
                    }
                    return text
                }
            },
            {
                title: '本月新增',
                dataIndex: 'that_month_new_count',
                key: 'that_month_new_count',
                render: (text) => {
                    if (typeof(text) === 'undefined') {
                        return 0
                    }
                    return text
                }
            },
            {
                title: '好友互动数',
                dataIndex: 'that_day_message_count',
                key: 'that_day_message_count',
                render: (text) => {
                    if (typeof(text) === 'undefined') {
                        return 0
                    }
                    return text
                }
            },
            {
                title: '店均好友互动数',
                dataIndex: 'that_day_message_count_average',
                key: 'that_day_message_count_average',
                render: (text, record) => {
                    if (typeof(text) === 'undefined') {
                        return record.that_day_message_count || 0
                    }
                    return text
                }
            },
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
                title: `${this.getLastMonth(2)}月好友数`,
                dataIndex: 'one_month_ago_count',
                key: 'one_month_ago_count',
                render: (text) => {
                    if (typeof(text) === 'undefined') {
                        return 0
                    }
                    return text
                }
            },
            {
                title: `${this.getLastMonth(2)}月店均好友数`,
                dataIndex: 'one_month_ago_shop_average',
                key: 'one_month_ago_shop_average',
                render: (text) => {
                    if (typeof(text) === 'undefined') {
                        return 0
                    }
                    return text
                }
            },
            {
                title: '当前好友数',
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
                title: '店均好友数',
                dataIndex: 'that_month_shop_average',
                key: 'that_month_shop_average',
                render: (text) => {
                    if (typeof(text) === 'undefined') {
                        return 0
                    }
                    return text
                }
            },
            {
                title: '店均新增好友数',
                dataIndex: 'that_month_new_shop_average',
                key: 'that_month_new_shop_average',
                render: (text) => {
                    if (typeof(text) === 'undefined') {
                        return 0
                    }
                    return text
                }
            },
            {
                title: '好友互动数',
                dataIndex: 'that_month_massage_count',
                key: 'that_month_massage_count',
                render: (text) => {
                    if (typeof(text) === 'undefined') {
                        return 0
                    }
                    return text
                }
            },
            {
                title: '店均好友互动数',
                dataIndex: 'that_month_massage_shop_average',
                key: 'that_month_massage_shop_average',
                render: (text) => {
                    if (typeof(text) === 'undefined') {
                        return 0
                    }
                    return text
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
                sorter: (a, b) => {
                    return (a.shop_count || 0) - (b.shop_count || 0)
                },
                render: (text) => {
                    if (typeof(text) === 'undefined') {
                        return 0
                    }
                    return text
                }
            },
            {
                title: '片区好友总数',
                dataIndex: 'that_day_count',
                key: 'that_day_count',
                sorter: (a, b) => {
                    return (a.that_day_count || 0) - (b.that_day_count || 0)
                },
                render: (text) => {
                    if (typeof(text) === 'undefined') {
                        return 0
                    }
                    return text
                }
            },
            {
                title: '片区店均好友数',
                dataIndex: 'that_day_shop_average',
                key: 'that_day_shop_average',
                sorter: (a, b) => {
                    return (a.that_day_shop_average || 0) - (b.that_day_shop_average || 0)
                },
                render: (text) => {
                    if (typeof(text) === 'undefined') {
                        return 0
                    }
                    return text
                }
            },
            {
                title: '片区店均新增人数',
                dataIndex: 'that_day_new_shop_average',
                key: 'that_day_new_shop_average',
                sorter: (a, b) => {
                    return (a.that_day_new_shop_average || 0) - (b.that_day_new_shop_average || 0)
                },
                render: (text) => {
                    if (typeof(text) === 'undefined') {
                        return 0
                    }
                    return text
                }
            },
            {
                title: '好友互动总数',
                dataIndex: 'that_day_massage_count',
                key: 'that_day_massage_count',
                sorter: (a, b) => {
                    return (a.that_day_massage_count || 0) - (b.that_day_massage_count || 0)
                },
                render: (text) => {
                    if (typeof(text) === 'undefined') {
                        return 0
                    }
                    return text
                }
            },
            {
                title: '店均好友互动数',
                dataIndex: 'that_day_massage_shop_average',
                key: 'that_day_massage_shop_average',
                sorter: (a, b) => {
                    return (a.that_day_massage_shop_average || 0) - (b.that_day_massage_shop_average || 0)
                },
                render: (text) => {
                    if (typeof(text) === 'undefined') {
                        return 0
                    }
                    return text
                }
            },
        ]

        const formItemLayout = {
            labelCol: {span: 8},
            wrapperCol: {span: 16},
        }

        return (
            <div className={styles.friendsReport}>
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
