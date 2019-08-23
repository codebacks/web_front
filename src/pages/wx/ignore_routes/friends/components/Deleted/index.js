'use strict'

/**
 * 文件说明: 删除记录
 * ----------------------------------------
 * 创建用户: liyan [randonely@gmail.com]
 * 创建日期: 18/12/26
 */
import React, {Component} from 'react'
import {Table, Form, Input, Select, Button, Row, Col, Popover} from 'antd'
import {connect} from 'dva'
import moment from 'moment'
import config from 'wx/common/config'
import Helper from 'wx/utils/helper'
import DateRange from 'components/DateRange'
import DepartmentSelect from 'components/business/DepartmentSelect'
import UserSelect from 'components/business/UserSelect'
import WeChatSelectSingle from 'components/business/WeChatSelectSingle'
import styles from './index.scss'

const FormItem = Form.Item
const Search = Input.Search
const Option = Select.Option

const {DateFormat, DateTimeFormat, DefaultAvatar, pageSizeOptions} = config

const reasonMap = new Map([
    [1, '重复好友'],
    [2, '智能清粉（僵尸好友）'],
    [3, '牛客服手动删除'],
    [4, '未知']
])

@connect(({ base, wx_friends_deleted, loading }) => ({
    base,
    wx_friends_deleted,
    friendsLoading: loading.effects['wx_friends_deleted/list']
}))
export default class extends Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {
        this.handleSearch()
    }

    handleChange = (key, e) => {
        let val = ''
        if (e && e.target) {
            val = e.target.value
        } else {
            val = e
        }
        let params = {...this.props.wx_friends_deleted.params}
        params[key] = val
        if (key === 'department_id') {
            params['user_id'] = undefined
        }
        this.props.dispatch({
            type: 'wx_friends_deleted/setParams',
            payload: {params: params},
        })
    }



    handleTimeChange = (startValue, endValue) => {
        let params = {...this.props.wx_friends_deleted.params}
        startValue = startValue ? moment(startValue).format(DateFormat) + ' 00:00:00' : ''
        endValue = endValue ? moment(endValue).format(DateFormat) + ' 23:59:59' : ''
        params.start_time = startValue
        params.end_time = endValue
        this.props.dispatch({
            type: 'wx_friends_deleted/setParams',
            payload: {params: params},
        })
    }

    goPage = (page) => {
        this.props.dispatch({
            type: 'wx_friends_deleted/list',
            payload: {page: page}
        })
    }

    handleChangeSize = (current, size) => {
        let params = {...this.props.wx_friends_deleted.params}
        params.limit = size
        this.props.dispatch({
            type: 'wx_friends_deleted/setParams',
            payload: {params: params},
        })
        this.goPage(1)
    }

    handleSearch = () => {
        this.goPage(1)
    }

    resetParams = () => {
        this.props.dispatch({
            type: 'wx_friends_deleted/resetParams',
        })
        this.deletedTime.setDate(null, null)
    }

    resetSearch = () => {
        this.resetParams()
        setTimeout(() => {
            this.goPage(1)
        }, 0)
    }

    render() {
        const columns = [
            {
                title: '头像',
                dataIndex: 'head_img_url',
                className: styles.firstColumn,
                render: (url) => {
                    return <img src={Helper.getWxThumb(url)} className={styles.avatar}
                        onError={(e) => {e.target.src = DefaultAvatar}}
                        rel="noreferrer"
                        alt=""
                    />
                }
            },
            {
                title: '微信备注',
                dataIndex: 'remark',
                className: styles.weChatColumn,
            },
            {
                title: '微信号',
                dataIndex: 'username',
                className: styles.weChatColumn,
            },
            {
                title: '微信昵称',
                dataIndex: 'nickname',
                className: styles.weChatColumn,
                render: (text) => {
                    return <span style={{whiteSpace: 'pre-wrap'}}>{text}</span>
                }
            },
            {
                title: '所属员工',
                dataIndex: 'belong_user',
            },
            {
                title: '所属微信',
                dataIndex: 'belong_wechat_nick',
                render: (nickname, record) => {
                    return record.belong_wx_remark || nickname
                }
            },
            {
                title: '删除时间',
                dataIndex: 'delete_time',
                render: (timestamp) => {
                    if (timestamp) {
                        return moment(timestamp*1000).format(DateTimeFormat)
                    }
                }
            },
            {
                title: '操作人',
                dataIndex: 'operator',
            },
            {
                title: '删除来源',
                dataIndex: 'reason',
                render: (reason) => {
                    if(reason === 4) {
                        return <Popover
                            title={null}
                            content={<div className={styles.wholeDesc}>通过手机微信或者pc微信客户端删除的好友</div>}
                            trigger="hover">未知</Popover>
                    }
                    return reasonMap.get(reason)
                }
            },
        ]

        const formItemLayout = {
            labelCol: {span: 8},
            wrapperCol: {span: 16},
        }

        const timeFormItemLayout = {
            labelCol: {span: 6},
            wrapperCol: {span: 14},
        }

        const {friendsLoading} = this.props
        const {params, list, total, current} = this.props.wx_friends_deleted

        const getReasonOption = () => {
            let options = []
            reasonMap.forEach((value, key) => {
                options.push(<Option key={key} value={key}>{value}</Option>)
            })
            return options
        }

        return (
            <div className={styles.deletedWrapper}>
                <Form className={styles.searchWrap}>
                    <Row gutter={20}>
                        <Col span={7}>
                            <FormItem {...formItemLayout}
                                label="搜索："
                                colon={false}
                            >
                                <Search
                                    placeholder="输入昵称、备注或微信号"
                                    value={params.query}
                                    onChange={(e)=>{this.handleChange('query', e)}}
                                    onSearch={this.handleSearch}
                                />
                            </FormItem>
                        </Col>
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
                    </Row>
                    <Row gutter={20}>
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
                        <Col span={7}>
                            <FormItem {...formItemLayout} label="操作人：" colon={false}>
                                <UserSelect
                                    userId={params.operator}
                                    onChange={(value) => {
                                        this.handleChange('operator', value)
                                    }}
                                />
                            </FormItem>
                        </Col>
                        <Col span={10}>
                            <FormItem {...timeFormItemLayout} label="删除时间：" colon={false}  className={styles.timeItem}>
                                <DateRange
                                    ref={(ref) => this.deletedTime = ref}
                                    {...this.props}
                                    maxToday={true}
                                    startPlaceholder="删除时间"
                                    endPlaceholder="删除时间"
                                    startValue={params.start_time ? moment(params.start_time, DateFormat) : ''}
                                    endValue={params.end_time ? moment(params.end_time, DateFormat) : ''}
                                    onChange={(startValue, endValue)=>{this.handleTimeChange(startValue, endValue)}}
                                />
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={20}>
                        <Col span={7}>
                            <FormItem {...formItemLayout} label={'删除来源：'} colon={false}>
                                <Select placeholder={'全部'}
                                    value={params.reason}
                                    onChange={(e) => this.handleChange('reason', e)}
                                >
                                    <Option value={''}>全部</Option>
                                    {getReasonOption()}
                                </Select>
                            </FormItem>
                        </Col>
                    </Row>
                    <Row className={styles.searchBtn} gutter={20}>
                        <Col span={7}>
                            <Col offset={8}>
                                <Button type="primary" icon="search" onClick={this.handleSearch}>搜索</Button>
                                <Button onClick={this.resetSearch}>重置</Button>
                            </Col>
                        </Col>
                    </Row>
                </Form>
                <div className={styles.tableWrap}>
                    <Table
                        columns={columns}
                        dataSource={list}
                        size="middle"
                        loading={friendsLoading}
                        rowKey={(record, index) => index}
                        pagination={
                            list.length ? {
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
                            } : false
                        }
                    />
                </div>
            </div>
        )
    }
}
