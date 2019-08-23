'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: liyan [randonely@gmail.com]
 * 创建日期: 18/10/11
 */
import React from 'react'
import {Form, Table, Button, Radio, Row, Col, notification, Pagination} from 'antd'
import {connect} from 'dva'
import ContentHeader from 'components/business/ContentHeader'
import documentTitleDecorator from 'hoc/documentTitle'
import 'moment/locale/zh-cn'
import moment from 'moment'
import config from 'data/common/config'
import styles from './index.scss'
import DateRange from '../components/DateRange'
import DepartmentSelect from 'components/business/DepartmentSelect'
import UserSelect from 'components/business/UserSelect'
import Desc from '../components/Desc/index'

moment.locale('zh-cn')

const FormItem = Form.Item

const {DateFormat, pageSizeOptions} = config

@connect(({base, data_performance_friends, loading}) => ({
    base, data_performance_friends,
    taskIdLoading: loading.effects['data_performance_friends/exportTask'],
}))
@documentTitleDecorator()
export default class extends React.Component {
    constructor(props) {
        super()
        this.state = {
            viewValue: 'user',
            params: {},
            range: 'week',
        }
        this.timer = 0
    }
    componentDidMount() {
        this._isMounted = true
        this.loadData()
    }

    componentWillUnmount() {
        this._isMounted = false
        clearTimeout(this.timer)
        this.resetParams()
    }

    resetParams = () => {
        this.props.dispatch({
            type: 'data_performance_friends/resetParams',
        })
    }

    loadData = (params) => {
        params = params || {...this.props.data_performance_friends.params}
        this.setState({
            params: params
        })
        this.goPage(1)
    }

