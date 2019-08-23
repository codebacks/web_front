'use strict'

/**
 * 文件说明: 订单记录
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 17/2/25
 */

import React from 'react'
import moment from 'moment'
import {Table, Pagination} from 'antd'
import config from 'crm/common/config'
import styles from './Order.scss'
// import Info from 'crm/components/Shops/Order/Info'

const {DateTimeFormat, pageSizeOptions} = config

export default class extends React.Component {
    constructor(props) {
        super()
        this.state = {}
    }

    componentDidMount() {
        this.loadOrderSummary()
        this.loadOrders()
    }

    loadOrderSummary = () => {
        const {id} = this.props.match.params
        this.props.dispatch({
            type: 'crm_customers/queryOrderSummary',
            payload: {params: {customer_id: id}},
        })
    }

    loadOrders = () => {
        const {id} = this.props.match.params
        this.props.dispatch({
            type: 'crm_customers/queryOrdersDetail',
            payload: {params: {customer_id: id}},
        })
    };

    openDetail = (record) => {
        // return <Info {...this.props} record={record}/>
        // todo 目前组件不支持异步加载，后面完善订单详情
        // return this.props.dispatch({
        //     type: 'crm_customers/orderDetail',
        //     payload: {params: {id: record.id}},
        //     callback: (detail) => {
        //     }
        // });
    };

    handleChangeSize = (current, size) => {
        let params = {...this.props.crm_customers.ordersDetailParams}
        params.limit = size
        this.props.dispatch({
            type: 'crm_customers/setProperty',
            payload: {ordersDetailParams: params},
        })
        this.goPage(1) //重置个数时回到首页
    };

    goPage = (page) => {
        this.props.dispatch({
            type: 'crm_customers/queryOrdersDetail',
            payload: {page: page},
        })
    };

    render() {
        const {orderSummary, ordersDetail, ordersDetailParams, ordersDetailTotal, ordersDetailCurrent, loadingOrders} = this.props.crm_customers
        const summary = orderSummary || {}
        const columns = [
            {
                title: '购买时间',
                dataIndex: 'created_at',
                key: 'created_at',
                render: (text, record, index) =>{
                    if (text) {
                        return moment(text * 1000).format(DateTimeFormat)
                    }
                }
            },
            {
                title: '平台',
                dataIndex: 'platform_type',
                key: 'platform_type',
                render: (text, record, index) => {
                    if(text === 1){
                        return '淘宝'
                    }
                }
            },
            {
                title: '店铺',
                dataIndex: 'shop.name',
                key: 'shop.name',
            },
            {
                title: '订单号',
                key: 'no',
                dataIndex: 'no',
            },
            {
                title: '数量',
                key: 'total_num',
                dataIndex: 'total_num',
                render: (text, record, index) => {
                    return record.items.length
                }
            },
            {
                title: '订单金额',
                key: 'amount',
                dataIndex: 'amount',
                render: (text, record)=> {
                    return record.amount/100
                }
            },
            {
                title: '订单状态',
                key: 'status.key',
                dataIndex: 'status',
                render: (text, record)=>{
                    return record.status.value
                }
            },
            // {
            //     title: '订单标题',
            //     key: 'title',
            //     dataIndex: 'title',
            //     width: 160,
            //     render: (text) => {
            //         return <div className={styles.productName}>{text}</div>
            //     }
            // },
            // {
            //     title: '物流编号',
            //     key: '',
            //     dataIndex: '',
            // }
        ]
        return (
            <div className={styles.orders}>
                <div className={styles.statWrap}>
                    <div className={`${styles.stat} ${styles.statTotalNum}`}>
                        <div className={styles.left}>
                            <i/>
                        </div>
                        <div className={styles.right}>
                            <p>{summary.total_count}单</p>
                            <h3>订单总数</h3>
                        </div>
                    </div>
                    <div className={`${styles.stat} ${styles.statTotalAmount}`}>
                        <div className={styles.left}>
                            <i/>
                        </div>
                        <div className={styles.right}>
                            <p>{summary.total_amount ? summary.total_amount / 100 : 0}元</p>
                            <h3>订单总额</h3>
                        </div>
                    </div>
                    <div className={`${styles.stat} ${styles.statAvg}`}>
                        <div className={styles.left}>
                            <i/>
                        </div>
                        <div className={styles.right}>
                            <p>{summary.average_amount ? (summary.average_amount / 100).toFixed(2) : 0}元</p>
                            <h3>平均单价</h3>
                        </div>
                    </div>
                </div>
                <Table
                    columns={columns}
                    dataSource={ordersDetail}
                    size="middle"
                    loading={loadingOrders}
                    rowKey={record => record.id}
                    // expandedRowRender={record => this.openDetail(record)}
                    pagination={false}
                />
                 <Pagination
                        className="ant-table-pagination"
                        total={ordersDetailTotal}
                        current={ordersDetailCurrent}
                        showQuickJumper={true}
                        pageSizeOptions={pageSizeOptions}
                        showTotal={total => `共 ${total} 条`}
                        pageSize={ordersDetailParams.limit}
                        showSizeChanger={true}
                        onShowSizeChange={this.handleChangeSize}
                        onChange={this.goPage}
                 />
            </div>
        )
    }
}

