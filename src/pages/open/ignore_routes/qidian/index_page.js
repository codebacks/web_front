import React, { Component } from 'react'
import { connect } from 'dva'
import router from 'umi/router'
import { Button, Form, Icon, Input, Checkbox, Spin } from 'antd'
import { Link } from 'dva/router'
import documentTitleDecorator from 'hoc/documentTitle'
import styles from '../../../ignore_routes/register/index.less'
import _ from 'lodash'
import enterprise_styles from './index.less'
const FormItem = Form.Item

@Form.create()
@connect(({ login, base, register, oem,qidian }) => ({
    register, login, base, oem,qidian
}))
@documentTitleDecorator({
    title: '注册',
})
export default class registerPage extends Component {
    constructor(props){
        super(props)
        this.state = {
            type: 'register',
            autoLogin: false,
            btnDesc: '获取验证码',
            isDisabled: false,
            disable: false,
            password: true,
            comfirmPwd: true,
            isRegister: false,
            checkedAgree: true,
            name:'',
            username:'',
            message:'',
            isLoad:true
        }
    }
    getStorge(){
        return window.localStorage.getItem('isGuidance')
    }
    setStorge(value){
        window.localStorage.setItem('isGuidance',value)
    }
    go = (token) => {
        const { target } = this.props.location.query
        let isGuidance = this.getStorge()
        const to = {
            home: () => {
                // 引导页 isGuidance = 1 时显示
                if(!isGuidance){
                    this.setStorge('1')
                }
                router.replace('/home')
                setTimeout(_=>{
                    window.location.reload()
                })
                
            },
            niukefu: () => {
                const {oemConfig = {}} = this.props.oem
                const { accessToken } = this.props.base
                let url = `${_.get(oemConfig, 'niukefu.url', '')}?access_token=${accessToken || token}&target=qidian`
                if(!isGuidance){
                    this.setStorge('1')
                    setTimeout(_=>{
                        router.push(`/open/guidance?url=${url}&accessToken=${accessToken || token}`)
                    },80)
                }else{
                    window.location.href = url
                }
                
            }
        }
        if (to[target]) {
            to[target]()
        } else {
            to.home()
        }
    }

    registerEnterprise = () =>{
        const { query } = this.props.location
        
        if (query.code) {
            this.props.dispatch({
                type: 'qidian/registerEnterprise',
                payload: {
                    code: query.code
                },
                callback: (data) => {
                    let state = { isLoad:false }
                    if (data.meta && data.meta.code === 200 && !('error' in data)) {
                        data = data.data
                        if (data.type === 'need_bind') {
                            let o = {
                                autoLogin: true,
                                name: data.auth_company && data.auth_company.name,
                                username: data.user && data.user.name
                            }
                            if(data.user && data.user.mobile){
                                o.disable = true
                            }
                            this.setState(o,()=>{
                                if(data.user && data.user.mobile){
                                    this.props.form.setFieldsValue({
                                        mobile: data.user.mobile
                                    })
                                } 
                            })
                        } else if (data.type === 'login_success') {
                            this.props.dispatch({
                                type: 'base/setToken',
                                payload: data.token && data.token.access_token,
                                callback: () => {
                                    this.go(data.token && data.token.access_token)
                                }
                            })
                        }

                    } else {
                        state.autoLogin = false
                        let message = data.meta && data.meta.message
                        if(!message){
                            message = _.get(data,'responseJson.meta.message') || _.get(data,'error.errorText')
                        }
                        state.message = message
                    }
                    this.setState(state)
                }
            })
        }else{
            this.setState({
                isLoad:false,
                autoLogin: false
            })
        }
    }
    componentDidMount() {
        this.registerEnterprise()
        this.addStatictics()
    }
    
