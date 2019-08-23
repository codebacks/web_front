import React from 'react'
import { Table, Button, Form, Radio, notification, Row, Col, Popover, Icon, Alert, Pagination, Input } from 'antd'
import {connect} from 'dva'
import moment from 'moment'
import 'moment/locale/zh-cn'
import config from 'community/common/config'
import DateRange from 'components/DateRange'
import DepartmentSelect from 'components/business/DepartmentSelect/index'
import UserSelect from 'components/business/UserSelect/index'
import WeChatSelectSingle from 'components/business/WeChatSelectSingle/index'
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
    title: '按群统计',
})
@connect(({ community_interaction_byGroupStat, loading }) => ({
    community_interaction_byGroupStat,
    queryLoading: loading.effects['community_interaction_byGroupStat/query'],
}))
export default class extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            range: 'week',
            sortedInfo: null, // 升降序
            isExportLoading: false, // 导出数据
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
            type: 'community_interaction_byGroupStat/resetParams',
        })
    }

    resetSearch = () => {
        this.setState({range: 'week'})
        this.resetParams()
        setTimeout(() => {
            const { params } = this.props.community_interaction_byGroupStat
            this.interactionStatTime.setDate(moment(params.start_time, DateFormat), moment(params.end_time, DateFormat))
            this.goPage(1)
        }, 0)
    }

    goPage = (page) => {
        if(typeof page === 'undefined') {
            page = this.props.community_interaction_byGroupStat.current
        }
        this.props.dispatch({
            type: 'community_interaction_byGroupStat/query',
            payload: {
                page: page,
            },
        })
    }

    handleSearch = () => {
        let {params} = this.props.community_interaction_byGroupStat
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
        let params = {...this.props.community_interaction_byGroupStat.params}
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
            type: 'community_interaction_byGroupStat/setParams',
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
        let params = {...this.props.community_interaction_byGroupStat.params}
        params[key] = val
        if(key === 'department_id') {
            params['user_id'] = undefined
            params['uin'] = undefined
        }else if(key === 'user_id') {
            params['uin'] = undefined
        }
        this.props.dispatch({
            type: 'community_interaction_byGroupStat/setParams',
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
            type: 'community_interaction_byGroupStat/setParams',
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
            pathname: `/community/interaction_stat/group_member_stat`,
            query: {
                chatroomname: record?.target?.username,
            },
            state: {
                target: record?.target,
            }
        })
    }

    handleChangeSize = (current, size) => {
        let params = {...this.props.community_interaction_byGroupStat.params}
        params.limit = size
        this.props.dispatch({
            type: 'community_interaction_byGroupStat/setProperty',
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
        let params = {...this.props.community_interaction_byGroupStat.params}
        let val = _.last(field.split('.'))
        if (order === 'descend') {
            params['order_by'] = `-${val}`
        } else {
            params['order_by'] = val
        }
        this.props.dispatch({
            type: 'community_interaction_byGroupStat/query',
            payload: {
                params,
                page: 1
            },
        })
        this.setState({sortedInfo})
    }
    resetSortedInfo = () => {
        this.setState({
            sortedInfo: null
        })
    }

    exportExcel = () => {
        const { params } = this.props.community_interaction_byGroupStat

        this.setState({isExportLoading: true})
        this.props.dispatch({
            type: 'community_interaction_byGroupStat/exportExcel',
            payload: {
                params: {
                    query: params?.query,
                    department_id: params?.department_id,
                    user_id: params?.user_id,
                    uin: params?.uin,
                    start_time: params?.start_time,
                    end_time: params?.end_time,
                }
            },
            callback: (res) => {
                if (res.status >= 200 && res.status < 300) {
                    res.blob().then((r) => {
                        this.setState({isExportLoading: false})
                        const blob = new Blob([r], {type: 'application/vnd.ms-excel'})
                        const url = URL.createObjectURL(blob) // 创建一个URL指向blob/file文件
                        let a = document.createElement('a')
                        a.download = `按群统计-${moment().format(DateFormat)}.xls`
                        a.href = url
                        a.style.display = 'none'
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a)
                    })
                } else {
                    this.setState({isExportLoading: false})
                }
            }
        })
    }

    render() {
        const {  params, list, total, current, } = this.props.community_interaction_byGroupStat
        const { range, isExportLoading } = this.state
        const { queryLoading } = this.props

        let sortedInfo = this.state.sortedInfo || {}
        const columns = [
            {
                title: '群名称',
                dataIndex: 'target.nickname',
                className: styles.groupName,
                render: (text, record) => {
                    return  <EllipsisPopover content={text ? text : record.target.display_name} lines={2} ellipsisClassName={styles.shouGroupName}/>
                },
            },
            {
                title: '群主',
                dataIndex: 'target.owner.nickname',
                className: styles.groupOwner,
                render: (text, record) => {
                    return <div>
                        <div className={styles.name}>微信昵称：{text}</div>
                        <div className={styles.name}>微信号：{record?.target?.owner?.alias ? record?.target?.owner?.alias: record?.target?.owner?.username}</div>
                        {
                            record.target.owner?.is_staff ? <div className={styles.stuffTag}>员工号</div> : null
                        }
                    </div>
                },
            },
            {
                title: '所属部门',
                dataIndex: 'from.user.departments',
                className: styles.deptColumn,
                render: (text, record, index) => {
                    if(record.from.user && record.from.user.departments) {
                        let departments = record.from.user.departments
                        let content = ''
                        if(departments && departments.length) {
                            content = departments.map((item) => {
                                return item.name
                            }).join('，')
                            return <Popover
                                placement="topLeft"
                                content={<p className={styles.wholeDept}>{content}</p>}
                                title={null}
                                trigger="hover"
                            >
                                <div className={styles.dept}>{content}</div>
                            </Popover>
                        }
                    }
                    return ''
                },
            },
            {
                title: '所属员工',
                dataIndex: 'from.user.nickname',
                className: styles.forWx,
                render: (text, record, index) => {
                    if(record.from.user) {
                        return record.from.user.nickname
                    }
                },
            },
            {
                title: '所属微信',
                dataIndex: 'from.nickname',
                className: styles.forWx,
                render: (text, record) => {
                    return <span>{record.from.remark ? record.from.remark : text}</span>
                },
            },
            {
                title: '群消息数',
                dataIndex: 'talk_count',
                className: styles.talkCount,
                align: 'center',
                sorter: true,
                sortOrder: sortedInfo.columnKey === 'talk_count' && sortedInfo.order,
            },
            {
                title: '发言人数',
                dataIndex: 'talk_member_count',
                className: styles.talkMemberCount,
                align: 'center',
                sorter: true,
                sortOrder: sortedInfo.columnKey === 'talk_member_count' && sortedInfo.order,
            },
            {
                title: '发言比例',
                dataIndex: 'chatroom_talk_ratio',
                className: styles.chatroomTalkRatio,
                align: 'center',
                render: (text, record) => {
                    return (
                        <span>{`${text && text.toFixed(2)}%`}</span>
                    )
                },
            },
            {
                title: '操作',
                className: styles.operation,
                render: (text, record) => {
                    return (
                        <div className={styles.canEdit} onClick={() => this.goGroupMemberStat(record)}>明细</div>
                    )
                },
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
                                name: '按群统计',
                            },
                        ]
                    }
                />
                <div className={styles.byGroupStat}>
                    <Alert
                        className={styles.alert}
                        type="info"
                        showIcon
                        message="统计已设为工作群的群聊数据，以最新同步的员工微信号为统计标准去除重复群，统计可查看日期从前一天开始，当日数据需等第二天查看，统计数据保留90天"
                    />
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
                                            placeholder="输入群名称、备注"
                                            value={params.query}
                                            onChange={(e) => {
                                                this.handleChange('query', e)
                                            }}
                                            onPressEnter={this.handleSearch}/>
                                    </FormItem>
                                </Col>
                                <Col span={8}>
                                    <FormItem {...formItemLayout} label="所属部门：" colon={false}>
                                        <DepartmentSelect
                                            departmentId={params.department_id}
                                            onChange={(value) => {
                                                this.handleChange('department_id', value)
                                            }}
                                        />
                                    </FormItem>
                                </Col>
                                <Col span={8}>
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
                            </Row>
                            <Row gutter={20}>
                                <Col span={8}>
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
                    <div className={styles.btns}>
                        <Button className={styles.btn} type="primary" onClick={this.exportExcel} loading={isExportLoading}>导出数据</Button>
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
