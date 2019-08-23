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
    Col,
    message,
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
            confirmDirty: false,
            captchaText: initCaptchaText,
        }
        this.captchaTimer = null
    }

    componentWillUnmount() {
        this.clearCaptchaTimer()
    }

    captchaClick = () => {
        if(this.captchaTimer) {
            return
        }
        const form = this.props.form
        form.validateFields(['mobile'], {force: true}, (err, values) => {
            if(!err) {
                this.props.dispatch({
                    type: 'setting_personalInformation/sentSms',
                    payload: {
                        mobile: values.mobile,
                        type: 'modify_password',
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

    handleConfirmBlur = (e) => {
        const value = e.target.value
        this.setState({confirmDirty: this.state.confirmDirty || !!value})
    }

    compareToFirstPassword = (rule, value, callback) => {
        const form = this.props.form
        if(value && value !== form.getFieldValue('password')) {
            callback('两次验证码输入不一致')
        }else {
            callback()
        }
    }

    validateToNextPassword = (rule, value, callback) => {
        const form = this.props.form
        if(value && this.state.confirmDirty) {
            form.validateFields(['confirm'], {force: true})
        }
        callback()
    }

    handleSubmit = (e) => {
        e.preventDefault()
        this.props.form.validateFields((err, values) => {
            if(!err) {
                this.props.dispatch({
                    type: 'setting_personalInformation/updatePassword',
                    payload: values,
                    callback: () => {
                        message.success('更新成功')
                        this.props.onCancel()
                        this.props.form.resetFields()
                        this.restCaptcha()
                    },
                })
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
    }

    render() {
        const {visible} = this.props
        const {getFieldDecorator} = this.props.form

        const formItemLayout = {
            labelCol: {span: 6},
            wrapperCol: {span: 14},
        }

        const {captchaText} = this.state

        return (
            <Modal
                visible={visible}
                title={'修改密码'}
                okText="保存"
                cancelText="取消"
                onCancel={this.onCancel}
                onOk={this.handleSubmit}
                width={520}
            >
                <Form layout={'horizontal'}>
                    <FormItem
                        {...formItemLayout}
                        label="手机号"
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
                                    onClick={this.captchaClick}
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
                                {
                                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d_]{8,16}$/,
                                    message: '8-16位字符，至少包含大写字母、小写字母、数字',
                                },
                                {
                                    validator: this.validateToNextPassword,
                                },
                            ],
                        })(
                            <Input placeholder={'请输入密码'} type="password"/>,
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="确认密码"
                    >
                        {getFieldDecorator('confirm', {
                            rules: [
                                {
                                    required: true, message: '请再次输入密码',
                                },
                                {
                                    validator: this.compareToFirstPassword,
                                },
                            ],
                        })(
                            <Input placeholder={'请再次确认密码'} type="password" onBlur={this.handleConfirmBlur}/>,
                        )}
                    </FormItem>
                </Form>
            </Modal>
        )
    }
}
