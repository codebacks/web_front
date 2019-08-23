/*
 * @Author: sunlzhi 
 * @Date: 2018-11-08 11:08:12 
 * @Last Modified by: sunlizhi
 * @Last Modified time: 2018-12-11 16:24:42
 */

import React, {Component} from 'react'
import {Modal, Form, Table, Pagination } from 'antd'
import styles from '../index.less'
import { jine } from 'utils/display'

@Form.create()

export default class Index extends Component {
    constructor(props) {
        super(props)
        this.state = {
            pager: {
                offset: 1,
                limit: 10,
            },
        }
    }

    // 页面加载调用
    componentDidMount() {
        const { id } = this.props
        if(!id){
            return
        }
        this.getInvoicesDetails(id)
        this.getInvoicesOrders()
    }

    // 获取发票明细
    getInvoicesDetails = (id) => {
        this.props.dispatch({
            type: 'invoice/getInvoices',
            payload: {
                id: id
            },
            callback: (res) => {
                // console.log(res)
            }
        })
    }

    // 获取发票对应订单列表
    getInvoicesOrders = () => {
        const {pager} = this.state
        this.props.dispatch({
            type: 'invoice/getInvoicesOrders',
            payload: {
                id: this.props.id,
                offset: (pager.offset - 1) * pager.limit,
                limit: pager.limit,
            },
            callback: () => {}
        })
    }

    // 订单列表分页跳转
    goTemplatePage = (val) => {
        const {pager} = this.state
        pager.offset = val
        this.setState({
            pager
        },()=>{
            this.getInvoicesOrders()
        })
    }

    // 关闭弹窗
    handleCancel = () => {
        this.props.handleCancel()
    }

    render() {
        const {invoiceDetail, invoicesOrdersList, invoicesOrdersPagination} = this.props.invoice
        const {pager} = this.state
        const type = invoiceDetail.type

        // 开具此发票的订单列表
        const columns = [
            {
                title: '付款时间',
                dataIndex: 'paid_at',
                key: 'paid_at',
            }, {
                title: '付款内容',
                dataIndex: 'ext_info',
                key: 'ext_info',
            }, {
                title: '付款金额',
                dataIndex: 'amount',
                key: 'amount',
                render: (text, record) => {
                    return (
                        <div>{jine(text, '0,0.00', 'Fen')} 元</div>
                    )
                },
            },
        ]

        let register_province = invoiceDetail.register_province ? invoiceDetail.register_province : ''
        let register_city = invoiceDetail.register_city ? invoiceDetail.register_city : ''
        let register_region = invoiceDetail.register_region ? invoiceDetail.register_region : ''
        let province = invoiceDetail.province ? invoiceDetail.province : ''
        let city = invoiceDetail.city ? invoiceDetail.city : ''
        let region = invoiceDetail.region ? invoiceDetail.region : ''

        return <Modal
            title="发票明细"
            width={832}
            className={styles.invoicDetail}
            footer={null}
            visible={this.props.visible}
            destroyOnClose={true}
            onCancel={this.handleCancel}>
            <div>
                <ul className={styles.invoicDetailsInfo}>
                    <li>
                        <span className={styles.invoicDetailsName}>发票流水号</span>
                        <span className={styles.invoicDetailsValue}>{invoiceDetail.no}</span>
                    </li>
                    <li>
                        <span className={styles.invoicDetailsName}>发票金额</span>
                        <span className={styles.invoicDetailsValue}>{jine(invoiceDetail.amount, '0,0.00', 'Fen')}元</span>
                    </li>
                    <li>
                        <span className={styles.invoicDetailsName}>公司名称</span>
                        <span className={styles.invoicDetailsValue}>{invoiceDetail.company_name}</span>
                    </li>
                    <li>
                        <span className={styles.invoicDetailsName}>纳税人识别号</span>
                        <span className={styles.invoicDetailsValue}>{invoiceDetail.taxpayer_no}</span>
                    </li>
                    {type === 2 &&
                    <li>
                        <span className={styles.invoicDetailsName}>注册地址</span>
                        <span className={styles.invoicDetailsValue}>{register_province + register_city + register_region + invoiceDetail.register_address}</span>
                    </li>
                    }
                    {type === 2 &&
                    <li>
                        <span className={styles.invoicDetailsName}>注册电话</span>
                        <span className={styles.invoicDetailsValue}>{invoiceDetail.register_phone}</span>
                    </li>
                    }
                    {type === 2 &&
                    <li>
                        <span className={styles.invoicDetailsName}>开户银行</span>
                        <span className={styles.invoicDetailsValue}>{invoiceDetail.bank_name}</span>
                    </li>
                    }
                    {type === 2 &&
                    <li>
                        <span className={styles.invoicDetailsName}>银行账号</span>
                        <span className={styles.invoicDetailsValue}>{invoiceDetail.bank_account}</span>
                    </li>
                    }
                    {type === 2 &&
                    <li>
                        <span className={styles.invoicDetailsName}>收件人</span>
                        <span className={styles.invoicDetailsValue}>{invoiceDetail.consignee}</span>
                    </li>
                    }
                    {type === 2 &&
                    <li>
                        <span className={styles.invoicDetailsName}>联系电话</span>
                        <span className={styles.invoicDetailsValue}>{invoiceDetail.mobile}</span>
                    </li>
                    }
                    {type === 2 &&
                    <li>
                        <span className={styles.invoicDetailsName}>详细地址</span>
                        <span className={styles.invoicDetailsValue}>{province + city + region + invoiceDetail.address}</span>
                    </li>
                    }
                </ul>
                <Table 
                    columns={columns}
                    dataSource={invoicesOrdersList}
                    pagination={false} 
                    rowKey="paid_at"
                />
                {invoicesOrdersPagination.rows_found > 0 &&
                    <Pagination
                        size="small"
                        style={{textAlign: 'right', marginTop: 16}}
                        current={pager.offset}
                        pageSize={pager.limit} 
                        total={invoicesOrdersPagination.rows_found}
                        showTotal={(total) => `共 ${total} 条`} 
                        showQuickJumper={true} 
                        onChange={this.goTemplatePage} />
                }
            </div>
        </Modal>
    }

}