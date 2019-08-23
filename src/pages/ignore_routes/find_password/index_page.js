import React, {Component} from 'react'
import {connect} from 'dva'
import {Form, Button, Input, Row, Col} from 'antd'
import router from 'umi/router'
import Link from 'umi/link'
import documentTitleDecorator from 'hoc/documentTitle'
import reactHotDecorator from 'hoc/reactHot'
import styles from './index.less'
import _ from "lodash"

const FormItem = Form.Item
const initCaptchaText = '获取验证码'

@reactHotDecorator()
@Form.create()
@connect(({base, base_findPassword}) => ({
    base,
    base_findPassword,
}))
@documentTitleDecorator({
    title: '找回密码',
})
export default class FindPassword extends Component {
    constructor(props) {
        super(props)
        this.state = {
            confirmDirty: false,
            captchaText: initCaptchaText,
            isSucceed: false,
            mobile: '',
        }
        this.captchaTimer = null
    }

    componentDidMount() {
        this.props.dispatch({
            type: 'base_findPassword/captcha',
            payload: {},
        })
    }

    componentWillUnmount() {
        this.clearCaptchaTimer()
    }

    captchaClick = () => {
        if(this.captchaTimer) {
            return
        }
        const form = this.props.form
        form.validateFields(['mobile', 'captchaValue'], {force: true}, (err, values) => {
            if(!err) {
                this.props.dispatch({
                    type: 'base_findPassword/sentSms',
                    payload: {
                        mobile: values.mobile,
                        type: 'reset_password',
                        captcha: {
                            code: _.get(this, 'props.base_findPassword.captcha.code', ''),
                            value: values.captchaValue,
                        },
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

    restCaptcha = () => {
        this.clearCaptchaTimer()
        this.setState({
            captchaText: initCaptchaText,
        })
    }

    handleSubmit = (e) => {
        e.preventDefault()
        this.props.form.validateFields((err, values) => {
            if(!err) {
                this.props.dispatch({
                    type: 'base_findPassword/findPassword',
                    payload: values,
                    callback: () => {
                        this.setState({
                            isSucceed: true,
                            mobile: values.mobile,
                        })
                    },
                })
            }
        })
    }

    goLogin = () => {
        router.push('/login')
    }

    renderSucceed = () => {
        return (
            <div className={styles.succeed}>
                <img alt={'succeed'} src={require('./images/check.png')}/>
                <div className={styles.title}>您的帐户：{this.state.mobile} 密码修改成功！</div>
                <Button size={'large'} type="primary" onClick={this.goLogin}>重新登陆</Button>
            </div>
        )
    }

    changeCaptcha = () => {
        this.props.dispatch({
            type: 'base_findPassword/captcha',
            payload: {},
        })
    }

    renderForm = () => {
        const {form, base_findPassword} = this.props
        const {captcha} = base_findPassword
        const {getFieldDecorator} = form
        const {captchaText} = this.state
        return (
            <div>
                <div className={styles.title}>找回密码</div>
                <Form onSubmit={this.handleSubmit} className={styles.form}>
                    <FormItem>
                        {getFieldDecorator(
                            'mobile', {
                                rules: [
                                    {
                                        required: true, message: '必填',
                                    },
                                    {
                                        pattern: /^[0-9]{11}$/, message: '11位数字',
                                    },
                                ],
                            },
                        )(
                            <Input size="large" placeholder="11位手机号"/>,
                        )}
                    </FormItem>
                    <FormItem>
                        <Row gutter={8}>
                            <Col span={16}>
                                {getFieldDecorator('captchaValue', {
                                    rules: [
                                        {
                                            required: true, message: '请输入图像验证码',
                                        },
                                    ],
                                })(
                                    <Input size="large" placeholder="图像验证码"/>,
                                )}
                            </Col>
                            <Col span={8}>
                                <img
                                    className={styles.imgCode}
                                    alt={'code'}
                                    src={captcha.src}
                                    onClick={this.changeCaptcha}
                                />
                            </Col>
                        </Row>
                    </FormItem>
                    <FormItem>
                        <Row gutter={8}>
                            <Col span={16}>
                                {getFieldDecorator('sms_code', {
                                    rules: [
                                        {
                                            required: true, message: '请输入验证码',
                                        },
                                    ],
                                })(
                                    <Input size="large" placeholder="短信验证码"/>,
                                )}
                            </Col>
                            <Col span={8}>
                                <Button
                                    style={{width: '100%'}}
                                    size="large"
                                    onClick={this.captchaClick}
                                    disabled={captchaText !== initCaptchaText}
                                >
                                    {captchaText !== initCaptchaText ? `${captchaText}s` : initCaptchaText}
                                </Button>
                            </Col>
                        </Row>
                    </FormItem>
                    <FormItem>
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
                            <Input size="large" type="password" placeholder="8-16位字符，至少包含大写字母、小写字母、数字"/>,
                        )}
                    </FormItem>
                    <FormItem>
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
                            <Input
                                size="large"
                                placeholder="确认密码"
                                type="password"
                                onBlur={this.handleConfirmBlur}
                            />,
                        )}
                    </FormItem>
                    <FormItem>
                        <Button size={'large'} type="primary" htmlType="submit" className={styles.submit}>
                            提交
                        </Button>
                    </FormItem>
                    <div className={styles.toLogin}>
                        <Link to="/login">返回登录</Link>
                    </div>
                </Form>
            </div>
        )
    }

    render() {
        const {isSucceed} = this.state
        return (
            <div className={styles.mainWarp}>
                <div className={styles.main}>
                    <div className={styles.logo}>
                        <img alt={'log'} src='//image.yiqixuan.com/retail/logo/51-logo_x160.png' />
                    </div>
                    {isSucceed ? this.renderSucceed() : this.renderForm()}
                    <footer className={styles.footer}>
                        Copyright 2016.All rights reserved. 沪ICP备17005510号-2
                    </footer>
                </div>
            </div>
        )
    }
}
