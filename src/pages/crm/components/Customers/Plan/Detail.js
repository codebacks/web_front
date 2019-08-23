'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 16/12/8
 */
import React from 'react'
import {Modal, Form, Button} from 'antd'
import styles from './Create.scss'
import config from 'crm/common/config'
import moment from 'moment'
import Customers from './Customers'

const FormItem = Form.Item

const {DateFormat} = config

class PlanDetail extends React.Component {
    constructor(props) {
        super()
        this.state = {
            hideResend: false,
            showCustomers: false,
            record: null
        }
    }

    loadDetail = () => {
        this.props.dispatch({
            type: 'crm_plans/detail',
            payload: {id: this.props.record.id}
        })
    };
    reload = () => {
        this.loadDetail()
        this.props.reload()
    };

    componentDidMount() {
        this.loadDetail()
    }

    handleShowCustomers = (record) => {
        this.setState({showCustomers: true, record: record})
    };
    handleCancel = () => {
        this.setState({showCustomers: false})

    };

    render() {
        let innerHeight = this.props.base.winHeight
        let historyHeight = innerHeight - 300
        const {record} = this.props.crm_plans
        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 6},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 14},
            },
        }
        const getMessageContent = (messages) => {
            let message = '', res = [], idx = 1
            for (let key in messages) {
                if (messages.hasOwnProperty(key)) {
                    message = messages[key]
                    if (message.type === 'Text') {
                        res.push(<div key={idx} className={styles.msg}><label>第{idx}条：</label>{message.content}</div>)
                    }
                    if (message.type === 'Picture') {
                        res.push(<div key={idx} className={styles.msg}><label>第{idx}条：</label><img src={message.url}
                            className={styles.msgImg}
                            width="64"/></div>)
                    }
                    idx++
                }
            }
            return res
        }
        return (
            <Modal
                visible={this.props.visible}
                title="营销计划详情"
                onCancel={this.props.onCancel}
                onOk={this.handleSubmit}
                width={800}
                loading={this.props.crm_plans.detailLoading}
                className={styles.createForm}
                maskClosable={false}
                footer={[
                    <Button key="back" size="large" onClick={this.props.onCancel}>关闭</Button>,
                ]}
            >
                {record.id ?
                    <div className={styles.content} style={{height: historyHeight, overflow: 'auto'}}>
                        <Form>
                            <FormItem
                                {...formItemLayout}
                                label="计划标题"
                                hasFeedback
                            >
                                {record.title}
                            </FormItem>
                            <FormItem
                                {...formItemLayout}
                                label="计划描述"
                                hasFeedback
                            >
                                {record.desc}
                            </FormItem>
                            <FormItem
                                {...formItemLayout}
                                label="参加人员">
                                <span onClick={this.handleShowCustomers.bind(this, record)}
                                    className="link">{record.to_customer_ids.length}人</span>
                            </FormItem>
                            <FormItem
                                {...formItemLayout}
                                label="计划人数上限">
                                {record.upper_limit}人
                            </FormItem>
                            <FormItem
                                {...formItemLayout}
                                label="已发送人数">
                                {record.success_customer_ids.length}人
                            </FormItem>
                            <FormItem
                                {...formItemLayout}
                                label="已回复人数">
                                {record.reply_customer_ids.length}人
                            </FormItem>
                            <FormItem
                                {...formItemLayout}
                                label="已转化人数">
                                {record.transfer_customer_ids.length}人
                            </FormItem>
                            <FormItem
                                {...formItemLayout}
                                label="起止日期">
                                {moment(record.start_time * 1000).format(DateFormat)}~
                                {moment(record.end_time * 1000).format(DateFormat)}
                            </FormItem>
                            <FormItem
                                {...formItemLayout}
                                label="创建者">
                                {record.user.nickname}
                            </FormItem>
                            <FormItem
                                {...formItemLayout}
                                label="消息">
                                {getMessageContent(record.messages)}
                            </FormItem>
                        </Form>
                    </div>
                    : ''}
                {this.state.showCustomers ?
                    <Customers {...this.props} visible={this.state.showCustomers}
                        record={this.state.record}
                        reload={this.reload}
                        onCancel={this.handleCancel}/> : ''
                }
            </Modal>
        )
    }
}

export default PlanDetail
