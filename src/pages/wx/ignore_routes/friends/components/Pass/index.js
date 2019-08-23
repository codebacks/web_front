'use strict'

/**
 * 文件说明: 通过记录
 * ----------------------------------------
 * 创建用户: liyan [randonely@gmail.com]
 * 创建日期: 18/11/13
 */
import React from 'react'
import {Table, Form, Input, Checkbox, Button, Row, Col, Badge, Popover} from 'antd'
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
const CheckboxGroup = Checkbox.Group

const {DateFormat, DateTimeFormat, DefaultAvatar, pageSizeOptions, Sex} = config

@connect(({ base, wx_friends_pass, loading }) => ({
    base,
    wx_friends_pass,
    friendsLoading: loading.effects['wx_friends_pass/list']
}))
export default class extends React.Component {
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
        let params = {...this.props.wx_friends_pass.params}
        params[key] = val
        if (key === 'department_id') {
            params['user_id'] = undefined
        }
        this.props.dispatch({
            type: 'wx_friends_pass/setParams',
            payload: {params: params},
        })
    }



    handleTimeChange = (startValue, endValue) => {
        let params = {...this.props.wx_friends_pass.params}
        startValue = startValue ? moment(startValue).format(DateFormat) + ' 00:00:00' : ''
        endValue = endValue ? moment(endValue).format(DateFormat) + ' 23:59:59' : ''
        params.start_time = startValue
        params.end_time = endValue
        this.props.dispatch({
            type: 'wx_friends_pass/setParams',
            payload: {params: params},
        })
    }

    handleCheckAllChange = (e) => {
        let params = {...this.props.wx_friends_pass.params}
        let status = {...params.status}
        let checkedAll = e.target.checked
        if(checkedAll) {
            Object.keys(status).forEach((k) => {
                if (!status[k]) {
                    status[k] = 1
                }
            })
        } else {
            Object.keys(status).forEach((k) => {
                if (status[k]) {
                    status[k] = undefined
                }
            })
        }
        params.status = status
        this.props.dispatch({
            type: 'wx_friends_pass/setProperty',
            payload: {
                params: params,
                checkedAll: checkedAll
            },
        })
    }

    handleStatusChange = (values) => {
        let params = {...this.props.wx_friends_pass.params}
        let status = {...params.status}
        Object.keys(status).forEach((k) => {
            if (values.includes(k)) {
                status[k] = 1
            } else {
                status[k] = undefined
            }
        })
        params.status = status
        this.props.dispatch({
            type: 'wx_friends_pass/setProperty',
            payload: {
                params: params,
                checkedAll: this.isCheckedAll(status)
            },
        })
    }

    isCheckedAll = (status) => {
        return Object.keys(status).every((k) => {
            return !!status[k]
        })
    }

    getStatusList = (status) => {
        return Object.keys(status).filter((k) => {
            return status[k]
        })
    }

    goPage = (page) => {
        this.props.dispatch({
            type: 'wx_friends_pass/list',
            payload: {page: page}
        })
    }

    handleChangeSize = (current, size) => {
        let params = {...this.props.wx_friends_pass.params}
        params.limit = size
        this.props.dispatch({
            type: 'wx_friends_pass/setParams',
            payload: {params: params},
        })
        this.goPage(1)
    }

    handleSearch = () => {
        this.goPage(1)
    }

    resetParams = () => {
        this.props.dispatch({
            type: 'wx_friends_pass/resetParams',
        })
        this.props.dispatch({
            type: 'wx_friends_pass/setProperty',
            payload: {checkedAll: false},
        })
        this.applyTime.setDate(null, null)
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
                render: (text, record) => {
                    return <img src={Helper.getWxThumb(text)} className={styles.avatar}
                        onError={(e) => {e.target.src = DefaultAvatar}}
                        rel="noreferrer"
                        alt=""
                    />
                }
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
                title: '微信号',
                dataIndex: 'username',
                className: styles.weChatColumn,
            },
            {
                title: '性别',
                dataIndex: 'sex',
                className: styles.sexColumn,
                render: (text, record) => {
                    const sex = parseInt(text, 10)
                    return sex ? Sex[sex] : '未知'
                }
            },
            {
                title: '留言',
                dataIndex: 'content',
                className: styles.contentColumn,
            },
            {
                title: '添加微信',
                dataIndex: 'belonged_wx',
                className: styles.weChatColumn,
                render: (text) => {
                    return <span style={{whiteSpace: 'pre-wrap'}}>{text}</span>
                }
            },
            {
                title: '来源',
                dataIndex: 'source',
                render: (text, record) => {
                    return Helper.getFriendSource(text)
                }
            },
            {
                title: '申请时间',
                dataIndex: 'create_time',
                render: (text) => {
                    if (text) {
                        return moment(text).format(DateTimeFormat)
                    }
                }
            },
            {
                title: '状态',
                dataIndex: 'status',
                className: styles.statusColumn,
                render: (text, record) => {
                    let status
                    switch (text) {
                        case '已通过': status = <Badge status="success" text="已通过" />
                            break
                        case '未处理': status = <Badge status="default" text="未处理" />
                            break
                        case '未通过': status = <Badge status="error" text="未通过" />
                            break
                        case '已忽略': status = <Badge status="default" text="已忽略" />
                            break
                        case '已删除': status = <Badge status="default" text="已删除" />
                            break
                        case '已过期': status = <Badge status="default" text="已过期" />
                            break
                        default:
                    }
                    return <div>{status}<p>{record.info}</p></div>
                }
            },
        ]

        const formItemLayout = {
            labelCol: {span: 8},
            wrapperCol: {span: 16},
        }

        const timeFormItemLayout = {
            labelCol: {span: 4},
            wrapperCol: {span: 16},
        }

        const checkboxFormItemLayout = {
            labelCol: {span: 2},
            wrapperCol: {span: 16},
        }

        const {friendsLoading} = this.props
        const {params, list, total, current, checkedAll} = this.props.wx_friends_pass

        return (
            <div>
                <Form className={styles.searchWrap}>
                    <Row gutter={20}>
                        <Col span={7}>
                            <FormItem {...formItemLayout}
                                label="搜索："
                                colon={false}
                            >
                                <Search
                                    placeholder="输入昵称、微信号"
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
                        <Col span={14} style={{marginLeft: '-3px'}}>
                            <FormItem {...timeFormItemLayout} label="申请时间：" colon={false}>
                                <DateRange
                                    ref={(ref) => this.applyTime = ref}
                                    {...this.props}
                                    maxToday={true}
                                    startPlaceholder="申请时间"
                                    endPlaceholder="申请时间"
                                    startValue={params.start_time ? moment(params.start_time, DateFormat) : ''}
                                    endValue={params.end_time ? moment(params.end_time, DateFormat) : ''}
                                    onChange={(startValue, endValue)=>{this.handleTimeChange(startValue, endValue)}}
                                />
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={20}>
                        <FormItem {...checkboxFormItemLayout} label="状态：" colon={false}>
                            <Checkbox style={{ marginLeft: '18px'}}
                                checked={checkedAll}
                                onChange={this.handleCheckAllChange}
                            >全部</Checkbox>
                            <CheckboxGroup value={this.getStatusList(params.status)}
                                onChange={this.handleStatusChange}
                            >
                                <Checkbox value="is_passed">已通过</Checkbox>
                                <Checkbox value="not_passed">未通过</Checkbox>
                                <Checkbox value="not_handled">未处理</Checkbox>
                                <Checkbox value="expired">已过期</Checkbox>
                                <Checkbox value="is_ignored">已忽略</Checkbox>
                                <Popover placement="bottomLeft" content="好友的申请记录，在未过期的情况下在手机APP中被删除">
                                    <Checkbox value="is_deleted">
                                    已删除
                                    </Checkbox>
                                </Popover>
                            </CheckboxGroup>
                        </FormItem>
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
