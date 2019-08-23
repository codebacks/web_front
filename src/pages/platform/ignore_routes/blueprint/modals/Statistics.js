/**
 **@Description:统计
 **@author: wangchunting
 */

import React, { Component } from 'react'
import { Label } from 'components/business/Page'
import { Row, Col, Modal, Card, } from 'antd'
import _ from 'lodash'
import { connect } from 'dva'
import styles from "../../blueprint_audit/index.less"

@connect(({ base, platform_blueprint }) => ({
    base, platform_blueprint
}))

export default class Statistics extends Component {
    constructor(props) {
        super(props)
        this.state = {
            statisticsLoading: false,
            visible: false
        }
    }

    componentDidMount() {
        const { id } = this.props
        if (id) {
            this.setState({
                visible: true,
            })
            this.getStatisticsData(id)
        }
    }

    //获取统计数据
    getStatisticsData = (id) => {
        this.props.dispatch({
            type: 'platform_blueprint/statistics',
            payload: {
                id: id,
            },
            callback: () => {
                this.setState({
                    statisticsLoading: false
                })
            }
        })

    }

    // 关闭
    handleCountCancel = (e) => {
        const { onClose } = this.props
        onClose && onClose()
    }


    render() {
        const { statisticsData } = this.props.platform_blueprint
        const labelLayout = {
            titlelCol: {
                span: 16,
                style: {
                    width: '110px',
                    textAlign: 'right',
                },
            },
            textCol: {
                span: 6,
            }
        }

        return (
            <Modal
                title="统计详情"
                visible={this.state.visible}
                footer={null}
                onCancel={this.handleCountCancel}
            >
                <Card bodyStyle={{ padding: '0' }} bordered={false} loading={this.state.statisticsLoading}>
                    <div className={`${styles.boxTitle} hz-padding-base-bottom`}>
                        <span className={styles.boxTitleIcon}></span>
                        <span className='hz-margin-small-left'>参与活动详情</span>
                    </div>
                    <Row className='hz-padding-base-bottom'>
                        <Col span={12}>
                            <Label title="累计参与人数" text={_.get(statisticsData, 'join_count', '--')} {...labelLayout}></Label>
                        </Col>
                        <Col span={12}>
                            <Label title="累计申请数量" text={_.get(statisticsData, 'apply_count', '--')} {...labelLayout}></Label>
                        </Col>
                    </Row>
                    <Row className='hz-padding-base-bottom'>
                        <Col span={12}>
                            <Label title="支出红包数量" text={_.get(statisticsData, 'red_packet_count', '--')} {...labelLayout}></Label>
                        </Col>
                        <Col span={12}>
                            <Label title="支出红包金额" text={_.get(statisticsData, 'red_packet_amount', '') !== '' ? (_.get(statisticsData, 'red_packet_amount') / 100) : '--'} {...labelLayout}></Label>
                        </Col>
                    </Row>
                    <Row className='hz-padding-base-bottom'>
                        <Col span={12}>
                            <Label title="返现客户人数" text={_.get(statisticsData, 'customer_count', '--')} {...labelLayout}></Label>
                        </Col>
                        <Col span={12}>
                            <Label title="参与订单总数" text={_.get(statisticsData, 'order_count', '--')} {...labelLayout}></Label>
                        </Col>
                    </Row>
                    <div className={`${styles.boxTitle} hz-padding-base-bottom`}>
                        <span className={styles.boxTitleIcon}></span>
                        <span className='hz-margin-small-left'>订单审核详情</span>
                    </div>
                    <Row className='hz-padding-base-bottom'>
                        <Col span={12}>
                            <Label title="待审核订单数" text={_.get(statisticsData, 'review_pending_count', '--')} {...labelLayout}></Label>
                        </Col>
                        <Col span={12}>
                            <Label title="已通过订单数" text={_.get(statisticsData, 'pass_count', '--')} {...labelLayout}></Label>
                        </Col>
                    </Row>
                    <Row className='hz-padding-base-bottom'>
                        <Col span={12}>
                            <Label title="待确定订单数" text={_.get(statisticsData, 'confirm_pending_count', '--')} {...labelLayout}></Label>
                        </Col>
                        <Col span={12}>
                            <Label title="已拒绝订单数" text={_.get(statisticsData, 'reject_count', '--')} {...labelLayout}></Label>
                        </Col>
                    </Row>
                </Card>
            </Modal>
        )
    }
}
