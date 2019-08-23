import React, {Component} from 'react'
import {Table, Button, Form, Radio, notification, Row, Col, Popover, Icon} from 'antd'
import {connect} from 'dva'
import documentTitleDecorator from 'hoc/documentTitle'
import ContentHeader from 'business/ContentHeader'
import moment from 'moment'
import createG2 from 'g2-react'
import 'moment/locale/zh-cn'
import config from 'community/common/config'
import DateRange from 'components/DateRange'
import EllipsisPopover from "components/EllipsisPopover"
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
})

@connect(({community_groupCodeActivityGroupStat, loading}) => ({
    community_groupCodeActivityGroupStat,
    queryLoading: loading.effects['community_groupCodeActivityGroupStat/query'],
}))
@documentTitleDecorator()
export default class extends Component {
    constructor(props) {
        super(props)
        this.state = {
            filterValue: 'qrcode_show_count', // qrcode_show_count，total_in_count，members_count
            filterName: '群码展示次数', // 群码展示次数，总进群人数，群成员总数
            height: 350,
            plotCfg: {
                margin: [10, 100, 80, 120],
            },
            range: 'week', // 昨日，近7日，近30日
            group_activity_id: '',
            list: [],
            _list: [],
        }
    }

    componentDidMount() {
        const { query } = this.props.location
        if(query) {
            this.setState({
                group_activity_id: query.group_activity_id,
                group_activity_chatroom_id: query.group_activity_chatroom_id,
            }, () => {
                this.props.dispatch({
                    type: 'community_groupCodeActivityGroupStat/query',
                    payload: {
                        group_activity_id: this.state.group_activity_id,
                        group_activity_chatroom_id: this.state.group_activity_chatroom_id,
                    },
                    callback: (res) => {
                        this.setState({
                            list: res
                        }, () => {
                            this.resetList()
                        })
                    }
                })
            })
        }
    }

    componentWillUnmount() {
        this.resetParams()
    }

    resetParams = () => {
        this.props.dispatch({
            type: 'community_groupCodeActivityGroupStat/resetParams',
        })
    }

    handleChangeDate = (startValue, endValue) => {
        let params = {...this.props.community_groupCodeActivityGroupStat.params}
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
            type: 'community_groupCodeActivityGroupStat/setParams',
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

    handleSearch = () => {
        let {params} = this.props.community_groupCodeActivityGroupStat
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
        this.resetList()
    }

    resetList = () => {
        const { list } = this.state
        let {params} = this.props.community_groupCodeActivityGroupStat
        let arr = []
        list.forEach((item, index) => {
            let dateTime = moment(item.day).format(DateFormat) + ' 00:00:00'
            if(moment(dateTime).isSame(params.start_time) || moment(dateTime).isBetween(params.start_time, params.end_time)) {
                arr.push(item)
            }
        })
        this.setState({
            _list: arr
        })
    }

    handleChangeFilter = (e) => {
        let val = e.target.value
        let stat = {}
        stat.filterValue = val
        if(val === 'qrcode_show_count') {
            stat.filterName = '群码展示次数'
        }else if(val === 'total_in_count') {
            stat.filterName = '总进群人数'
        }else if(val === 'members_count') {
            stat.filterName = '群成员总数'
        }
        this.setState({...stat})
    }

    handleChange(key, e) {
        let val = ''
        if(e && e.target) {
            val = e.target.value
        }else {
            val = e
        }
        let params = {...this.props.community_groupCodeActivityGroupStat.params}
        params[key] = val
        if(key === 'department_id') {
            params['user_id'] = undefined
            params['uin'] = undefined
        }else if(key === 'user_id') {
            params['uin'] = undefined
        }
        this.props.dispatch({
            type: 'community_groupCodeActivityGroupStat/setParams',
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
            range: value,
        })
    }

    setTimeParams = (days) => {
        const startTime = moment().subtract(days, 'days').format(DateFormat) + ' 00:00:00'
        let endTime = ''
        if(days === 1) {
            endTime = moment().subtract(days, 'days').format(DateFormat) + ' 23:59:59'
        }else {
            endTime = moment().format(DateFormat) + ' 23:59:59'
        }
        this.props.dispatch({
            type: 'community_groupCodeActivityGroupStat/setParams',
            payload: {
                params: {
                    start_time: startTime,
                    end_time: endTime,
                },
            },
        })
        const endDay = days === 1 ? moment().subtract(days, 'days') : moment()
        this.groupStatTime.setDate(moment().subtract(days, 'days'), endDay)
    }

    render() {
        const {params, chatroom} = this.props.community_groupCodeActivityGroupStat
        const { queryLoading } = this.props
        const { range, _list } = this.state

        const columns = [
            {
                title: '日期',
                dataIndex: 'day',
                key: 'day',
                className: styles.date,
                align: 'center',
            },
            {
                title: '群码展示次数',
                dataIndex: 'qrcode_show_count',
                key: 'qrcode_show_count',
                className: styles.showTimes,
                align: 'center',
            },
            {
                title: '总进群人数',
                dataIndex: 'total_in_count',
                key: 'total_in_count',
                className: styles.inCount,
                align: 'center',
            },
            {
                title: '群成员总数',
                dataIndex: 'members_count',
                key: 'members_count',
                className: styles.memberCount,
                align: 'center',
            },
        ]
        const getList = () => {
            let day, arr = []
            _list.forEach((item) => {
                day = ('' + item.day).substr(5, 5)
                arr.push({
                    '时间': day,
                    '数量': item[this.state.filterValue],
                    '类型': this.state.filterName,
                })
            })
            return arr.reverse()
        }
        const timeFormItemLayout = {
            labelCol: {span: 4},
            wrapperCol: {span: 20},
        }

        return (
            <div>
                <ContentHeader
                    contentType={'breadcrumb'}
                    content={
                        [
                            {
                                name: '群活动',
                                path: '/community/group_code'
                            },
                            {
                                name: '群列表',
                                path: `/community/group_code/group_list?group_activity_id=${this.state.group_activity_id}`
                            },
                            {
                                name: '群活动单群统计',
                            },
                        ]
                    }
                />
                <div className={styles.activityGroupStat}>
                    <div className={styles.header}>
                        <span>群名称：</span>
                        <EllipsisPopover lines={1} content={chatroom?.chatrooms_nickname} popoverContentClassName={styles.ellipsis}/>
                    </div>
                    <div className={styles.searchWrap}>
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
                                        maxRangeDays={30}
                                        maxToday={true}
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
                            <div className={styles.searchBtn}>
                                <Button type="primary" icon="search" onClick={this.handleSearch}>查询</Button>
                            </div>
                        </Row>
                    </div>
                    <div className={styles.lineWrap}>
                        <div className={styles.filterType}>
                            <RadioGroup value={this.state.filterValue} onChange={this.handleChangeFilter}>
                                <RadioButton value="qrcode_show_count">群码展示次数</RadioButton>
                                <RadioButton value="total_in_count">总进群人数</RadioButton>
                                <RadioButton value="members_count">群成员总数</RadioButton>
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
                    <div className={styles.tableWrap}>
                        <Table
                            columns={columns}
                            dataSource={_list}
                            size="middle"
                            rowKey={record => record.day}
                            loading={queryLoading}
                            pagination={false}
                        />
                    </div>
                </div>
            </div>
        )
    }
}
