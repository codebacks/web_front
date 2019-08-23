'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 16/12/29
 */


import React from 'react'
import {Modal, Row, Col, Select, notification} from 'antd'
import moment from 'moment'
import styles from './BindOrder.scss'
import config from 'data/common/config'

const Option = Select.Option
const {DateTimeFormat} = config
class ModifyForm extends React.Component {
    constructor(props) {
        super()
        this.state = {
            outer_order_id: '',
            record: null,
            store_id: ''
        }
    }

    ////关联订单
    loadOrders = (mobile) => {
        setTimeout(() => {
            this.props.dispatch({
                type: 'data_orders/query',
                payload: {params: {offset: 0, limit: 1000, mobile: mobile}},
            })
        }, 0)
    };
    getOrder = (outer_order_id) => {
        let orders = this.props.data_orders.list
        let order = orders.filter((item) => {
            return item.outer_order_id === outer_order_id
        })
        return order.length ? order[0] : ''
    }
    handleOrderChange = (val) => {
        let order = this.getOrder(val)
        if (order) {
            this.setState({outer_order_id: val, store_id: order.store.id})
        } else {
            this.setState({outer_order_id: val})
        }
    };
    handleStoreChange = (val) => {
        this.setState({store_id: val})
    };
    handleBindOrder = () => {
        //转账绑定订单
        if (this.state.outer_order_id) {
            let message_id = this.state.record.message_id
            setTimeout(() => {
                this.props.dispatch({
                    type: 'data_transfer/bindOrder',
                    payload: {
                        id: message_id,
                        body: {outer_order_id: this.state.outer_order_id, store_id: this.state.store_id},
                        record: this.state.record
                    },
                    callback: () => {
                        this.props.onCancel()
                    }
                })
            }, 0)
        } else {
            notification.error({
                message: '错误提示',
                description: '请选择订单',
            })
        }
    };

    componentDidMount() {
        const record = this.props.record
        this.setState({record: record, outer_order_id: record.outer_order_id || ''})
        this.loadOrders(record.friend.target.mobile)
    }

    render() {
        let orders = this.props.data_orders.list, _orders = []
        let stores = this.props._stores
        if (this.state.store_id) {
            _orders = orders.filter((item) => {
                return item.store.id === window.parseInt(this.state.store_id)
            })
        } else {
            _orders = orders
        }
        let order = ''
        if (this.state.outer_order_id) {
            order = this.getOrder(this.state.outer_order_id)
        }
        return (
            <Modal title="关联订单" visible={this.props.visible}
                style={{width: '80%'}}
                className={styles.editMessageOrder}
                maskClosable={false}
                onOk={this.handleBindOrder} onCancel={this.props.onCancel}
            >
                <div className="form-list">
                    <div className={styles.desc}>{this.state.message && this.state.message.content}</div>
                    <Row gutter={8} className="rowMB">
                        <Col span="6"><label>店铺：</label></Col>
                        <Col span="18">
                            <Select style={{width: '100%'}}
                                value={this.state.store_id + ''}
                                placeholder="请选择店铺"
                                onChange={this.handleStoreChange}>
                                <Option value="">请选择店铺</Option>
                                {stores.map((item) => {
                                    return <Option key={item.id}
                                        value={'' + item.id}>{item.name}</Option>
                                })}
                            </Select>
                        </Col>
                    </Row>
                    <Row gutter={8} className="rowMB">
                        <Col span="6"><label>订单号：</label></Col>
                        <Col span="18">
                            <Select mode="combobox" style={{width: '100%'}}
                                value={this.state.outer_order_id + ''}
                                placeholder="请输入订单号或者选择订单"
                                onChange={this.handleOrderChange}>
                                <Option value="">请选择订单</Option>
                                {_orders.map((item) => {
                                    return <Option key={item.outer_order_id}
                                        value={'' + item.outer_order_id}>{item.product_name}</Option>
                                })}
                            </Select>
                        </Col>
                    </Row>
                    {order ?
                        <div className={styles.orderIntro}>
                            <Row>
                                <Col span="6"><label>编号</label></Col>
                                <Col span="18">{order.outer_order_id}</Col>
                            </Row>
                            <Row>
                                <Col span="6"><label>商品</label></Col>
                                <Col span="18">{order.product_name}</Col>
                            </Row>
                            <Row>
                                <Col span="6"><label>金额</label></Col>
                                <Col span="18">{order.amount_total}元</Col>
                            </Row>
                            <Row>
                                <Col span="6"><label>订单状态</label></Col>
                                <Col span="18">{order.order_status}</Col>
                            </Row>
                            <Row>
                                <Col span="6"><label>订单创建时间</label></Col>
                                <Col
                                    span="18">{order.order_create_time && moment(order.order_create_time * 1000).format(DateTimeFormat)}</Col>
                            </Row>
                            <Row>
                                <Col span="6"><label>订单付款时间</label></Col>
                                <Col
                                    span="18">{order.order_pay_time && moment(order.order_pay_time * 1000).format(DateTimeFormat)}</Col>
                            </Row>
                        </div>
                        : ''}
                </div>
            </Modal>
        )
    }
}

export default ModifyForm
