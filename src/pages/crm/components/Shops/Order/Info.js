'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 16/12/29
 */


import React from 'react'
import {Row, Col} from 'antd'
import moment from 'moment'
import config from 'crm/common/config'
import styles from './Index.scss'
const {DateTimeFormat} = config

export default class extends React.Component {
    constructor(props) {
        super()
        this.state = {}
    }

    render() {
        // const {initData: config} = this.props.base
        const detail = this.props.record
        // const getTaobao = (record) => {
        //     return (
        //         <div className={styles.orderExtInfo}>
        //             <Row>
        //                 <Col span="3"><label>宝贝标题</label></Col>
        //                 <Col span="21">{record.product_name}</Col>
        //             </Row>
        //             <Row>
        //                 <Col span="3"><label>收货地址</label></Col>
        //                 <Col span="21">{record.address}</Col>
        //             </Row>
        //             <Row>
        //                 <Col span="3"><label>买家应付货款</label></Col>
        //                 <Col span="3">{record.amount_due}</Col>
        //                 <Col span="3"><label>买家应付邮费</label></Col>
        //                 <Col span="3">{record.ship_due}</Col>
        //                 <Col span="3"><label>买家支付积分</label></Col>
        //                 <Col span="3">{record.point_due}</Col>
        //                 <Col span="3"><label>总金额</label></Col>
        //                 <Col span="3">{record.amount_total}</Col>
        //             </Row>
        //             <Row>
        //                 <Col span="3"><label>返点积分</label></Col>
        //                 <Col span="3">{record.point_return}</Col>
        //                 <Col span="3"><label>买家实际支付金额</label></Col>
        //                 <Col span="3">{record.amount_paid}</Col>
        //                 <Col span="3"><label>买家实际支付积分</label></Col>
        //                 <Col span="3">{record.point_paid}</Col>
        //                 <Col span="3"><label>订单状态</label></Col>
        //                 <Col span="3">{record.order_status}</Col>
        //             </Row>
        //             <Row>
        //                 <Col span="3"><label>买家留言</label></Col>
        //                 <Col span="3">{record.buyer_remark}</Col>
        //                 <Col span="3"><label>收货人姓名</label></Col>
        //                 <Col span="3">{record.contact_name}</Col>
        //                 <Col span="3"><label>联系电话</label></Col>
        //                 <Col span="3">{record.contact_tel}</Col>
        //                 <Col span="3"><label>联系手机</label></Col>
        //                 <Col span="3">{record.contact_mobile}</Col>
        //             </Row>
        //             <Row>
        //                 <Col span="3"><label>运送方式</label></Col>
        //                 <Col span="3">{record.ship_type}</Col>
        //                 <Col span="3"><label>宝贝种类</label></Col>
        //                 <Col span="3">{record.product_type}</Col>
        //                 <Col span="3"><label>订单创建时间</label></Col>
        //                 <Col
        //                     span="3">{record.order_create_time && moment(record.order_create_time * 1000).format(DateTimeFormat)}</Col>
        //                 <Col span="3"><label>订单付款时间</label></Col>
        //                 <Col
        //                     span="3">{record.order_pay_time && moment(record.order_pay_time * 1000).format(DateTimeFormat)}</Col>
        //             </Row>
        //             <Row>
        //                 <Col span="3"><label>物流单号</label></Col>
        //                 <Col span="3">{record.ship_num}</Col>
        //                 <Col span="3"><label>物流公司</label></Col>
        //                 <Col span="3">{record.ship_company}</Col>
        //                 <Col span="3"><label>订单备注</label></Col>
        //                 <Col span="3">{record.order_remark}</Col>
        //                 <Col span="3"><label>宝贝总数量</label></Col>
        //                 <Col span="3">{record.product_num}</Col>
        //             </Row>
        //             <Row>
        //                 <Col span="3"><label>店铺Id</label></Col>
        //                 <Col span="3">{record.shop_id}</Col>
        //                 <Col span="3"><label>店铺名称</label></Col>
        //                 <Col span="3">{record.shop_name}</Col>
        //                 <Col span="3"><label>订单关闭原因</label></Col>
        //                 <Col span="3">{record.order_close_reason}</Col>
        //                 <Col span="3"><label>卖家服务费</label></Col>
        //                 <Col span="3">{record.seller_fee}</Col>
        //             </Row>
        //
        //             <Row>
        //                 <Col span="3"><label>买家服务费</label></Col>
        //                 <Col span="3">{record.buyer_fee}</Col>
        //                 <Col span="3"><label>发票抬头</label></Col>
        //                 <Col span="3">{record.invoice_title}</Col>
        //                 <Col span="3"><label>是否手机订单</label></Col>
        //                 <Col span="3">{record.is_mobile_order}</Col>
        //                 <Col span="3"><label>分阶段订单信息</label></Col>
        //                 <Col span="3">{record.step_order_info}</Col>
        //             </Row>
        //
        //             <Row>
        //                 <Col span="3"><label>特权订金订单id</label></Col>
        //                 <Col span="3">{record.special_order_id}</Col>
        //                 <Col span="3"><label>是否上传合同照片</label></Col>
        //                 <Col span="3">{record.is_upload_photo}</Col>
        //                 <Col span="3"><label>是否上传小票</label></Col>
        //                 <Col span="3">{record.is_upload_ticket}</Col>
        //                 <Col span="3"><label>是否代付</label></Col>
        //                 <Col span="3">{record.is_other_pay}</Col>
        //             </Row>
        //
        //             <Row>
        //                 <Col span="3"><label>定金排名</label></Col>
        //                 <Col span="3">{record.deposit_rank}</Col>
        //                 <Col span="3"><label>修改后的sku</label></Col>
        //                 <Col span="3">{record.modified_sku}</Col>
        //                 <Col span="3"><label>修改后的收货地址</label></Col>
        //                 <Col span="9">{record.modified_address}</Col>
        //             </Row>
        //             <Row>
        //                 <Col span="3"><label>异常信息</label></Col>
        //                 <Col span="3">{record.abnormal_info}</Col>
        //                 <Col span="3"><label>天猫卡券抵扣</label></Col>
        //                 <Col span="3">{record.tmall_ticket}</Col>
        //                 <Col span="3"><label>集分宝抵扣</label></Col>
        //                 <Col span="3">{record.ji_point}</Col>
        //                 <Col span="3"><label>是否是O2O交易</label></Col>
        //                 <Col span="3">{record.is_o2o}</Col>
        //             </Row>
        //         </div>
        //     )
        //
        // }

        // const getJD = (record) => {
        //     return <div className={styles.orderExtInfo}>
        //         <Row>
        //             <Col span="3"><label>宝贝标题</label></Col>
        //             <Col span="21">{record.product_name}</Col>
        //         </Row>
        //         <Row>
        //             <Col span="3"><label>收货地址</label></Col>
        //             <Col span="21">{record.address}</Col>
        //         </Row>
        //         <Row>
        //             <Col span="3"><label>订购数量</label></Col>
        //             <Col span="3">{record.product_num}</Col>
        //             <Col span="3"><label>支付方式</label></Col>
        //             <Col span="3">{record.payment_type}</Col>
        //             <Col span="3"><label>下单时间</label></Col>
        //             <Col
        //                 span="3">{record.order_create_time && moment(record.order_create_time * 1000).format(DateTimeFormat)}</Col>
        //             <Col span="3"><label>京东价</label></Col>
        //             <Col span="3">{record.amount_jingdong}</Col>
        //         </Row>
        //         <Row>
        //             <Col span="3"><label>订单金额</label></Col>
        //             <Col span="3">{record.amount_total}</Col>
        //             <Col span="3"><label>结算金额</label></Col>
        //             <Col span="3">{record.amount_due}</Col>
        //             <Col span="3"><label>余额支付</label></Col>
        //             <Col span="3">{record.amount_balance}</Col>
        //             <Col span="3"><label>应付金额</label></Col>
        //             <Col span="3">{record.amount_paid}</Col>
        //         </Row>
        //         <Row>
        //             <Col span="3"><label>订单状态</label></Col>
        //             <Col span="3">{record.order_status}</Col>
        //             <Col span="3"><label>订单类型</label></Col>
        //             <Col span="3">{record.order_type}</Col>
        //             <Col span="3"><label>客户姓名</label></Col>
        //             <Col span="3">{record.contact_name}</Col>
        //             <Col span="3"><label>联系电话</label></Col>
        //             <Col span="3">{record.contact_mobile}</Col>
        //         </Row>
        //
        //         <Row>
        //             <Col span="3"><label>订单备注</label></Col>
        //             <Col span="3">{record.buyer_remark}</Col>
        //             <Col span="3"><label>发票类型</label></Col>
        //             <Col span="3">{record.invoice_type}</Col>
        //             <Col span="3"><label>发票抬头</label></Col>
        //             <Col span="3">{record.invoice_title}</Col>
        //             <Col span="3"><label>发票内容</label></Col>
        //             <Col span="3">{record.invoice_content}</Col>
        //         </Row>
        //         <Row>
        //             <Col span="3"><label>商家备注</label></Col>
        //             <Col span="3">{record.order_remark}</Col>
        //             <Col span="3"><label>商家备注等级</label></Col>
        //             <Col span="3">{record.order_remark_level}</Col>
        //             <Col span="3"><label>运费金额</label></Col>
        //             <Col span="3">{record.ship_due}</Col>
        //             <Col span="3"><label>付款确认时间</label></Col>
        //             <Col
        //                 span="3">{record.order_pay_time && moment(record.order_pay_time * 1000).format(DateTimeFormat)}</Col>
        //         </Row>
        //         <Row>
        //             <Col span="3"><label>增值税发票</label></Col>
        //             <Col span="3">{record.invoice_value_added_tax}</Col>
        //             <Col span="3"><label>货号</label></Col>
        //             <Col span="3">{record.product_no}</Col>
        //             <Col span="3"><label>订单完成时间</label></Col>
        //             <Col
        //                 span="3">{record.order_finish_time && moment(record.order_finish_time * 1000).format(DateTimeFormat)}</Col>
        //             <Col span="3"><label>订单来源</label></Col>
        //             <Col span="3">{record.order_source}</Col>
        //         </Row>
        //         <Row>
        //             <Col span="3"><label>订单渠道</label></Col>
        //             <Col span="3">{record.order_channel}</Col>
        //             <Col span="3"><label>送装服务</label></Col>
        //             <Col span="3">{record.service_install}</Col>
        //             <Col span="3"><label>服务费</label></Col>
        //             <Col span="3">{record.service_install}</Col>
        //             <Col span="3"><label>仓库</label></Col>
        //             <Col span="3">{record.warehouse_name}({record.warehouse_id})</Col>
        //         </Row>
        //     </div>
        // }

        const getOrderDetail = (record) => {
            return (
                <div className={styles.orderExtInfo}>
                    <Row>
                        <Col span="3"><label>宝贝标题</label></Col>
                        <Col span="21">{record.title}</Col>
                    </Row>
                    <Row>
                        <Col span="3"><label>收货地址</label></Col>
                        <Col span="21">
                            {`${record.receiver_state && record.receiver_state !== 'null'  ? `${record.receiver_state} ` : ''
                            }${record.receiver_city && record.receiver_city !== 'null' ? `${record.receiver_city} ` : ''
                            }${record.receiver_district && record.receiver_district !== 'null' ? `${record.receiver_district} ` : ''
                            }${record.receiver_address && record.receiver_address !== 'null' ? `${record.receiver_address} ` : ''}`
                            }
                        </Col>
                    </Row>
                    <Row>
                        <Col span="3"><label>买家应付货款</label></Col>
                        <Col span="3">{record.order_payment/100}</Col>
                        <Col span="3"><label>买家应付邮费</label></Col>
                        <Col span="3">{record.freight_price/100}</Col>
                    </Row>
                    <Row>
                        <Col span="3"><label>买家实际支付金额</label></Col>
                        <Col span="3">{record.real_payment/100}</Col>
                        <Col span="3"><label>订单状态</label></Col>
                        <Col span="3">{record.order_status.value}</Col>
                    </Row>
                    <Row>
                        <Col span="3"><label>收货人姓名</label></Col>
                        <Col span="3">{record.receiver_name}</Col>
                        <Col span="3"><label>联系手机</label></Col>
                        <Col span="3">{record.receiver_mobile}</Col>
                    </Row>
                    <Row>
                        <Col span="3"><label>订单创建时间</label></Col>
                        <Col
                            span="3">{record.order_start_time && moment(record.order_start_time * 1000).format(DateTimeFormat)}</Col>
                        <Col span="3"><label>订单付款时间</label></Col>
                        <Col
                            span="3">{record.pay_time && moment(record.pay_time * 1000).format(DateTimeFormat)}</Col>
                    </Row>
                    <Row>
                        <Col span="3"><label>宝贝总数量</label></Col>
                        <Col span="3">{record.total_num}</Col>
                    </Row>
                    <Row>
                        <Col span="3"><label>店铺名称</label></Col>
                        <Col span="3">{record.seller_nick}</Col>
                    </Row>
                </div>
            )

        }

        // let showInfo = '';
        // if (detail) {
        //     if (detail.store.type === config.storeTypeKeys.TAOBAO) {
        //         showInfo = getTaobao(detail.detail || detail);
        //     } else if (detail.store.type === config.storeTypeKeys.JINGDONG) {
        //         showInfo = getJD(detail.detail || detail);
        //     }
        // }

        let showInfo = getOrderDetail(detail.detail || detail)

        return (
            <div className={styles.order}>
                {showInfo}
            </div>
        )
    }
}
