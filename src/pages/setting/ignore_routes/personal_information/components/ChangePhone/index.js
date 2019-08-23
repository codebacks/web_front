/**
 **@Description:
 **@author: leo
 */

import React, {Component} from 'react'
import {
    Modal,
    Input,
    Form,
    Button,
    Row,
    Col, message,
} from 'antd'
// import _ from 'lodash'
// import styles from './index.less'

const FormItem = Form.Item
const initCaptchaText = '获取验证码'

@Form.create()
export default class Index extends Component {
    constructor(props) {
        super(props)
        this.state = {
            step: 1,
            captchaText: initCaptchaText,
        }
        this.captchaTimer = null
    }

    componentWillUnmount() {
        this.clearCaptchaTimer()
    }

    captchaClick = (fieldName, type) => {
        if(this.captchaTimer) {
            return
        }
        const form = this.props.form
        form.validateFields([fieldName], {force: true}, (err, values) => {
            if(!err) {
                this.props.dispatch({
                    type: 'setting_personalInformation/sentSms',
                    payload: {
                        mobile: values[fieldName],
                        type,
                    },
                    callback: () => {
                        this.setCaptchaTime()
                    },
                })
            }
        })
    }

    clearCaptchaTimer = () => {
        if(this.captchaTimer) {
            window.clearInterval(this.captchaTimer)
            this.captchaTimer = null
        }
    }

    setCaptchaTime = () => {
        if(this.captchaTimer) {
            return
        }
        this.setState({
            captchaText: 60,
        }, () => {
            this.captchaTimer = window.setInterval(() => {
                if(this.state.captchaText === 0) {
                    this.restCaptcha()
                }else {
                    this.setState({
                        captchaText: this.state.captchaText - 1,
                    })
                }
            }, 1000)
        })
    }

    handleSubmit = (e) => {
        e.preventDefault()
        this.props.form.validateFields((err, values) => {
            if(!err) {
                const {step} = this.state

                if(step === 1) {
                    this.props.dispatch({
                        type: 'setting_personalInformation/verifyMe',
                        payload: values,
                        callback: (data) => {
                            this.token = data.token
                            this.props.form.resetFields()
                            this.restCaptcha()
                            this.setState({
                                step: 2,
                            })
                        },
                    })
                }else {
                    this.props.dispatch({
                        type: 'setting_personalInformation/changeMobile',
                        payload: {
                            ...values,
                            ...{
                                token: this.token,
                            },
                        },
                        callback: () => {
                            this.props.dispatch({
                                type: 'base/getInitData',
                            })
                            message.success('更新成功')
                            this.props.onCancel()
                            this.props.form.resetFields()
                            this.restCaptcha()
                        },
                    })
                }
            }
        })
    }

    restCaptcha = () => {
        this.clearCaptchaTimer()
        this.setState({
            captchaText: initCaptchaText,
        })
    }

    onCancel = () => {
        this.props.onCancel()
        this.restCaptcha()
        this.setState({
            step: 1,
        })
        this.token = null
    }

    render() {
        const {visible} = this.props
        const {getFieldDecorator} = this.props.form

        const formItemLayout = {
            labelCol: {span: 6},
            wrapperCol: {span: 14},
        }

        const {step, captchaText} = this.state

        const okText = step === 1 ? '下一步' : '确定'

        return (
            <Modal
                visible={visible}
                title={'更改手机号'}
                okText={okText}
                cancelText="取消"
                onCancel={this.onCancel}
                onOk={this.handleSubmit}
                width={520}
            >
                {
                    step === 1 ? (
                        <Form layout={'horizontal'}>
                            <FormItem
                                {...formItemLayout}
                                label="原手机号"
                            >
                                {getFieldDecorator('mobile', {
                                    rules: [
                                        {
                                            required: true, message: '必填',
                                        },
                                        {
                                            pattern: /^[0-9]{11}$/, message: '11位数字',
                                        },
                                    ],
                                })(
                                    <Input placeholder={'请输入手机号'}/>,
                                )}
                            </FormItem>
                            <FormItem
                                {...formItemLayout}
                                label="验证码"
                            >
                                <Row gutter={8}>
                                    <Col span={14}>
                                        {getFieldDecorator('sms_code', {
                                            rules: [
                                                {
                                                    required: true, message: '请输入验证码',
                                                },
                                            ],
                                        })(
                                            <Input placeholder={'请输入验证码'}/>,
                                        )}
                                    </Col>
                                    <Col span={10}>
                                        <Button
                                            style={{width: '100%'}}
                                            onClick={() => {
                                                this.captchaClick('mobile', 'verify_mobile')
                                            }}
                                            disabled={captchaText !== initCaptchaText}
                                        >
                                            {captchaText !== initCaptchaText ? `${captchaText}s` : initCaptchaText}
                                        </Button>
                                    </Col>
                                </Row>
                            </FormItem>
                        </Form>
                    ) : (
                        <Form layout={'horizontal'}>
                            <FormItem
                                {...formItemLayout}
                                label="新手机号"
                            >
                                {getFieldDecorator('mobile', {
                                    rules: [
                                        {
                                            required: true, message: '必填',
                                        },
                                        {
                                            pattern: /^[0-9]{11}$/, message: '11位数字',
                                        },
                                    ],
                                })(
                                    <Input placeholder={'请输入手机号'}/>,
                                )}
                            </FormItem>
                            <FormItem
                                {...formItemLayout}
                                label="验证码"
                            >
                                <Row gutter={8}>
                                    <Col span={14}>
                                        {getFieldDecorator('sms_code', {
                                            rules: [
                                                {
                                                    required: true, message: '请输入验证码',
                                                },
                                            ],
                                        })(
                                            <Input placeholder={'请输入验证码'}/>,
                                        )}
                                    </Col>
                                    <Col span={10}>
                                        <Button
                                            style={{width: '100%'}}
                                            onClick={() => {
                                                this.captchaClick('mobile', 'modify_mobile')
                                            }}
                                            disabled={captchaText !== initCaptchaText}
                                        >
                                            {captchaText !== initCaptchaText ? `${captchaText}s` : initCaptchaText}
                                        </Button>
                                    </Col>
                                </Row>
                            </FormItem>
                            <FormItem
                                {...formItemLayout}
                                label="登录密码"
                            >
                                {getFieldDecorator('password', {
                                    rules: [
                                        {
                                            required: true, message: '请输入密码',
                                        },
                                    ],
                                })(
                                    <Input placeholder={'请输入密码'}/>,
                                )}
                            </FormItem>
                        </Form>
                    )
                }
            </Modal>
        )
    }
}
