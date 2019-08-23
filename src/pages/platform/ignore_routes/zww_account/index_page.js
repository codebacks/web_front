'use strict'

import React from 'react'
import { connect } from 'dva'
import { Table, Pagination, Button, Form, Row, DatePicker, Tabs, Col, Input, Icon, Popconfirm, message, Badge, Popover } from 'antd'
import documentTitleDecorator from 'hoc/documentTitle'
import router from 'umi/router'
import { jine } from '../../../../utils/display'
import Page, { DEFAULT_PAGER, DEFAULT_PAGER_FILTER } from '../../../../components/business/Page'
import InputFilter from 'components/InputFilter'
import styles from './index.scss'
import config from 'crm/common/config'
import moment from 'moment'
import ToPay from './Modal'

const { RangePicker } = DatePicker
const TabPane = Tabs.TabPane

const { pageSizeOptions } = config

const DATA = {
    wx_nickname: '',
    mobile: '',
    date: [],
    tab: '',
    expired_day: ''
}

@connect(({ base, zww_account }) => ({
    base,
    zww_account
}))
@documentTitleDecorator({
    title: '派送结算'
})
@Form.create()
export default class extends Page.ListPureComponent {
    constructor(props) {
        super()
        this.state = {
            loading: false,
            isButtonLoading: false,
            tab: '',
            pager: {
                ...DEFAULT_PAGER
            },
            model: {
                visible: false
            },
            selectedRowKeys: []
        }

    }
    pager = {
        ...DEFAULT_PAGER
    }
    form = {
        ...DATA
    }

    initPage = (isSetHistory = false) => {
        const condition = this.getParamForObject(DATA, this.props.location.query, { date: this.momentToDate })
        const pager = this.getParamForObject(DEFAULT_PAGER, this.props.location.query, DEFAULT_PAGER_FILTER)
        const { wx_nickname, date, tab, mobile, expired_day } = condition
        this.form = condition
        this.pager = { ...this.pager, ...pager }
        this.getPageData(pager.current, pager.pageSize, isSetHistory)
        this.props.form.setFieldsValue({
            wx_nickname, date, mobile, expired_day
        })
        this.setState({ tab })
    }

    onCancel = (type) => {
        if(type){
            this.getPageData()
        }
        this.setState({
            model: {
                visible: false,
                piece: 0,
                money: 0
            }
        })
    }
    isMessage = false
    getPageData = (current = 1, pageSize = this.pager.pageSize, isSetHistory = true) => {

        let pager = { current, pageSize }
        if (this.form.mobile && !/^1[0-9]{10}$/.test(this.form.mobile)) {
            if (!this.isMessage) {
                this.isMessage = true
                message.error('请输入正确的手机号码').then(() => this.isMessage = false)
            }
            return
        }
        this.selectedAll = false
        let date = this.momentToStr(this.form.date)
        if (isSetHistory) {
            this.history({ ...this.form, ...{ date: date.join(',') } }, pager)
        }

        let params = {
            wx_nickname: this.form.wx_nickname,
            begin_at: date[0],
            end_at: date[1],
            mobile: this.form.mobile,
            expired_day: this.form.expired_day,
            status: this.form.tab,
            offset: (pager.current - 1) * pager.pageSize,
            limit: pager.pageSize,
        }
        let payload = {}
        Object.keys(params).forEach(key => {
            if (params[key] || params[key] === 0) {
                payload[key] = params[key]
            }
        })
        this.setState({
            loading: true
        })
        this.props.dispatch({
            type: 'zww_account/getAccountList',
            payload,
            callback: (data) => {
                this.setState({
                    loading: false,
                    pager
                })
            }
        })
    }

    handlePageChange = (page) => {
        this.pager.current = page
        this.setState({ selectedRowKeys: [] })
        this.getPageData(this.pager.current)
    }

    handleChangeSize = (current, size) => {
        this.pager.pageSize = size
        this.setState({ selectedRowKeys: [] })
        this.getPageData(1, this.pager.pageSize)
    }

