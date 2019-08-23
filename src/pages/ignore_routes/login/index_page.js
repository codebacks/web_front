import React, {Component} from 'react'
import {connect} from 'dva'
import router from 'umi/router'
import {Button, Col, Form, Icon, Input, Modal, Row, Tabs , Select} from 'antd'
import Link from 'umi/link'
import documentTitleDecorator from 'hoc/documentTitle'
import styles from './index.less'
import _ from "lodash"
// import QRCode from "qrcode.react"

const {TabPane} = Tabs
const FormItem = Form.Item
const Option = Select.Option
// let  ramdom = Math.round(Math.random(0.5))+1

@Form.create()
@connect(({login, loading, base, oem}) => ({
    login,
    base,
    oem,
    submitting: loading.effects['login/login'],
}))
@documentTitleDecorator({
    title: '登录',
})
export default class LoginPage extends Component {
    state = {
        type:'account',
        autoLogin: true,
        captchaData: {},
        qrCodeModal: {
            qrCodeUrl: '',
            title: '',
            visible: false,
        },
        showCaptcha: false,
        errorText: '',
        isShowOldLoginButton: false
    }

    handleCancel = () => {
        const {qrCodeModal} = this.state

        this.setState({
            qrCodeModal: {
                ...qrCodeModal,
                visible: false,
            },
        }, () => {
        })
    }

    componentDidMount() {
        const {accessToken} = this.props.base
        if(accessToken) {
            const query = _.get(this.props.location, 'query')
            if(query && query.redirect_url) {
                let url = query.redirect_url
                if(query.access_token === '1') {
                    this.props.dispatch({
                        type: 'base/authToken',
                        payload: {},
                        callback: () => {
                            url += `?access_token=${accessToken}`
                            window.location = url
                        },
                    })
                }else {
                    window.location = url
                }
            }else {
                this.props.dispatch({
                    type: 'base/getInitData',
                })
                router.replace('/')
            }
        }
    }
    usernameBlur = () => {
        const form = this.props.form
        form.validateFields(['username'], {force: true}, (err, values) => {
            if(!err) {
                this.props.dispatch({
                    type: 'login/check',
                    payload: {
                        mobile: values.username,
                    },
                    callback: (data) => {
                        if(data.captcha) {
                            this.changeCaptcha()
                            this.setState({
                                showCaptcha: true,
                            })
                        }else {
                            this.setState({
                                showCaptcha: false,
                            })
                        }
                    },
                })
            }
        })
    }

    changeCaptcha = () => {
        this.props.dispatch({
            type: 'login/captcha',
            payload: {},
            callback: (data) => {
                this.setState({
                    captchaData: data,
                })
            },
        })
    }

    handleSubmit = (e) => {
        e.preventDefault()

        this.props.form.validateFields(['username','password','captchaValue'],(err, values) => {
            if(!err) {
                if(values.captchaValue) {
                    values.captcha = {
                        value: values.captchaValue,
                        code: this.state.captchaData.code,
                    }
                }
                
                this.setState({
                    errorText: '',
                })
            
                this.props.dispatch({
                    type: 'login/login',
                    payload: {
                        ...values,
                        'grant_type': 'password',
                        'client_id': 9,
                    },
                    callback: (meta, data, error) => {
                        if(meta.code === 200) {
                            this.props.dispatch({
                                type: 'base/getInitData',
                            })
                        }else if(meta.code === 1024) {
                            this.invited(meta)
                        }else if(meta.captcha) {
                            this.changeCaptcha()
                            this.setState({
                                showCaptcha: true,
                            })
                        }
                        if(error || meta.code !== 200){
                            this.setState({
                                errorText: meta? meta.message: error.errorText,
                                isShowOldLoginButton: true
                            })
                        }
                    },
                })
            }
        })
    }

    onSwitch = type => {
        if(type === 'register'){
            router.push('/register')
        }
    }

    invited(meta) {
        this.props.dispatch({
            type: 'login/inviteInfo',
            payload: {
                invited_id: meta.invited_id,
                scene: 'login',
            },
            callback: (data) => {
                const verify_status = _.get(data, 'invitation.verify_status')
                if(verify_status === -1) {
                    this.setState({
                        qrCodeModal: {
                            qrCodeUrl: data.qrcode_url,
                            title: '该账号未申请加入企业，请扫码进行申请',
                            visible: true,
                        },
                    })
                }else if(verify_status === 0) {
                    Modal.warning({
                        title: '该账号正在审核中…',
                        content: '您可以主动联系管理员加速通过吧！',
                    })
                }else if(verify_status === 2) {
                    this.setState({
                        qrCodeModal: {
                            qrCodeUrl: data.qrcode_url,
                            title: '该账号申请被拒绝，请重新扫码申请或联系管理员',
                            visible: true,
                        },
                    })
                }
            },
        })
    }
    // changeAutoLogin = e => {
    //     this.setState({
    //         autoLogin: e.target.checked,
    //     })
    // }

