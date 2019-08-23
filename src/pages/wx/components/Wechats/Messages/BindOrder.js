import React from 'react'
import {Row, Col, Button, Select, Modal, notification} from 'antd'
import styles from './BindOrder.scss'
import config from 'wx/common/config'
import moment from 'moment'

const Option = Select.Option
const {DateTimeFormat} = config

export default class extends React.Component {
    constructor(props) {
        super()
        this.state = {
            order: {}
        }
    }


    componentDidMount() {
        this.loadOrders()

    }

  loadOrders = () => {
      let mobile = this.props.base.unique_name
      if (mobile) {
          this.props.dispatch({
              type: 'messages/queryOrders',
              payload: {params: {limit: 100, mobile: mobile}},
          })
      }
  };
  handleBind = () => {
      if (!this.state.order.id) {
          notification.error({
              message: '错误提示',
              description: '请选择关联的订单!',
          })
          return false
      }
      this.props.dispatch({
          type: 'messages/bindOrder',
          payload: {
              id: this.props.messages.record.id,
              body: {outer_order_id: this.state.order.outer_order_id, store_id: this.state.order.store.id}
          },
          callback: (res) => {
              this.handleCancel()
          }
      })

  };

  handlePlanChange = (val) => {
      this.setState({plan_id: val})
  };

  handleCancel = () => {
      this.props.dispatch({
          type: 'messages/setProperty',
          payload: {bindModal: false}
      })

  };
  handleOrderChange = (val) => {
      //后面支持手动输入
      const {orders} = this.props.messages
      let order = orders.filter((item) => {
          return item.id === window.parseInt(val)
      })
      if (order.length) {
          this.setState({order: order[0]})
      } else {
          this.setState({order: {}})
      }
  };

  render() {
      const {bindModal, orders, bindLoading} = this.props.messages
      let val = this.state.order.id ? this.state.order.id + '' : ''
      let order = this.state.order
      return (
          <Modal title="关联订单" visible={bindModal}
              style={{width: '80%'}}
              maskClosable={false}
              onCancel={this.handleCancel}
              footer={[
                  <Button key="cancel" onClick={this.handleCancel}>取消</Button>,
                  <Button key="submit" type="primary" disabled={!order.id} loading={bindLoading}
                      onClick={this.handleBind}>确认</Button>
              ]}
          >
              <div>
                  <div className={styles.desc}>{this.state.message && this.state.message.content}</div>
                  <Row>
                      <Col span="24">
                          <Select
                              // mode="combobox"
                              style={{width: '100%'}}
                              value={val}
                              placeholder="请选择订单"
                              onChange={this.handleOrderChange}>
                              <Option value="">请选择订单</Option>
                              {orders.map((item) => {
                                  return <Option key={item.id}
                                      value={'' + item.id}>{item.product_name}</Option>
                              })}
                          </Select>
                      </Col>
                  </Row>
                  {order.id ?
                      <div className="info-list" style={{paddingTop: 14}}>
                          <Row gutter={8}>
                              <Col span="6"><label>店名:</label></Col>
                              <Col span="18">{order.store.name}</Col>
                          </Row>
                          <Row gutter={8}>
                              <Col span="6"><label>订单编号:</label></Col>
                              <Col span="18">{order.outer_order_id}</Col>
                          </Row>
                          <Row gutter={8}>
                              <Col span="6"><label>商品:</label></Col>
                              <Col span="18">{order.product_name}</Col>
                          </Row>
                          <Row gutter={8}>
                              <Col span="6"><label>金额:</label></Col>
                              <Col span="18">{order.amount_total ? order.amount_total + '元' : ''}</Col>
                          </Row>
                          <Row gutter={8}>
                              <Col span="6"><label>订单状态:</label></Col>
                              <Col span="18">{order.order_status}</Col>
                          </Row>
                          <Row gutter={8}>
                              <Col span="6"><label>订单创建时间:</label></Col>
                              <Col
                                  span="18">{order.order_create_time && moment(order.order_create_time * 1000).format(DateTimeFormat)}</Col>
                          </Row>
                          <Row gutter={8}>
                              <Col span="6"><label>订单付款时间:</label></Col>
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
