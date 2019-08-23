'use strict'

import React from 'react'
import { connect } from 'dva'
import { Table, Pagination, Button, Form, Row, DatePicker, Select, Col, Input, Icon, Popover, Badge } from 'antd'
import documentTitleDecorator from 'hoc/documentTitle'
import Page, { DEFAULT_PAGER, DEFAULT_PAGER_FILTER } from '@/components/business/Page'
import styles from './index.less'
import config from 'crm/common/config'
import moment from 'moment'
import Report from './Report'

const { RangePicker } = DatePicker
const Option = Select.Option

const { pageSizeOptions } = config
const DEFAULT_CONDITION = {
    keys: '',
    date: [],
    template_id: undefined
}

@connect(({ base, sms_record }) => ({
    base,
    sms_record
}))
@documentTitleDecorator({
    title: '发送记录'
})
@Form.create()
export default class extends Page.ListPureComponent {
    constructor(props) {
        super()
        this.state = {
            loading: false,
            pager: {
                ...DEFAULT_PAGER
            },
            model: {
                visible: false,
                id: null
            },
            options: []
        }
    }
    form = {
        ...DEFAULT_CONDITION
    }
    pager = {
        ...DEFAULT_PAGER
    }
    componentDidMount() {
        this.initPage()
        this.searchFetch()
    }

    createTemplate = (e) => {
        e.preventDefault()
        this.setState({
            model: {
                visible: false,
                id: null
            }
        })
    }
    seleteReport = (e, id) => {
        e.preventDefault()
        this.props.dispatch({
            type: "sms_record/getMsmSendReportList",
            payload: {
                send_history_id: id,
                status: 2,
                offset: 0,
                limit: 10
            }
        })
        this.setState({
            model: {
                visible: true,
                id: id
            }
        })

    }
    onCancel = () => {
        this.setState({
            model: {
                visible: false,
                id: null
            }
        })
    }

    initPage = (isSetHistory = false) => {
        const condition = this.getParamForObject(DEFAULT_CONDITION, this.props.location.query, { date: this.momentToDate })
        const pager = this.getParamForObject(DEFAULT_PAGER, this.props.location.query, DEFAULT_PAGER_FILTER)
        const { keys, date, template_id,name } = condition
        this.form = condition
        this.pager = { ...this.pager, ...pager }
        this.getList(pager.current, pager.pageSize, isSetHistory)
        
        this.props.form.setFieldsValue({
            keys, date,template_id
        })
    }

    getList = (current = this.pager.current, pageSize = this.pager.pageSize, isSetHistory = true) => {
        let pager = { current, pageSize }
        this.setState({
            loading: true
        })
        const { initData } = this.props.base
        let company_id
        if (initData && initData.company) {
            company_id = initData.company.id
        }
        let date = this.momentToStr(this.form.date)
        if (isSetHistory) {
            this.history({ ...this.form, ...{ date:date.join(',') } }, pager)
        }
        let template_id = this.form.template_id

        this.state.options.forEach(item => {
            if (item.template_id === template_id) {
                this.form.name = item.name
            }
        })
        let payload = {
            company_id,
            name: this.form.name,
            template_id,
            content: this.form.keys,
            type: '1',
            send_begin_time: date[0],
            send_end_time: date[1],
            offset: (pager.current - 1) * pager.pageSize,
            limit: pager.pageSize,
        }
        this.props.dispatch({
            type: 'sms_record/getMsmSendList',
            payload,
            callback: (data) => {
                this.setState({
                    loading: false,
                    pager
                })
            }
        })
    }
    momentToDate = (value) => {
        value = value.split && value.split(',')
        if (Array.isArray(value) && value.length === 2) {
            return [
                moment(value[0]),
                moment(value[1])
            ]
        }
        return [,]
    }

    searchFetch = (value) => {
        let payload = {
            name: value,
            type: '2',
            offset: 0,
            limit: 1000
        }
        this.props.dispatch({
            type: 'sms_record/getMsmTemplateList',
            payload,
            callback: (data) => {
                this.setState({
                    options: data
                })
            }
        })


    }
    handlePageChange = (page) => {
        this.pager.current = page
        this.getList()
    }

    handleChangeSize = (current, size) => {
        this.pager.current = current
        this.pager.pageSize = size
        this.getList()
    }

    handleSearch = () => {
        this.getList()
    }