    render() {
        const {submitting, form, oem} = this.props
        const {getFieldDecorator} = form
        const {qrCodeModal, type, captchaData, showCaptcha} = this.state
        return (
            <div className={styles.mainWarp}>
                <div className={styles.main}>
                    <div className={styles.logo}>
                        <img
                            alt={'log'}
                            src={_.get(oem, 'oemConfig.loginLogoSrc')}
                        />
                    </div>
                    <Tabs
                        animated={false}
                        className={styles.tabs}
                        activeKey={type}
                        onChange={this.onSwitch}
                    >
                        <TabPane key="account" tab="登录">
                            <Form onSubmit={this.handleSubmit} className={styles.form}>
                                <FormItem>
                                    {getFieldDecorator(
                                        'username', {
                                            rules: [
                                                {
                                                    required: true,
                                                    message: '请输入手机号',
                                                },
                                                {
                                                    pattern: /^[0-9]{11}$/, message: '请填写正确11位手机号!',
                                                },
                                            ],
                                        },
                                    )(
                                        <Input
                                            onBlur={this.usernameBlur}
                                            size="large"
                                            placeholder="手机号"
                                            prefix={<Icon type="user" className={styles.prefixIcon} />}
                                        />,
                                    )}
                                </FormItem>
                                <FormItem>
                                    {getFieldDecorator(
                                        'password', {
                                            rules: [
                                                {
                                                    required: true,
                                                    message: '请输入密码',
                                                },
                                                {
                                                    pattern: /^[a-zA-Z0-9_]{6,16}$/,
                                                    message: '格式错误',
                                                },
                                            ],
                                        },
                                    )(
                                        <Input
                                            type="password"
                                            size="large"
                                            placeholder="密码"
                                            prefix={<Icon type="lock" className={styles.prefixIcon} />}
                                        />,
                                    )}
                                </FormItem>
                                {
                                    showCaptcha && (
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
                                                        <Input size="large" placeholder="图像验证码" />,
                                                    )}
                                                </Col>
                                                <Col span={8}>
                                                    <img
                                                        className={styles.imgCode}
                                                        alt={'code'}
                                                        src={captchaData.src}
                                                        onClick={this.changeCaptcha}
                                                    />
                                                </Col>
                                            </Row>
                                        </FormItem>
                                    )
                                }
                                <div className={styles.errorTipAndFindPassword}>
                                    <div className={styles.errorTip}>
                                        {this.state.errorText}
                                    </div>
                                    <div className={styles.toFindPassword}>
                                        {/*<Checkbox checked={this.state.autoLogin} onChange={this.changeAutoLogin}>*/}
                                        {/*自动登录*/}
                                        {/*</Checkbox>*/}
                                        <Link to="/find_password">
                                            忘记密码
                                        </Link>
                                    </div>
                                </div>
                                <FormItem>
                                    <Button
                                        className={styles.submit}
                                        size="large"
                                        type="primary"
                                        htmlType="submit"
                                        loading={submitting}
                                    >
                                        登录
                                    </Button>
                                </FormItem>
                            </Form>
                            {
                                this.state.isShowOldLoginButton ?
                                    <div className={styles.oldSystemBox}>
                                        <div>— or —</div>
                                        <div>
                                            老系统用户？<a href='https://www.51zan.cn/login.html' target='_blank' without='true' rel='noopener noreferrer'>去登陆</a>
                                        </div>
                                    </div>
                                    :''
                            }
                        </TabPane>
                        <TabPane key="register" tab="注册">
                        </TabPane>

                    </Tabs>
                    <footer className={styles.footer}>
                        Copyright 2018.All rights reserved. 沪ICP备17005510号-2
                    </footer>
                </div>
                <Modal
                    visible={qrCodeModal.visible}
                    onCancel={this.handleCancel}
                    footer={null}
                    width={440}
                >
                    <div className={styles.qrCodeModal}>
                        <div className={styles.qrCodeTitle}>
                            {qrCodeModal.title}
                        </div>
                        <div className={styles.qrCode}>
                            <img alt={'qrCode'} src={qrCodeModal.qrCodeUrl}/>
                            {/*<QRCode size={158} value={qrCodeModal.qrCodeUrl || ''}/>*/}
                        </div>
                    </div>
                </Modal>
            </div>
        )
    }
}