    handleRegister = (e) => {
        e.preventDefault()
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const {code} = this.props.location.query
                this.props.dispatch({
                    type: 'qidian/registerEnterpriseBind',
                    payload: {
                        code,
                        contact_mobile: values.mobile,
                        sms_code: values.sms_code,
                        password: values.password1
                    },
                    callback: (data) => {
                        if (data.meta && data.meta.code === 200 && !('error' in data)) {
                            data = data.data
                            if(data.type === 'login_success'){
                                this.props.dispatch({
                                    type:'base/setToken',
                                    payload: data.token && data.token.access_token,
                                    callback:()=> {
                                        setTimeout(_ => {
                                            this.go()
                                        })
                                    }
                                })
                            }
                        }else if(data.meta.code === 1014){
                            let message = data.meta && data.meta.message
                            if(!message){
                                message = _.get(data,'responseJson.meta.message') || _.get(data,'error.errorText')
                            }
                            this.setState({
                                disable:false
                            },()=>{
                                this.props.form.setFields({
                                    mobile:{
                                        value: '',
                                        errors: [ message || '您需要其他手机号' ]
                                    }
                                })
                            })
                            
                        }
                    }
                })
            }
        })
    }
    getMebileSms = (e) => {
        e.preventDefault()
        this.props.form.validateFields(['mobile'], (err, values) => {
            if (!err) {
                this.props.dispatch({
                    type: 'qidian/registerSmsCode',
                    payload: {
                        ...values,
                        type: 'register'
                    },
                    callback: () => {
                        let time = 60
                        this.setState({
                            isDisabled: true
                        })
                        this.timer = setInterval(() => {
                            time--
                            this.setState({
                                btnDesc: `重新获取(${time}S)`
                            })
                            if (time <= 0) {
                                clearInterval(this.timer)
                                this.setState({
                                    isDisabled: false,
                                    btnDesc: '获取验证码'
                                })
                            }
                        }, 1000)
                    }
                })

            }
        })
    }
    handleChangeLogin = () => {
        router.push('/login')
    }
    compareToFirstPassword = (rule, value, callback) => {
        const form = this.props.form
        if (value && value !== form.getFieldValue('password1')) {
            callback('2次密码必须一致')
        } else {
            callback()
        }
    }

    validateToNextPassword = (rule, value, callback) => {
        // const form = this.props.form
        // if (value && form.getFieldValue('password2')) {
        //     form.validateFields(['password2'], { force: true })
        // }
        callback()

    }
    componentWillUnmount() {
        clearInterval(this.timer)
    }
    handleChangeEyes = (key) => {
        const { comfirmPwd, password } = this.state
        if (key === 'comfirmPwd') {
            this.setState({
                comfirmPwd: !comfirmPwd
            })
        } else {
            this.setState({
                password: !password
            })
        }

    }

    addStatictics = () => {
        (function () {
            var hm = document.createElement("script")
            // hm.src = "https://hm.baidu.com/hm.js?06d6ee6b8e442bc9b751fe3dba8fb186"
            hm.src = "https://hm.baidu.com/hm.js?6a3a223361eb0e17831c9dcdd8198342"
            var s = document.getElementsByTagName("script")[0]
            s.parentNode.insertBefore(hm, s)
        })()
    }
    localstorage = () => {
        if (window.localStorage) {
            return window.localStorage
        }
        return {}
    }
    handleChangeAgree = (value) => {
        this.setState({
            checkedAgree: value.target.checked,
        })
    }
    hanldeOpenAgree = (e) => {
        e.preventDefault()
        window.open('/register/agreement', '_blank')

    }
    handleClick = ()=>{
        this.setState({
            disable:false
        },()=>{
            this.props.form.setFieldsValue({
                mobile:''
            })
        })
    }
    render() {
        let random = null
        let storage = this.localstorage()
        random = 1 //storage.getItem('huzan_random')
        if (!random) {
            random = Math.round(Math.random(0.5)) + 1
            storage.setItem('huzan_random', random)
        }
        const { submitting, form } = this.props
        const { getFieldDecorator } = form
        const { btnDesc, isDisabled, comfirmPwd, password,username,name, message } = this.state
        return (
            <div className={styles.mainWarp}>
                <div className={styles.main}>
                    <div className={styles.logo}>
                        <img
                            style={{ height: '56px', width: '300px' }}
                            alt='log'
                            src={require('@/assets/icons/logo_clauses.png')}
                        />
                    </div>

                    <div className={enterprise_styles.title}>
                        {this.state.autoLogin ? <>
                            <span>{name}</span>
                            <span>{username}</span>
                        </> : this.state.isLoad? <Spin size='large'/> : <span>{ message || '' }</span>}

                    </div>
                    {this.state.autoLogin ?
                        <Form onSubmit={this.handleRegister} className={styles.form}>
                            <FormItem>
                                {getFieldDecorator(
                                    'mobile', {
                                        rules: [
                                            {
                                                required: true,
                                                message: '请输入手机号码',
                                            }, {
                                                pattern: /^[0-9]{11}$/, message: '请填写正确11位手机号!',
                                            }
                                        ],
                                    },
                                )(
                                    <Input
                                        type="text"
                                        size="large"
                                        maxLength={11}
                                        disabled={this.state.disable}
                                        placeholder="请输入手机号码"
                                        prefix={<Icon type="mobile" className={styles.prefixIcon} />}
                                        suffix={this.state.disable ? <a onClick={this.handleClick}>修改手机号</a> : null}
                                    />,
                                )}
                            </FormItem>
                            {!this.state.disable ?<FormItem>
                                {getFieldDecorator('sms_code', {
                                    rules: [
                                        {
                                            required: true, message: '请输入短信验证码',
                                        }
                                    ],
                                })(
                                    <Input
                                        size="large"
                                        maxLength={4}
                                        className={styles.authCode}
                                        placeholder="请输入短信验证码"
                                        prefix={<Icon type="safety" className={styles.prefixIcon} />}
                                        suffix={<Button className={isDisabled ? '' : styles.code} disabled={isDisabled} onClick={this.getMebileSms}>{btnDesc}</Button>}
                                    />
                                )}

                            </FormItem>:null}
                            
                            {/*  <FormItem>
                                {getFieldDecorator(
                                    'password1', {
                                        rules: [
                                            {
                                                required: true,
                                                message: '请设置密码，长度8 ~ 16个字符',
                                            },
                                            {
                                                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d_]{8,16}$/,
                                                message: '8-16位字符，支持字母、数字、下划线，请包含大写、小写、数字',
                                            },
                                            {
                                                validator: this.validateToNextPassword,
                                            }
                                        ],
                                    },
                                )(
                                    <Input
                                        type={password ? 'password' : 'text'}
                                        size="large"
                                        maxLength={16}
                                        placeholder="密码,8~16位,至少包含大,小写字母,数字"
                                        prefix={<Icon type="key" className={styles.prefixIcon} />}
                                        suffix={<div onClick={() => { this.handleChangeEyes('password') }}
                                        >{password ? <p className={styles.closeEyes}></p> : <Icon type="eye" className={styles.prefixIcon} />}</div>}
                                    />
                                )}
                            </FormItem>
                            <FormItem>
                                {getFieldDecorator(
                                    'password2', {
                                        rules: [
                                            {
                                                required: true,
                                                message: '请再次输入密码',
                                            },
                                            {
                                                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d_]{8,16}$/,
                                                message: '8-16位字符，支持字母、数字、下划线，请包含大写、小写、数字',
                                            },
                                            {
                                                validator: this.compareToFirstPassword,
                                            }
                                        ],
                                    },
                                )(
                                    <Input
                                        type={comfirmPwd ? 'password' : 'text'}
                                        size="large"
                                        maxLength={16}
                                        placeholder="请再次输入密码"
                                        prefix={<Icon type="check-circle" className={styles.prefixIcon} />}
                                        suffix={<div onClick={() => { this.handleChangeEyes('comfirmPwd') }}>{comfirmPwd ? <p className={styles.closeEyes}></p> : <Icon type="eye" className={styles.prefixIcon} />}</div>}
                                    />,
                                )}
                            </FormItem> */}

                            <FormItem>
                                <Checkbox onChange={(value) => { this.handleChangeAgree(value) }} checked={this.state.checkedAgree}>我已阅读并接受<a onClick={(e) => { this.hanldeOpenAgree(e) }}>《用户协议》</a></Checkbox>
                            </FormItem>
                            <FormItem>
                                <Button
                                    className={styles.submit}
                                    size="large"
                                    type="primary"
                                    htmlType="submit"
                                    disabled={!this.state.checkedAgree}
                                    loading={submitting}
                                > 立即使用
                                </Button>
                            </FormItem>
                        </Form> : null
                    }

                    <footer className={styles.footer}>
                        Copyright 2018.All rights reserved. 沪ICP备17005510号-2
                    </footer>
                </div>
            </div>
        )
    }
}
