import React, { Fragment } from 'react'
import {Table, Button, Form, Input, Select, Row, Col, Pagination, Icon, message, Modal} from 'antd'
import {connect} from 'dva'
import _ from "lodash"
import DateRange from 'components/DateRange'
import config from 'wx/common/config'
import styles from './index.less'
import moment from "moment/moment"
import documentTitleDecorator from "hoc/documentTitle"

const FormItem = Form.Item
const Option = Select.Option

const {pageSizeOptions, DateFormat, DateTimeFormat, DefaultAvatar} = config

@documentTitleDecorator()
@connect(({base, community_kickRecord, loading}) => ({
    base,
    community_kickRecord,
    queryLoading: loading.effects['community_kickRecord/query'],
}))
export default class extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {
        this.goPage(1)
        this.props.dispatch({type: 'community_kickRecord/getKickReasonType'})
    }

    componentWillUnmount() {
        this.resetParams()
    }

    handleSearch = () => {
        this.goPage(1)
    }

    handleChange = (key, e) => {
        let val = ''
        if (key === 'key') {
            val = e.target.value
        } else {
            val = e
        }
        let params = {...this.props.community_kickRecord.params}
        params[key] = val
        this.props.dispatch({
            type: 'community_kickRecord/setParams',
            payload: {
                params: params,
            },
        })
    }

    handleChangeSize = (current, size) => {
        let params = {...this.props.community_kickRecord.params}
        params.limit = size
        this.props.dispatch({
            type: 'community_kickRecord/setProperty',
            payload: {params: params},
        })
        this.goPage(1) // 重置个数时回到首页
    }

    goPage = (page) => {
        this.props.dispatch({
            type: 'community_kickRecord/query',
            payload: {page: page},
        })
    }

    resetParams = () => {
        this.props.dispatch({
            type: 'community_kickRecord/resetParams',
        })
        this.executeTime.setDate(null, null)
    }

    resetSearch = () => {
        this.resetParams()
        setTimeout(() => {
            this.goPage(1)
        }, 0)
    }

    handleChangeExecuteDate = (startValue, endValue) => {
        let params = {...this.props.community_kickRecord.params}
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
        this.props.dispatch({
            type: 'community_kickRecord/setParams',
            payload: {params: params}
        })
    }

    render() {
        const { params, total, current, list, kickReasonsOptions, } = this.props.community_kickRecord
        const {queryLoading} = this.props

        const columns = [
            {
                title: '微信昵称',
                dataIndex: 'from.nickname',
                key: 'from.nickname',
                className: styles.nickname,
                render: (text, record) => {
                    return <span>{text}</span>
                },
            },
            {
                title: '微信号',
                dataIndex: 'from.alias',
                key: 'from.alias',
                className: styles.uin,
                render: (text, record) => {
                    return <span>{text ? text: record?.from?.wechat_id}</span>
                },
            },
            {
                title: '被踢群',
                dataIndex: 'target.display_name',
                key: 'target.display_name',
                className: styles.groupName,
                render: (text, record) => {
                    return <span>{record.target.nickname ? record.target.nickname: text}</span>
                },
            },
            {
                title: '执行时间',
                dataIndex: 'execute_time',
                key: 'execute_time',
                className: styles.editTime,
                sorter: (a, b) => a.execute_time - b.execute_time,
                render: (text, record) => {
                    return text ? moment(text*1000).format(DateTimeFormat) : '-'
                }
            },
            {
                title: '失败原因',
                dataIndex: 'error_message',
                key: 'error_message',
                className: styles.failedReason,
                render: (text, record) => {
                    return <span>{text}</span>
                },
            },
            {
                title: '踢人原因',
                dataIndex: 'task_name',
                key: 'task_name',
                className: styles.kickReason,
            },
            {
                title: '黑名单状态',
                dataIndex: 'in_blacklist',
                key: 'in_blacklist',
                className: styles.blackStatus,
                render: (text, record) => {
                    return <span>{text === 1 ? '已加入': '未加入'}</span>
                },
            },
        ]

        const formItemLayout = {
            labelCol: {span: 6},
            wrapperCol: {span: 16},
        }

        return (
            <Fragment>
                <div className={styles.kickRecords}>
                    <div className={styles.searchWrap}>
                        <Row gutter={20}>
                            <Col span={7}>
                                <FormItem{...formItemLayout} label="搜索：" colon={false}>
                                    <Input placeholder="输入昵称、微信号、群名称" value={params.key} onChange={(e) => {this.handleChange('key', e)}} onPressEnter={this.handleSearch} />
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem className={styles.executeTime} {...formItemLayout} label="执行时间：" colon={false}>
                                    <DateRange
                                        ref={(node) => this.executeTime = node}
                                        startPlaceholder="不限"
                                        endPlaceholder="不限"
                                        startValue={params.start_time ? moment(params.start_time, DateFormat) : ''}
                                        endValue={params.end_time ? moment(params.end_time, DateFormat) : ''}
                                        onChange={this.handleChangeExecuteDate}
                                    />
                                </FormItem>
                            </Col>
                            <Col span={9}>
                                <FormItem {...formItemLayout} label="踢人原因：" colon={false}>
                                    <Select value={params.reason} style={{width: '80%'}} placeholder="全部" onChange={(e) => this.handleChange('reason', e)}>
                                        {
                                            kickReasonsOptions.map((item, index) => {
                                                return <Option value={item.key} key={item.key}>{item.desc}</Option>
                                            })
                                        }
                                    </Select>
                                </FormItem>
                            </Col>
                        </Row>

                        <Row className={styles.searchBtn} gutter={20}>
                            <Col span={10}>
                                <Col offset={2} style={{padding: "0"}}>
                                    <Button type="primary" icon="search" onClick={this.handleSearch}>搜索</Button>
                                    <Button onClick={this.resetSearch}>重置</Button>
                                </Col>
                            </Col>
                        </Row>
                    </div>
                    <div className={styles.tableWrap}>
                        <Table
                            columns={columns}
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
            </Fragment>
        )
    }

}