    handleSearch = () => {
        this.getPageData()
    }
    handleChangeTabs = (value) => {
        this.form.tab = value
        this.setState({
            tab: value
        })
        this.getPageData()
    }

    momentToStr = (value) => {
        if (Array.isArray(value) && value.length === 2) {
            return [
                moment(value[0]).format('YYYY-MM-DD'),
                moment(value[1]).format('YYYY-MM-DD')
            ]
        }
        return [,]
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
    handelButtonClick = (e, data, row) => {
        e.preventDefault()
        if (data.value === '0' && this.orderList.length === 0 && !row) {
            return
        }
        if (this.state.isButtonLoading) return

        this.setState({
            isButtonLoading: Array.isArray(row) ? data.value : '4'
        })

        this.props.dispatch({
            type: 'zww_account/payment',
            payload: {
                // 0=自定义结算 1=7天结算 2=结算所有订单
                settlement_type: data.value,
                order_ids: data.value === '0' ? (row ? [row.order_id] : this.orderList) : []
            },
            callback: (data) => {
                this.setState({
                    isButtonLoading: false,
                    model: {
                        visible: true,
                        piece: data.total_doll_count,
                        money: data.total_amount,
                        url: data.link
                    }
                })
            }
        })
    }

    pay = (e, row) => {
        this.handelButtonClick(e, { value: '0' }, row)
    }
    orderList = []
    onSelectChange = (selectedRowKeys, row, u) => {
        this.setState({ selectedRowKeys })
        this.orderList = row.map(item => String(item.order_id))
    }

    toTradingRecord = (e) => {
        e.preventDefault()
        router.push('/platform/zww_account/trading_record')
    }
    onReset = () => {
        this.props.form.resetFields()
        this.form = {...DATA}
        this.setState({ selectedRowKeys:[] })
        this.getPageData()
    }
    selectedAll = false

    render() {
        const { list, total } = this.props.zww_account

        const formItemLayout = {
            labelCol: {
                span: 6,
                style: {
                    width: '70px',
                    textAlign: 'right',
                },
            },
            wrapperCol: {
                span: 16,
            },
        }
        const status = {
            0: {
                text: '未结算',
                badge: 'warning'
            },
            1: {
                text: '已结算',
                badge: 'default'
            },
            2: {
                text: '已过期',
                badge: 'default'
            },
        }
        const columns = [
            {
                title: '账号昵称',
                dataIndex: 'account',
                key: 'account',
                render: (data) => data.wx_nickname
            }, {
                title: '创建日期',
                dataIndex: 'created_at',
                key: 'created_at'
            }, {
                title: '离过期还有（天）',
                dataIndex: 'expired_day',
                key: 'expired_day',
                align:'center'
            }, {
                title: '手机号',
                dataIndex: 'account.mobile',
                key: 'account.mobile',
                // render: (mobile, row) => row.account && row.account.mobile
            }, {
                title: '订单状态',
                dataIndex: 'status',
                key: 'status',
                render: (data) => (
                    <Badge
                        status={status[data] && status[data].badge}
                        text={status[data] && status[data].text}
                    />
                )
            }, {
                title: '金额（元）',
                dataIndex: 'amount',
                key: 'amount',
                className: 'hz-table-column-width-90',
                align: 'right',
                render: (data) => jine(data, '0,0.00', 'Yun')
            }, {
                title: '派送地址',
                dataIndex: 'address',
                key: 'address'
            }
        ]

        if (this.form.tab === '' || this.form.tab === '0') {
            columns.push({
                title: '账户记录',
                dataIndex: 'id',
                key: 'id',
                render: (id, row) => row.status + '' === '0' ? <a onClick={e => this.pay(e, row)}>结算</a> : null
            })
        }

        const buttonList = [
            {
                text: '结算所选',
                value: '0'
            }, {
                text: '7天内结算',
                value: '1'
            }, {
                text: '结算所有',
                value: '2'
            },
        ]

        const { getFieldDecorator } = this.props.form
        const rowSelection = {
            selectedRowKeys: this.state.selectedRowKeys,
            onChange: this.onSelectChange,
            getCheckboxProps: record => ({
                disabled: record.status + '' !== '0',
                id: record.id + ''
            }),
        }

        let tableProps = {
            columns: columns,
            dataSource: list,
            size: "middle",
            rowKey: (record, index) => record.id + '',
            pagination: false,
            loading: this.state.loading
        }
        if (!this.form.tab || this.form.tab === '0') {
            tableProps.rowSelection = rowSelection
        }

        return (
            <Page >
                <Page.ContentHeader 
                    title="派送结算" 
                    helpUrl="http://newhelp.51zan.cn/manual/content/%E8%90%A5%E9%94%80%E5%B9%B3%E5%8F%B0/%E5%A4%A9%E5%A4%A9%E6%8A%93%E5%A8%83%E5%A8%83.md"
                />
                <Page.ContentAdvSearch >
                    <Form layout="horizontal" className="hz-from-search" >
                        <Row>
                            <Col span={8}>
                                <Form.Item label="微信昵称：" {...formItemLayout}>
                                    {
                                        getFieldDecorator('wx_nickname', {})(
                                            <Input placeholder="请输入微信昵称" maxLength={30} onChange={(e) => { this.form.wx_nickname = e.target.value }} />
                                        )
                                    }
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="手机号：" {...formItemLayout}>
                                    {
                                        getFieldDecorator('mobile', {})(
                                            <InputFilter onChange={(value) => { this.form.mobile = value }} placeholder="请输入手机号" maxLength={14} />
                                        )
                                    }
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="创建日期：" {...formItemLayout}>
                                    {
                                        getFieldDecorator('date', {})(
                                            <RangePicker onChange={(value) => { this.form.date = value }} style={{ width: '100%' }} />
                                        )
                                    }
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row >
                            <Col span={8}>
                                <Form.Item label="过期天数：" {...formItemLayout}>
                                    {
                                        getFieldDecorator('expired_day', {})(
                                            <InputFilter onChange={(value) => { this.form.expired_day = value }} filter='int' maxLength={5} />
                                        )
                                    }
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={8}>
                                <Form.Item label=' ' colon={false} style={{ marginBottom: 0 }} {...formItemLayout} >
                                    <Button onClick={e => { e.preventDefault(); this.handleSearch() }} className="hz-btn-width-default" type="primary" htmlType="submit">
                                        <Icon type="search" />
                                        搜索
                                    </Button>
                                    <Button style={{ marginLeft: '16px', width: '82px' }} onClick={this.onReset}>重置</Button>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Page.ContentAdvSearch>
                <div className={styles.inline_tabs}>
                    <Tabs defaultActiveKey="" activeKey={this.state.tab} onChange={this.handleChangeTabs}>
                        <TabPane tab="全部" key=""></TabPane>
                        <TabPane tab="未结算" key="0"></TabPane>
                        <TabPane tab="已结算" key="1"></TabPane>
                        <TabPane tab="已过期" key="2"></TabPane>
                    </Tabs>
                    <div className={styles.inline_tabs_content}><a onClick={e => this.toTradingRecord(e)}>交易记录</a></div>
                </div>

                <div>
                    {
                        buttonList.map((item, index) => <Button loading={this.state.isButtonLoading === item.value} key={index} disabled={this.form.tab !== '' && this.form.tab !== '0'} className={styles.zww_active_btn} onClick={e => this.handelButtonClick(e, item)}>{item.text}</Button>)
                    }
                </div>
                <Page.ContentTable>
                    <Table {...tableProps} />
                </Page.ContentTable>

                {total ? (<Pagination
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
                <ToPay
                    {...this.state.model}
                    getPageData={this.getPageData}
                    onCancel={this.onCancel}
                />
            </Page>
        )
    }
}