    handleChangeDate = (startValue, endValue) => {
        let params = {...this.props.data_performance_friends.params}
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
            type: 'data_performance_friends/setParams',
            payload: {params: params}
        })
    }

    setTimeRange = (startValue, endValue) => {
        let range = ''
        let onDayAgo = moment().subtract(1, 'days')
        if (onDayAgo.isSame(startValue, 'day')
            && onDayAgo.isSame(endValue, 'day')) {
            range = 'yesterday'
        } else if (moment().subtract(7, 'days').isSame(startValue, 'day')
            && onDayAgo.isSame(endValue, 'day')) {
            range = 'week'
        } else if (moment().subtract(30, 'days').isSame(startValue, 'day')
            && onDayAgo.isSame(endValue, 'day')) {
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
        let params = {...this.props.data_performance_friends.params}
        params[key] = val
        if (key === 'department_id') {
            params['user_id'] = undefined
        }
        this.props.dispatch({
            type: 'data_performance_friends/setParams',
            payload: {params: params},
        })
    }

    handleSearch = () => {
        let params = {...this.props.data_performance_friends.params}
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
        this.loadData(params)
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
            range: value
        })
    }

    setTimeParams = (days) => {
        const startTime = moment().subtract(days, 'days')
        const endTime = moment().subtract(1, 'days')
        this.props.dispatch({
            type: 'data_performance_friends/setParams',
            payload: {
                params: {
                    start_time: startTime.format(DateFormat) + ' 00:00:00',
                    end_time: endTime.format(DateFormat) + ' 23:59:59'
                }
            }
        })
        this.refs.saleTime.setDate(startTime, endTime)
    }

    handleChangeView = (e) => {
        let val = e.target.value
        let params = {...this.props.data_performance_friends.params}
        params['by_wechat'] = val === 'user' ? undefined : 1
        this.props.dispatch({
            type: 'data_performance_friends/setParams',
            payload: {params: params}
        })
        this.loadData(params)
    }

    handleTableChange = (pagination, filters, sorter) => {
        let params = {...this.props.data_performance_friends.params}
        params['order_column'] = sorter.field
        params['order_dir'] = sorter.order.replace('end', '')
        this.props.dispatch({
            type: 'data_performance_friends/setProperty',
            payload: {params: params},
        })
        this.goPage(1)
    }

    handleChangeSize = (current, size) => {
        let params = {...this.props.data_performance_friends.params}
        params.limit = size
        this.props.dispatch({
            type: 'data_performance_friends/setProperty',
            payload: {params: params},
        })
        this.goPage(1)
    }

    goPage = (page) => {
        this.props.dispatch({
            type: 'data_performance_friends/query',
            payload: {page: page}
        })
    }

    getPercent = (data) => {
        let percent = this.accMul(parseFloat(data), 100)
        if (Math.round(percent) === Number(percent)) {
            return `${percent}%`
        }
        return `${percent.toFixed(2)}%`
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

    handleExport = () => {
        this.getExportId()
    }

    getExportId = () => {
        let params = {...this.state.params}
        params = JSON.parse(JSON.stringify(params, (key, value) => {
            if (key === 'limit' || key === 'offset') {
                return undefined
            } else {
                return value
            }
        }))
        this.props.dispatch({
            type: 'data_performance_friends/exportTask',
            payload: {
                params: params
            },
            callback: (data) => {
                const taskId = data.task_id
                this.exportExcel(taskId)
            }
        })
    }

    exportExcel = (taskId) => {
        this.setState({exportLoading: true})
        this.props.dispatch({
            type: 'data_performance_friends/exportExcel',
            payload: {
                taskId: taskId
            },
            callback: (res) => {
                if (this._isMounted) {
                    if (res.status >= 200 && res.status < 300) {
                        let responseCopy = res.clone()
                        res.json().then((res)=>{
                            if(res.data.state === 'PENDING') {
                                this.timer = setTimeout(() => {
                                    this.exportExcel(taskId)
                                }, 1000)
                            } else {
                                this.setState({exportLoading: false})
                            }
                        }).catch((err)=>{
                            responseCopy.blob().then((blob) => {
                                this.setState({exportLoading: false})
                                const url = URL.createObjectURL(blob)
                                let a = document.createElement('a')
                                a.download = `好友统计数据导出-${moment().format(DateFormat)}`
                                a.href = url
                                a.style.display = 'none'
                                document.body.appendChild(a)
                                a.click()
                                document.body.removeChild(a)
                            }).catch((err) => {
                                this.setState({exportLoading: false})
                                console.error(err)
                            })
                        })
                    } else {
                        // res.error.response.status === 500
                        this.setState({exportLoading: false})
                    }
                }
            }
        })
    }

    render() {
        const baseColumns = [{
            title: '好友数',
            dataIndex: 'friend_count',
            key: 'friend_count',
        },
        {
            title: '好友净增',
            dataIndex: 'new_friend_count',
            key: 'new_friend_count',
        },
        {
            title: '关联好友数',
            dataIndex: 'customer_count',
            key: 'customer_count',
        },
        {
            title: '关联好友净增',
            dataIndex: 'new_customer_count',
            key: 'new_customer_count',
        },
        {
            title: '关联比例',
            dataIndex: 'customer_ratio',
            key: 'customer_ratio',
            render: (text, record, index) => {
                return this.getPercent(text)
            }
        },
        {
            title: '群总数',
            dataIndex: 'chatroom_count',
            key: 'chatroom_count',
        },
        {
            title: '群净增',
            dataIndex: 'new_chatroom_count',
            key: 'new_chatroom_count',
        },
        {
            title: '群成员数',
            dataIndex: 'member_count',
            key: 'member_count',
        },
        {
            title: '群成员净增',
            dataIndex: 'new_member_count',
            key: 'new_member_count',
        },
        ]

        const baseOnUserColumns = [{
            title: '员工',
            dataIndex: 'nickname',
            key: 'nickname',
        },
        {
            title: '绑定微信号数',
            dataIndex: 'wechat_count',
            key: 'wechat_count',
        },
        ...baseColumns
        ]

        const baseOnWeChatColumns = [{
            title: '员工',
            dataIndex: 'nickname',
            key: 'nickname',
        },
        {
            title: '所属微信',
            dataIndex: 'wechat_remark',
            key: 'wechat_remark',
            render: (text, record, index) => {
                return text || record.wechat_nickname
            }
        },
        ...baseColumns
        ]

        const desc = [
            {
                label: '好友数',
                text: '在筛选时间内，最后一天的好友总数'
            },
            {
                label: '好友净增',
                text: '在筛选时间内，最后一天的好友总数 - 第一天的好友总数'
            },
            {
                label: '关联好友数',
                text: '在筛选时间内，最后一天关联购物账号的好友总数'
            },
            {
                label: '关联好友净增',
                text: '在筛选时间内，最后一天关联购物账号的好友总数 - 第一天关联购物账号的好友总数'
            },
            {
                label: '关联比例',
                text: '关联好友数/好友数*100%'
            },
            {
                label: '群总数',
                text: '在筛选时间内，最后一天的群总数'
            },
            {
                label: '群净增',
                text: '在筛选时间内，最后一天的群总数 - 第一天的群总数'
            },
            {
                label: '群成员数',
                text: '在筛选时间内，最后一天的群成员总数'
            },
            {
                label: '群成员净增',
                text: '在筛选时间内，最后一天的群成员总数 - 第一天的群成员总数'
            },
        ]

        const formItemLayout = {
            labelCol: {span: 8},
            wrapperCol: {span: 16},
        }

        const timeFormItemLayout = {
            labelCol: {span: 4},
            wrapperCol: {span: 20},
        }

        const {params, list, loading, total, current} = this.props.data_performance_friends
        const {range, exportLoading} = this.state
        const {taskIdLoading} = this.props

        return (
            <div className={styles.friends}>
                <ContentHeader
                    contentType={'title'}
                    content={{
                        title: this.props.documentTitle,
                    }}
                    help={{
                        url: 'http://newhelp.51zan.cn/manual/content/%E6%95%B0%E6%8D%AE%E4%B8%AD%E5%BF%83/%E7%BB%A9%E6%95%88%E6%8A%A5%E8%A1%A8.md'
                    }}
                />
                <div className={styles.customer}>
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
                        </Row>
                        <Row gutter={20}>
                            <Col span={11} style={{marginLeft: '19px'}}>
                                <FormItem {...timeFormItemLayout} label="日期：" colon={false}>
                                    <DateRange {...this.props}
                                        ref="saleTime"
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
                    </div>
                    <div className={styles.viewWrap}>
                        <div className={styles.filterType}>
                            <div>
                                <Radio.Group value={params.by_wechat ? 'wechat' : 'user'}
                                    onChange={this.handleChangeView}
                                >
                                    <Radio.Button value="user">按员工查看</Radio.Button>
                                    <Radio.Button value="wechat">按微信号查看</Radio.Button>
                                </Radio.Group>
                                <Desc desc={desc}/>
                            </div>
                            <Button className={styles.export} icon={taskIdLoading || exportLoading ? "loading" : 'download'}
                                onClick={this.handleExport}
                                disabled={taskIdLoading || exportLoading}
                            >导出数据</Button>
                        </div>
                        <div className={styles.tableWrap}>
                            <Table
                                dataSource={list}
                                loading={loading}
                                columns={params.by_wechat ?  baseOnWeChatColumns : baseOnUserColumns}
                                rowKey={(record, index) => index}
                                // onChange={this.handleTableChange}
                                pagination={false}
                            />
                            { list.length ? <Pagination
                                className="ant-table-pagination"
                                total={total}
                                current={current}
                                showQuickJumper={true}
                                pageSizeOptions={pageSizeOptions}
                                showTotal={total => `共${total}条`}
                                pageSize={params.limit}
                                showSizeChanger={true}
                                onShowSizeChange={this.handleChangeSize}
                                onChange={this.goPage}
                            /> : ''
                            }
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
