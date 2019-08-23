import React from 'react'
import { Table, Button, Form, Radio, notification, Row, Col, Popover, Icon, Pagination, Input } from 'antd'
import {connect} from 'dva'
import moment from 'moment'
import 'moment/locale/zh-cn'
import config from 'community/common/config'
import DateRange from 'components/DateRange'
import ContentHeader from 'business/ContentHeader'
import EllipsisPopover from 'components/EllipsisPopover'
import _ from 'lodash'
import styles from './index.less'
import router from "umi/lib/router"
import documentTitleDecorator from 'hoc/documentTitle'
moment.locale('zh-cn')

const FormItem = Form.Item
const { pageSizeOptions, DateFormat } = config

@documentTitleDecorator({
    title: '群成员互动明细',
})
@connect(({ community_interaction_groupMemberStat, loading }) => ({
    community_interaction_groupMemberStat,
    queryLoading: loading.effects['community_interaction_groupMemberStat/query'],
}))
export default class extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            range: 'week',
            sortedInfo: null, // 升降序
        }
    }

    componentDidMount() {
        this.goPage(1)
    }

    componentWillUnmount() {
        this.resetParams()
    }

    resetParams = () => {
        this.props.dispatch({
            type: 'community_interaction_groupMemberStat/resetParams',
        })
    }

    resetSearch = () => {
        this.setState({range: 'week'})
        this.resetParams()
        setTimeout(() => {
            const { params } = this.props.community_interaction_groupMemberStat
            this.interactionStatTime.setDate(moment(params.start_time, DateFormat), moment(params.end_time, DateFormat))
            this.goPage(1)
        }, 0)
    }

    goPage = (page) => {
        if(typeof page === 'undefined') {
            page = this.props.community_interaction_groupMemberStat.current
        }
        this.props.dispatch({
            type: 'community_interaction_groupMemberStat/query',
            payload: {
                page: page,
                chatroomname: this.props.location?.query?.chatroomname,
            },
        })
    }

    handleSearch = () => {
        let {params} = this.props.community_interaction_groupMemberStat
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
            this.goPage(1)
        }, 100)
    }

    handleChangeDate = (startValue, endValue) => {
        let params = {...this.props.community_interaction_groupMemberStat.params}
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
            type: 'community_interaction_groupMemberStat/setParams',
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
        let params = {...this.props.community_interaction_groupMemberStat.params}
        params[key] = val
        this.props.dispatch({
            type: 'community_interaction_groupMemberStat/setParams',
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
                this.setTimeParams(7)
                break
            case 'month':
                this.setTimeParams(30)
                break
            default:
        }
        this.setState({
            range: value,
        })
    }

    setTimeParams = (days) => {
        const startTime = moment().subtract(days, 'days')
        const endTime = moment().subtract(1, 'days')
        this.props.dispatch({
            type: 'community_interaction_groupMemberStat/setParams',
            payload: {
                params: {
                    start_time: startTime.format(DateFormat) + ' 00:00:00',
                    end_time: endTime.format(DateFormat) + ' 23:59:59',
                },
            },
        })
        this.interactionStatTime.setDate(startTime, endTime)
    }

    goGroupMemberStat = (record) => {
        router.push({
            pathname: `/community/interaction_stat/group_member_stat?chatroomname=${record?.target?.username}`,
        })
    }

    handleChangeSize = (current, size) => {
        let params = {...this.props.community_interaction_groupMemberStat.params}
        params.limit = size
        this.props.dispatch({
            type: 'community_interaction_groupMemberStat/setProperty',
            payload: {params: params},
        })
        this.goPage(1)
    }

    handleTableChange = (pagination, filters, sorter) => {
        const field = sorter.field || '', order = sorter.order || ''
        const sortedInfo = {
            order: sorter.order,
            columnKey: sorter.field,
        }
        let params = {...this.props.community_interaction_groupMemberStat.params}
        let val = _.last(field.split('.'))
        if (order === 'descend') {
            params['order_by'] = `-${val}`
        } else {
            params['order_by'] = val
        }
        this.props.dispatch({
            type: 'community_interaction_groupMemberStat/query',
            payload: {
                chatroomname: this.props.location?.query?.chatroomname,
                params,
                page: 1,
            },
        })
        this.setState({sortedInfo})
    }
    resetSortedInfo = () => {
        this.setState({
            sortedInfo: null
        })
    }

    render() {
        const {  params, list, total, current, } = this.props.community_interaction_groupMemberStat
        const { range } = this.state
        const { queryLoading } = this.props

        let sortedInfo = this.state.sortedInfo || {}
        const columns = [
            {
                title: '微信昵称',
                dataIndex: 'nickname',
                className: styles.nickname,
                render: (text, record) => {
                    return  <span>{ text ? text : record?.username }</span>
                },
            },
            {
                title: '群昵称',
                dataIndex: 'remark_name',
                className: styles.groupNickname,
                render: (text, record) => {
                    return  <span>{ text ? text : record?.display_name ? record?.display_name : record?.nickname }</span>
                },
            },
            {
                title: '活跃天数',
                dataIndex: 'active_day',
                className: styles.activeDay,
                sorter: true,
                sortOrder: sortedInfo.columnKey === 'active_day' && sortedInfo.order,
            },
            {
                title: '消息总数',
                dataIndex: 'talk_count',
                className: styles.talkCount,
                sorter: true,
                sortOrder: sortedInfo.columnKey === 'talk_count' && sortedInfo.order,
            },
            {
                title: '违规次数',
                dataIndex: 'violation_count',
                className: styles.violationCount,
                sorter: true,
                sortOrder: sortedInfo.columnKey === 'violation_count' && sortedInfo.order,
            },
        ]

        const formItemLayout = {
            labelCol: {span: 6},
            wrapperCol: {span: 18},
        }

        return (
            <div>
                <ContentHeader
                    contentType={'breadcrumb'}
                    content={
                        [
                            {
                                name: '互动统计',
                                path: '/community/interaction_stat',
                            },
                            {
                                name: '群成员互动明细',
                            },
                        ]
                    }
                />
                <div className={styles.groupMemberStat}>
                    <div className={styles.currentGroupName}>
                        <span>群名称：</span>
                        <EllipsisPopover
                            lines={1}
                            content={this.props.location?.state?.target?.nickname || this.props.location?.state?.target?.display_name}
                            ellipsisClassName={styles.groupNameEllipsis}
                        />
                    </div>
                    <div className={styles.searchWrap}>
                        <Form>
                            <Row gutter={20}>
                                <Col span={8}>
                                    <FormItem
                                        {...formItemLayout}
                                        label="搜索："
                                        colon={false}
                                    >
                                        <Input
                                            placeholder="输入微信昵称，群昵称"
                                            value={params.query}
                                            onChange={(e) => {
                                                this.handleChange('query', e)
                                            }}
                                            onPressEnter={this.handleSearch}/>
                                    </FormItem>
                                </Col>
                                <Col span={8}>
                                    <FormItem {...formItemLayout} label="日期：" colon={false}>
                                        <DateRange
                                            {...this.props}
                                            ref={(ref) => this.interactionStatTime = ref}
                                            startValue={params.start_time ? moment(params.start_time, DateFormat) : ''}
                                            endValue={params.end_time ? moment(params.end_time, DateFormat) : ''}
                                            onChange={this.handleChangeDate}
                                            maxRangeDays={90}
                                            ago={1}
                                        />
                                    </FormItem>
                                </Col>
                                <Col span={8}>
                                    <FormItem {...formItemLayout} label=" " colon={false}>
                                        <Radio.Group
                                            value={range}
                                            onChange={this.handleChangeTimeRange}
                                        >
                                            <Radio.Button value="yesterday">昨日</Radio.Button>
                                            <Radio.Button value="week">近7日</Radio.Button>
                                            <Radio.Button value="month">近30日</Radio.Button>
                                        </Radio.Group>
                                    </FormItem>
                                </Col>
                            </Row>
                            <Row gutter={20} className={styles.operateBtn}>
                                <Col span={8}>
                                    <Col offset={6}>
                                        <Button type="primary" icon="search" onClick={this.handleSearch}>搜索</Button>
                                        <Button onClick={this.resetSearch}>重置</Button>
                                    </Col>
                                </Col>
                            </Row>
                        </Form>
                    </div>
                    <div className={styles.tableWrap}>
                        <Table
                            columns={columns}
                            dataSource={list}
                            size="middle"
                            rowKey={(record, index) => index}
                            loading={queryLoading}
                            pagination={false}
                            onChange={this.handleTableChange}
                        />
                        {list.length ?
                            <Pagination
                                className="ant-table-pagination"
                                total={total}
                                current={current}
                                showQuickJumper={true}
                                pageSizeOptions={pageSizeOptions}
                                showTotal={total => `共 ${total} 条`}
                                pageSize={params.limit}
                                showSizeChanger={true}
                                onShowSizeChange={this.handleChangeSize}
                                onChange={this.goPage}
                            />
                            : ''}
                    </div>
                </div>
            </div>
        )
    }
}
