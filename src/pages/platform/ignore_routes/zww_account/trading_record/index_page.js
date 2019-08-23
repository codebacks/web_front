'use strict'

import React from 'react'
import { connect } from 'dva'
import { Table, Pagination, Button, Form, Row, DatePicker, Tabs, Col, Input, Icon, Popconfirm, message, Badge, Popover } from 'antd'
import documentTitleDecorator from 'hoc/documentTitle'
import { jine } from 'utils/display'
import Page, { DEFAULT_PAGER, DEFAULT_PAGER_FILTER } from 'components/business/Page'
import styles from './index.scss'
import config from 'crm/common/config'
import moment from 'moment'

const { RangePicker } = DatePicker
const TabPane = Tabs.TabPane

const { pageSizeOptions } = config

const DATA = {
    nick_name: '',
    date: [],
    tab: '1'
}

@connect(({ base, zww_account }) => ({
    base,
    zww_account
}))
@documentTitleDecorator({
    title: '交易记录'
})
@Form.create()
export default class extends Page.ListPureComponent {
    constructor(props) {
        super()
        this.state = {
            loading: false,
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
        const { nick_name, date, tab } = condition
        this.form = condition
        this.pager = { ...this.pager, ...pager }
        this.getPageData(pager.current, pager.pageSize, isSetHistory)
        setTimeout(_=>{
            this.props.form.setFieldsValue({
                nick_name, date
            })
        })
        
        this.setState({ tab })
    }

    onCancel = () => {
        this.setState({
            model: {
                visible: false,
                piece: 0,
                money: 0
            }
        })
    }

    getPageData = (current = 1, pageSize = this.pager.pageSize, isSetHistory = true) => {

        let pager = { current, pageSize }
        this.setState({
            loading: true,
            isButtonLoading: true
        })
        let date = this.momentToStr(this.form.date)
        if (isSetHistory) {
            this.history({ ...this.form, ...{ date: date.join(',') } }, pager)
        }
        let payload = {
            begin_at: date[0],
            end_at: date[1],
            offset: (pager.current - 1) * pager.pageSize,
            limit: pager.pageSize
        }
        let type = 'zww_account/settleRcordList'
        if (this.form.tab === '1') {
            const orderDate = {
                "descend": 'coin desc',
                "ascend": 'coin asc'
            }
            payload.order_by = orderDate[this.order]
            payload.nickname = this.form.nick_name
            type = 'zww_account/sendGameCurrencyList'
        }
        this.props.dispatch({
            type,
            payload,
            callback: (data) => {
                let state =  {
                    loading: false
                }
                if(data){
                    state.selectedRowKeys = []
                    state.pager = pager
                }
                this.setState(state)
            }
        })
    }
    order = ''
    handleTableChange = (pagination, filters, sorter) => {
        if (this.order !== sorter.order) {
            this.order = sorter.order
            this.getPageData(this.pager.current)
        }
    }

    handlePageChange = (page) => {
        this.pager.current = page
        this.getPageData(page)
    }

    handleChangeSize = (current, size) => {
        this.pager.current = current
        this.pager.pageSize = size
        this.getPageData(1,this.pager.pageSize)
    }

    handleSearch = () => {
        this.getPageData()
    }
    handleChangeTabs = (value) => {
        this.setState({
            tab: value
        })
        this.form = { ...DATA }
        this.form.tab = value
        this.pager = { ...DEFAULT_PAGER }
        this.props.form.setFieldsValue({ date: [] })
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

    getTableColumns = (tabType = this.form.tab) => {
        const status = {
            0: {
                text: '失败',
                badge: 'error'
            },
            1: {
                text: '成功',
                badge: 'success'
            }
        }

        let columns = []

        if (tabType === '1') {
            columns = [
                {
                    title: '发送虎赞账号',
                    dataIndex: 'user',
                    key: 'user',
                    render: (data) => data && data.nickname
                }, {
                    title: '发送日期',
                    dataIndex: 'created_at',
                    key: 'created_at'
                }, {
                    title: '客户微信昵称',
                    dataIndex: 'nickname',
                    key: 'nickname',
                    render: (data, row) => row.account && row.account.wx_nickname
                }, {
                    title: '客户手机号',
                    dataIndex: 'account',
                    key: 'account',
                    render: data => data && data.mobile
                }, {
                    title: '发放游戏币',
                    dataIndex: 'coin',
                    key: 'coin',
                    sorter: true
                }
            ]
        } else if (tabType === '2') {
            columns = [
                {
                    title: '商品数',
                    dataIndex: 'doll_count',
                    key: 'doll_count'
                }, {
                    title: '总金额（元）',
                    dataIndex: 'total_amount',
                    key: 'total_amount',
                    render: (data) => jine(data, '0,0.00', 'Yun')
                }, {
                    title: '结算日期',
                    dataIndex: 'created_at',
                    key: 'created_at'
                }
            ]
        }

        const columnsEnd = [
            {
                title: '订单状态',
                dataIndex: 'status',
                key: 'status',
                render: (text) => <Badge
                    status={status[text] && status[text].badge}
                    text={status[text] && status[text].text}
                />
            }, {
                title: '备注',
                dataIndex: 'remark',
                key: 'remark',
                render: (text) => text ? text : '--'
            }
        ]
        return columns.concat(columnsEnd)
    }
    onReset = ()=>{
        this.props.form.resetFields()
        this.form ={...DATA}
        this.getPageData()
    }

    render() {
        const { recordList, recordTotal } = this.props.zww_account
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

        const { getFieldDecorator } = this.props.form

        const tableProps = {
            columns: this.getTableColumns(),
            dataSource: recordList,
            size: "middle",
            rowKey: (record, index) => index,
            pagination: false,
            onChange: this.handleTableChange,
            loading: this.state.loading
        }
        return (
            <Page >
                <Page.ContentHeader breadcrumbData={[{
                    name: '派送结算',
                    path: '/platform/zww_account'
                }, {
                    name: '交易记录'
                }]} />
                <Page.ContentAdvSearch hasGutter={false}>
                    <Form layout="horizontal" className="hz-from-search" >
                        <Row>
                            {
                                this.form.tab === '1' ?
                                    <Col span={8}>
                                        <Form.Item label="虎赞账号：" {...formItemLayout}>
                                            {
                                                getFieldDecorator('nick_name', {})(
                                                    <Input placeholder="请输入虎赞账号" maxLength={30} onChange={(e) => { this.form.nick_name = e.target.value }} />
                                                )
                                            }
                                        </Form.Item>
                                    </Col> : null
                            }
                            <Col span={7}>
                                <Form.Item label="创建日期：" {...formItemLayout}>
                                    {
                                        getFieldDecorator('date', {})(
                                            <RangePicker style={{ width: '100%' }} onChange={(value) => { this.form.date = value }} style={{ width: '100%' }} />
                                        )
                                    }
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item  {...formItemLayout} >
                                    <Button onClick={e => { e.preventDefault(); this.handleSearch() }} className="hz-btn-width-default" type="primary" htmlType="submit">
                                        <Icon type="search" />
                                        搜索
                                    </Button>
                                    <Button style={{marginLeft: '16px',width: '82px'}} onClick={this.onReset}>重置</Button>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Page.ContentAdvSearch>

                <Tabs activeKey={this.state.tab} onChange={this.handleChangeTabs}>
                    <TabPane tab="游戏币发送历史记录" key="1"></TabPane>
                    <TabPane tab="结算记录" key="2"></TabPane>
                </Tabs>
                <Page.ContentTable>
                    <Table {...tableProps} />
                </Page.ContentTable>

                {recordTotal ? (<Pagination
                    className="ant-table-pagination"
                    total={recordTotal}
                    current={this.state.pager.current}
                    showQuickJumper={true}
                    pageSizeOptions={pageSizeOptions}
                    showTotal={total => `共 ${total} 条`}
                    pageSize={this.state.pager.pageSize}
                    showSizeChanger={true}
                    onShowSizeChange={this.handleChangeSize}
                    onChange={this.handlePageChange}
                />) : ('')}
                {/* <ToPay
                    {...this.state.model}
                    getPageData={this.getPageData}
                    onCancel={this.onCancel}
                /> */}
            </Page>
        )
    }
}
