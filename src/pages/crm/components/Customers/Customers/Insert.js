'use strict'

/**
 * 文件说明:转发功能
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 17/2/25
 */

import React from 'react'
import {Form, Row, Col, Modal, Button, Select, notification} from 'antd'
import styles from './index.scss'

const Option = Select.Option
const FormItem = Form.Item

export default class extends React.Component {
    constructor(props) {
        super()
        this.state = {}
    }

    queryPlans = () => {
        this.props.dispatch({
            type: 'crm_customers/queryLatestPlans',
            payload: {params: {limit: 100}},
            callback: (res) => {
            }
        })
    };

    handlePlanChange = (val) => {
        this.setState({plan_id: val})
    };

    componentDidMount() {
        this.queryPlans()
    }

    handleSave = () => {
        const {customer_ids} = this.props
        if (!this.state.plan_id) {
            notification.error({
                message: '错误提示',
                description: '请选择营销计划!',
            })
            return false
        }
        this.props.dispatch({
            type: 'crm_customers/savePlanCustomers',
            payload: {id: this.state.plan_id, customer_ids: customer_ids},
            callback: (res) => {
                notification.success({
                    message: '操作提示',
                    description: '添加成功'
                })
                this.props.onCancel()
            }
        })


    };

    render() {
        const {latestPlans, savePlanCustomersLoading} = this.props.crm_customers
        const {customer_ids} = this.props
        const formItemLayout2 = {
            labelCol: {span: 8},
            wrapperCol: {span: 16},
        }
        const getPlans = () => {
            let _plans = []
            latestPlans.forEach((item) => {
                _plans.push(<Option key={item.id} value={'' + item.id}>{item.title}</Option>)
            })
            return _plans
        }
        return (
            <Modal title="添加到营销计划" visible={this.props.visible}
                onCancel={this.props.onCancel}
                maskClosable={false}
                width={600}
                footer={[
                    <Button key="cancel" type="ghost" onClick={this.props.onCancel}>取消</Button>,
                    <Button key="submit" type="primary" loading={savePlanCustomersLoading} onClick={this.handleSave}>确认</Button>
                ]}>
                <div className={styles.insert}>
                    <Form onSubmit={this.handleSubmit}>
                        <Row>
                            <Col span={20}>
                                <FormItem
                                    {...formItemLayout2}
                                    label="已选人数">
                                    <span className="ant-form-text">{customer_ids.length}人</span>
                                </FormItem>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={20}>
                                <FormItem
                                    {...formItemLayout2}
                                    label="添加到计划">
                                    <Select value={this.state.plan_id} style={{width: '100%'}}
                                        onChange={this.handlePlanChange}>
                                        <Option value="">请选择营销计划</Option>
                                        {getPlans()}
                                    </Select>
                                </FormItem>
                            </Col>
                        </Row>
                    </Form>
                </div>
            </Modal>
        )
    }
}
