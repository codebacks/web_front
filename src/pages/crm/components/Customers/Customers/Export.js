'use strict'

/**
 * 文件说明:转发功能
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 17/2/25
 */

import React from 'react'
import {Form, Row, Col, Modal, Select, notification, Input, Button} from 'antd'
import styles from './index.scss'

const Option = Select.Option
const FormItem = Form.Item

export default class extends React.Component {
    constructor(props) {
        super()
        this.state = {
            code: '',
            mobile: '',
        }
    }

    componentDidMount() {
        this.initMobile()
    }

    initMobile = () => {
        this.setState({
            mobile: this.props.mobile
        })
    }



    inputSetting(key, type = 'event') {
        // input 默认配置
        let getValue
        if (type === 'event') {
            getValue = e => e.target.value
        } else if (type === 'value') {
            getValue = value => value
        } else if (type === 'checked') {
            getValue = e => e.target.checked
        }
        return {
            value: this.state[key],
            onChange: e => {
                let value = {}
                value[key] = getValue(e)
                this.setState(value)
            },
        }
    }

    handleExportOK = e => {
        return this.props.handleExportOK(e, this.state.code)
    }

    render() {
        const {exportCustomersLoading} = this.props.crm_customers
        const formItemLayout2 = {
            labelCol: {span: 8},
            wrapperCol: {span: 16},
        }
        const {mobile} = this.state

        return (
            <Modal title="手机验证" visible={this.props.visible}
                   onCancel={this.props.onCancel}
                   maskClosable={false}
                   width={600}
                   footer={[
                       <Button key="cancel" type="ghost" onClick={this.props.onCancel}>取消</Button>,
                       <Button key="submit" type="primary" loading={exportCustomersLoading} onClick={this.handleExportOK}>确认</Button>
                   ]}>
                <div className={styles.insert}>

                    <Form onSubmit={this.handleSubmit}>
                        <Row>
                            <Col span={20}>
                                <p>* {/*共导出 10000 条数据，*/}本次操作需要手机验证</p>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={20}>
                                <FormItem
                                    {...formItemLayout2}
                                    label="验证手机号">
                                    <Input
                                        {...this.inputSetting('mobile')}
                                        style={{width: '100%'}}
                                        value={mobile}
                                        disabled={true}
                                    />
                                </FormItem>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={20}>
                                <FormItem>
                                    <Col span={8}>
                                    </Col>
                                    <Col span={16}>
                                        <Button type="primary" onClick={this.props.handleSendCode}>发送验证码</Button>
                                    </Col>
                                </FormItem>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={20}>
                                <FormItem
                                    {...formItemLayout2}
                                    label="短信验证码">
                                    <span>
                                       <Input
                                           {...this.inputSetting('code')}
                                           style={{width: '100%'}}
                                       />
                                    </span>
                                </FormItem>
                            </Col>
                        </Row>
                    </Form>
                </div>
            </Modal>
        )
    }

}
