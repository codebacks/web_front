'use strict'

import React, { Fragment } from 'react'
import {Table, Button, Form, Input, Select, Radio, Row, Col, Pagination, Badge} from 'antd'
import {connect} from 'dva'
import _ from "lodash"
import DepartmentSelect from 'components/business/DepartmentSelect'
import UserSelect from 'components/business/UserSelect'
import WeChatSelectSingle from 'components/business/WeChatSelectSingle'
import DateRange from 'components/DateRange'
import config from 'wx/common/config'
import styles from './index.less'
import moment from "moment/moment"
import NoticeRecordModal from "./components/NoticeRecordModal"
import EllipsisPopover from 'components/EllipsisPopover'


const FormItem = Form.Item
const Option = Select.Option
const RadioGroup = Radio.Group

const {pageSizeOptions, DateFormat, DateTimeFormat} = config

@connect(({base, community_groupNoticeRecord, loading}) => ({
    base,
    community_groupNoticeRecord,
    queryLoading: loading.effects['community_groupNoticeRecord/query'],
}))
export default class extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            isShowModal: false,
            record: null, // 操作的rocord
        }
    }

    componentDidMount() {
        this.goPage(1)
    };

    componentWillUnmount() {
        this.resetParams()
    }

    handleSearch = () => {
        this.goPage(1)
    }

    handleChange = (key, e) => {
        let val = ''
        if (key === 'query' || key === 'notice' || key === 'task_status') {
            val = e.target.value
        } else {
            val = e
        }
        let params = {...this.props.community_groupNoticeRecord.params}
        params[key] = val
        if (key === 'department_id') {
            params['user_id'] = undefined
            params['uin'] = undefined
        } else if (key === 'user_id') {
            params['uin'] = undefined
        }
        this.props.dispatch({
            type: 'community_groupNoticeRecord/setParams',
            payload: {
                params: params,
            },
        })
    }

    handleChangeSize = (current, size) => {
        let params = {...this.props.community_groupNoticeRecord.params}
        params.limit = size
        this.props.dispatch({
            type: 'community_groupNoticeRecord/setProperty',
            payload: {params: params},
        })
        this.goPage(1) // 重置个数时回到首页
    }

    goPage = (page) => {
        console.log('page', page)
        this.props.dispatch({
            type: 'community_groupNoticeRecord/query',
            payload: {page: page},
        })
    }

    resetParams = () => {
        this.props.dispatch({
            type: 'community_groupNoticeRecord/resetParams',
        })
        this.executeTime.setDate(null, null)
    }

    resetSearch = () => {
        this.resetParams()
        setTimeout(() => {
            this.goPage(1)
        }, 0)
    }

    handleCancelModal = () => {
        this.setState({
            isShowModal: false,
            record: null
        }, () => {
            this.props.dispatch({
                type: 'community_groupNoticeRecord/resetModalParams'
            })
            this.goPage(this.props.community_groupNoticeRecord.current || 1)
        })
    }

    handleChangeExecuteDate = (startValue, endValue) => {
        let params = {...this.props.community_groupNoticeRecord.params}
        if (startValue) {
            params.execute_time_start = moment(startValue).format(DateFormat) + ' 00:00:00'
        } else {
            params.execute_time_start = ''
        }
        if (endValue) {
            params.execute_time_end = moment(endValue).format(DateFormat) + ' 23:59:59'
        } else {
            params.execute_time_end = ''
        }
        this.props.dispatch({
            type: 'community_groupNoticeRecord/setParams',
            payload: {params: params}
        })
    }

    handleShowModal = (record) => {
        const {id} = record
        this.setState({
            isShowModal: true,
            record: record,
        }, () => {
            this.props.dispatch({
                type: 'community_groupNoticeRecord/queryDetailList',
                payload: {
                    task_id: id
                }
            })
        })
    }

    // 0: '未开始', 1: '已完成', -1: '失败', 2: '执行中', -2: '已取消', 3: '执行结束'
    getStatusBadge = (status) => {
        switch (status) {
            case 0:
                return <Badge status="warning" text="未修改"/>
            case 1:
                return <Badge status="success" text="已修改"/>
            case -1:
                return <Badge status="error" text="失败"/>
            case 2:
                return <Badge status="processing" text="处理中"/>
            case -2:
                return <Badge status="default" text="已取消"/>
            case 3:
                return <Badge status="default" text="已结束"/>
        }
    }

    handleCancelExecute = (record) => {
        const { id } = record
        this.props.dispatch({
            type: 'community_groupNoticeRecord/cancelExecute',
            payload: {
                task_id: id
            }
        })
        this.goPage(this.props.community_groupNoticeRecord.current)
    }

    render() {
        const {params, total, current, list} = this.props.community_groupNoticeRecord
        const {queryLoading} = this.props
        const {isShowModal, record} = this.state

        const columns = [
            {
                title: '队列编号',
                dataIndex: 'id',
                key: 'id',
                className: styles.ident,
            },
            {
                title: '修改公告内容',
                dataIndex: 'notice',
                key: 'notice',
                className: styles.notice,
                render: (text, record) => {
                    return text ? <EllipsisPopover
                        content={text}
                        lines={3}
                    /> : '无'
                },
            },
            {
                title: '总数量',
                dataIndex: 'num',
                key: 'num',
                className: styles.num,
                render: (text, record) => {
                    return text ? text : '无'
                },
            },
            {
                title: '发起部门',
                dataIndex: 'created_by.department.name',
                key: 'created_by.department.name',
                className: styles.department,
                render: (text, record) => {
                    return text ? text : '无'
                },
            },
            {
                title: '发起员工',
                dataIndex: 'created_by.nickname',
                key: 'created_by.nickname',
                className: styles.user,
                render: (text, record) => {
                    return record.created_by.nickname ? record.created_by.nickname : '无'
                },
            },
            {
                title: '执行时间',
                dataIndex: 'execute_time',
                key: 'execute_time',
                className: styles.executeTime,
                render: (text, record) => {
                    return text ? moment(text*1000).format(DateTimeFormat) : '-'
                }
            },
            {
                title: '状态',
                dataIndex: 'task_status',
                key: 'task_status',
                className: styles.status,
                render: (text, record) => {
                    return <div>
                        <div>
                            {this.getStatusBadge(text)}
                        </div>
                        <div>已修改：{record.count_success}</div>
                        <div>失败：{record.count_failed}</div>
                        <div>未修改：{record.count_pending}</div>
                    </div>
                },
            },
            {
                title: '操作',
                dataIndex: 'edit',
                key: 'edit',
                className: styles.edit,
                render: (text, record) => {
                    return <div>
                        {
                            record.task_status !== 0 ? <p onClick={() => this.handleShowModal(record)}>结果明细</p>
                                : <p className={styles.disabled}>结果明细</p>
                        }
                        {
                            (record.task_status === 0 || record.task_status === 2) ?
                                <p onClick={() => this.handleCancelExecute(record)}>取消执行</p>
                                : <p className={styles.disabled}>取消执行</p>
                        }

                    </div>
                },
            },
        ]

        const formItemLayout = {
            labelCol: {span: 8},
            wrapperCol: {span: 14},
        }
        const timeFormItemLayout = {
            labelCol: {span: 4},
            wrapperCol: {span: 18},
        }
        const checkboxFormItemLayout = {
            labelCol: {span: 2},
            wrapperCol: {span: 16},
        }

        // 0: '未开始', 1: '已完成', -1: '失败', 2: '执行中', -2: '已取消', 3: '执行结束'
        const options = [
            {label: '全部', value: ''},
            {label: '已完成', value: 1},
            {label: '未开始', value: 0},
            {label: '失败', value: -1},
            {label: '处理中', value: 2},
            {label: '已取消', value: -2},
        ]

        return (
            <Fragment>
                <div className={styles.groupNoticeRecord}>
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
                            <Col span={7}>
                                <FormItem {...formItemLayout}
                                    label="公告搜索："
                                    colon={false}
                                >
                                    <Input placeholder="输入公告内容关键词搜索"
                                        value={params.notice}
                                        onChange={(e) => {
                                            this.handleChange('notice', e)
                                        }}
                                        onPressEnter={this.handleSearch}/>
                                </FormItem>
                            </Col>
                            <Col span={14}>
                                <FormItem className={styles.executeTime} {...timeFormItemLayout} label="执行时间："
                                    colon={false}>
                                    <DateRange
                                        ref={(node) => this.executeTime = node}
                                        startPlaceholder="不限"
                                        endPlaceholder="不限"
                                        startValue={params.execute_time_start ? moment(params.execute_time_start, DateFormat) : ''}
                                        endValue={params.execute_time_end ? moment(params.execute_time_end, DateFormat) : ''}
                                        onChange={this.handleChangeExecuteDate}
                                    />
                                </FormItem>
                            </Col>
                        </Row>
                        <Row gutter={20}>
                            <FormItem {...checkboxFormItemLayout} label="状态：" colon={false}>
                                <RadioGroup options={options} onChange={(e) => this.handleChange('task_status', e)} value={params.task_status} />
                            </FormItem>
                        </Row>
                        <Row className={styles.searchBtn} gutter={20}>
                            <Col span={7}>
                                <Col offset={8} style={{padding: "0"}}>
                                    <Button type="primary" icon="search" onClick={this.handleSearch}>搜索</Button>
                                    <Button onClick={this.resetSearch}>重置</Button>
                                </Col>
                            </Col>
                        </Row>
                    </div>
                    <div className={styles.tableWrap}>
                        <Table columns={columns}
                            dataSource={list}
                            size="middle"
                            loading={queryLoading}
                            rowKey={(record, index) => index}
                            pagination={false}
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
                <NoticeRecordModal
                    visible={isShowModal}
                    record={record}
                    onCancel={this.handleCancelModal}
                />

            </Fragment>
        )
    }

}