    momentToStr = (value) => {
        if (Array.isArray(value) && value.length === 2) {
            return [
                moment(value[0]).format('YYYY-MM-DD') + ' 00:00:00',
                moment(value[1]).format('YYYY-MM-DD') + " 23:59:59"
            ]
        }
        return [,]
    }
    onReset= () => {
        this.props.form.resetFields()
        this.form = {}
        this.getList()
    }
    render() {
        const { list, total } = this.props.sms_record
        const formItemLayout = {
            labelCol: {
                span: 6,
                style: {
                    width: '70px',
                    textAlign: 'right'
                },
            },
            wrapperCol: {
                span: 16,
            },
        }
        const send_status = {
            1: {
                text: '发送中',
                badge: 'processing'
            },
            2: {
                text: '已完成',
                badge: 'default'
            }
        }
        const send_type = {
            1:'手动',
            2:'自动'
        }
        const columns = [
            {
                title: '发送时间',
                dataIndex: 'created_at',
                key: 'created_at',
                width: 200
            },
            {
                title: '类型',
                dataIndex: 'send_type',
                key: 'send_type',
                render: (type) => send_type[type]
            },
            {
                title: '标题',
                dataIndex: 'name',
                key: 'name',
                width: 300,
                render: (content) =>
                    <Popover placement="top" content={
                        <p className={styles.table__content__popover}>
                            {content}
                        </p>
                    } trigger="hover">
                        <div className={styles.table__content}>{content}</div>
                    </Popover>
            },
            {
                title: '内容',
                dataIndex: 'content',
                key: 'content',
                width: 300,
                render: (content) =>
                    <Popover placement="top" content={
                        <p className={styles.table__content__popover}>
                            {content}
                        </p>
                    } trigger="hover">
                        <div className={styles.table__content}>{content}</div>
                    </Popover>
            },
            {
                title: '发送状态',
                dataIndex: 'status',
                key: 'status',
                render: (data) =>
                    <Badge
                        status={send_status[data] && send_status[data].badge}
                        text={send_status[data] && send_status[data].text}
                    />
            },
            {
                title: '成功',
                dataIndex: 'success_count',
                key: 'success_count',
                align:'center',
                render: (data) => <span>{data ? data : '--'}</span>
            },
            {
                title: '失败',
                dataIndex: 'failed_count',
                key: 'failed_count',
                render: (data) => <span>{data ? data : '--'}</span>
            },
            {
                title: '操作',
                dataIndex: 'id',
                key: 'id',
                render: (id, row) => <a onClick={e => this.seleteReport(e, id)}>查看报告</a>
            }
        ]
        const { getFieldDecorator } = this.props.form
        return (
            <Page>
                <Page.ContentHeader 
                    title="发送记录" 
                    helpUrl="http://newhelp.51zan.cn/manual/content/%E5%AE%A2%E6%88%B7%E7%AE%A1%E7%90%86/%E7%9F%AD%E4%BF%A1%E7%AE%A1%E7%90%86.md"
                />
                <Page.ContentAdvSearch hasGutter={false}>
                    <Form layout="horizontal" onSubmit={this.handleSearch}>
                        <Row>
                            <Col span={8}>
                                <Form.Item label="发送模版：" {...formItemLayout}>
                                    {
                                        getFieldDecorator('template_id', {})(
                                            <Select
                                                allowClear
                                                // showSearch
                                                placeholder="请选择"
                                                // onSearch={this.searchFetch}
                                                onChange={value => this.form.template_id = value}
                                                style={{ width: "100%" }}
                                            >
                                                {/* <Option key='0-0' value="">请选择</Option> */}
                                                {this.state.options.map((item, index) => (
                                                    <Option key={index} value={item.template_id + ''}>
                                                        {item.name}
                                                    </Option>)
                                                )}
                                            </Select>
                                        )
                                    }
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="关键字：" {...formItemLayout}>
                                    {
                                        getFieldDecorator('keys', {})(
                                            <Input placeholder="内容搜索" maxLength={30} onChange={(e) => { this.form.keys = e.target.value }} />
                                        )
                                    }

                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="发送时间：" {...formItemLayout}>
                                    {
                                        getFieldDecorator('date', {})(
                                            <RangePicker onChange={(value) => { this.form.date = value }} style={{ width: '100%' }} />
                                        )
                                    }

                                </Form.Item>
                            </Col>

                        </Row>
                        <Form.Item label=" " colon={false} style={{ marginBottom: 0 }}  {...formItemLayout}>
                            <Button onClick={e => { e.preventDefault(); this.handleSearch() }} className="hz-btn-width-default" type="primary" htmlType="submit">
                                <Icon type="search" />
                                搜索
                            </Button>
                            <Button style={{marginLeft: '16px',width: '82px'}} onClick={this.onReset}>重置</Button>
                        </Form.Item>
                    </Form>
                </Page.ContentAdvSearch>

                <Page.ContentTable>
                    <Table
                        columns={columns}
                        dataSource={list}
                        size="middle"
                        rowKey={(record, index) => index}
                        pagination={false}
                        loading={this.state.loading}
                    />
                </Page.ContentTable>

                {list.length ? (<Pagination
                    className="ant-table-pagination"
                    total={total}
                    current={this.state.pager.current}
                    showQuickJumper={true}
                    pageSizeOptions={pageSizeOptions}
                    showTotal={total => `共 ${total} 条`}
                    pageSize={this.state.pager.pageSize}
                    showSizeChanger={true}
                    onShowSizeChange={this.handleChangeSize}
                    onChange={this.handlePageChange}
                />) : ('')}
                <Report
                    {...this.state.model}
                    onCancel={this.onCancel}
                />
            </Page>


        )
    }
}
