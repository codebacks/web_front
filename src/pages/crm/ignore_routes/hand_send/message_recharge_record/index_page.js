'use strict'

import React, { Component } from 'react'
import { connect } from 'dva'
import { Table, Pagination, Button, DatePicker, Tabs } from 'antd'
import documentTitleDecorator from 'hoc/documentTitle'
import Page, { DEFAULT_PAGER, DEFAULT_PAGER_FILTER } from 'components/business/Page'
import numeral from 'numeral'
import { jine } from '../../../../../utils/display'
import styles from './index.less'
import config from 'crm/common/config'
// import PayModel from '../../../../crm/ignore_routes/customerPool/message/payModel'
const { pageSizeOptions } = config

@connect(({ base, sms_account }) => ({
    base,
    sms_account
}))
@documentTitleDecorator({
    title: '充值记录'
})
export default class extends Page.ListPureComponent {
    constructor(props) {
        super()
        this.state = {
            loading: false,
            pager: {
                ...DEFAULT_PAGER
            }
        }
    }
    form = {
        ...DEFAULT_PAGER
    }
    componentDidMount() {
        this.initPage()
    }

    initPage = (isSetHistory = false) => {
        const pager = this.getParamForObject(this.form, this.props.location.query, DEFAULT_PAGER_FILTER)
        this.form = {...this.form,...pager}
        this.getList(pager.current,pager.pageSize, isSetHistory)
    }

    
    // 开票
    toNote = () => {
        window.open('/setting/invoice', '_blank')
    }

    getList = (current = this.form.current, pageSize = this.form.pageSize,isSetHistory=true) => {
        let pager = { current, pageSize }
        this.setState({
            loading: true
        })
        const { initData } = this.props.base
        let company_id
        if (initData && initData.company) {
            company_id = initData.company.id
        }
        if (isSetHistory) {
            this.history({}, pager)
        }
        this.props.dispatch({
            type: 'sms_account/getBuySMSList',
            payload: {
                company_id: company_id,
                offset: (pager.current - 1) * pager.pageSize,
                limit: pager.pageSize
            },
            callback: (data) => {
                this.setState({
                    loading: false,
                    pager
                })
            }
        })
    }

    handlePageChange = (page) => {
        this.form.current = page
        this.getList()
    }

    handleChangeSize = (current, size) => {
        this.form.current = current
        this.form.pageSize = size
        this.getList()
    }

    handleSearch = () => {
        this.getList()
    }


    render() {
        const { list, total, smsCount } = this.props.sms_account
        const payType = {
            1: '支付宝'
        }
        const columns = [
            {
                title: '购买时间',
                dataIndex: 'created_at',
                key: 'created_at',
                width: 200
            },
            {
                title: '金额（¥）',
                dataIndex: 'price',
                key: 'price',
                render: (data) => jine(data, '0,0.00', 'Fen')
            },
            {
                title: '购买条数',
                dataIndex: 'count',
                key: 'count'
            },
            // {
            //     title: '支付方式',
            //     dataIndex: 'pay_type',
            //     key: 'pay_type',
            //     render: (data) => data ? payType[data] : '--'
            // },
            {
                title: '操作',
                dataIndex: 'handle',
                key: 'handle',
                render: (data) => <a onClick={e => this.toNote(e, data)}>开票</a>
            }
        ]
        return (
            <Page>
                <Page.ContentHeader
                    title="充值记录"/>
                {/* <Page.ContentAdvSearch hasGutter={false}>
                    <p>剩余可用短信 <span style={{ color: '#4391FF' }}>{numeral(smsCount).format('0,0')}</span> 条</p>
                    <Button type="primary" onClick={this.showModel}>充值</Button>
                </Page.ContentAdvSearch>
                <h3 className={styles.title_sign}>购买记录</h3> */}
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
                
                {/* <PayModel {...this.state.model} onCancel={this.onCancel} /> */}
            </Page>
        )
    }
}
