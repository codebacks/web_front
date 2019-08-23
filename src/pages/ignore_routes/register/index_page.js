import React, {Component} from 'react'
import {connect} from 'dva'
import router from 'umi/router'
import {Button, Form, Icon, Input, Tabs, Select,Checkbox,message} from 'antd'
import {Link} from 'dva/router'
import documentTitleDecorator from 'hoc/documentTitle'
import {province as provinceData} from 'crm/components/ChinaRegions/province'
import styles from './index.less'
import _ from "lodash"

const {TabPane} = Tabs
const FormItem = Form.Item
const Option = Select.Option

@Form.create()
@connect(({login, loading, base,register, oem}) => ({
    register,login,base, oem
}))
@documentTitleDecorator({
    title: '注册',
})
export default class registerPage extends Component {
    state = {
        type: 'register',
        autoLogin: true,
        captchaData: {},
        qrCodeModal: {
            qrCodeUrl: '',
            title: '',
            visible: false,
        },
        captchaImg: '',
        captchaCode: '',
        showCaptcha: false,
        btnDesc:'获取验证码',
        isDisabled:false,
        password:true,
        comfirmPwd:true,
        isRegister:false,
        checkedAgree:true
    }



    onSwitch = type => {
        if(type === 'account'){
            router.push('/login')
        }

    }

    componentDidMount() {
        this.addStatictics()
        this.getCaptcha()
    }
    getCaptcha = ()=>{
        this.props.dispatch({
            type:'register/getCaptcha',
            payload:{},
            callback:(res)=>{
                if(res.data&&res.data.src){
                    this.setState({
                        captchaImg: res.data.src,
                        captchaCode: res.data.code,
                    })
                }
            }
        })
    }
    getCaptchaImg = ()=>{
        this.getCaptcha()
    }
    handleRegister = (e) =>{
        e.preventDefault()
        this.props.form.validateFields((err, values) => {
            if(!err){
                this.props.dispatch({
                    type:'register/registerCampany',
                    payload:{
                        mobile:values.mobile,
                        name:values.name,
                        sms_code:values.sms_code,
                        area:values.area,
                        password:values.password1,
                        // inviter_mobile:values.inviter_mobile,
                        channel:'huzan',
                        register_source: 'retail',
                    },
                    callback:()=>{
                        // this.setState({
                        //     isRegister:true 
                        // })
                        this.props.dispatch({
                            type:'login/login',
                            payload:{
                                'grant_type': 'password',
                                'client_id': 9,
                                username:values.mobile,
                                password:values.password1
                            },
                            callback:()=>{
                                window.location.href='/setting/version_information'
                            }
                        })
                    }
                })
            }
        })
    }
    getMebileSms = (e) =>{
        e.preventDefault()
        this.props.form.validateFields(['mobile','captcha'],(err, values) => {
            if(!err){
                this.props.dispatch({
                    type:'register/registerSmsCode',
                    payload:{
                        ...values,
                        captcha: {
                            code: this.state.captchaCode,
                            value: values.captcha,
                        },
                        type:'register'
                    },
                    callback:()=>{
                        let time = 60
                        this.setState({
                            isDisabled:true
                        })
                        this.timer = setInterval( () => {
                            time--
                            this.setState({
                                btnDesc:`重新获取(${time}S)`
                            })
                            if(time <= 0){
                                clearInterval(this.timer)
                                this.setState({
                                    isDisabled:false,
                                    btnDesc:'获取验证码'
                                })
                            }
                        },1000)
                    }
                })

            }
        })
    }
    handleChangeLogin = () =>{
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
        const form = this.props.form
        if (value && form.getFieldValue('password2')) {
            form.validateFields(['password2'], { force: true })
        }
        callback()

    }
    componentWillUnmount (){
        clearInterval(this.timer)
    }
    handleChangeEyes  =(key)=>{
        const {comfirmPwd,password} = this.state
        if( key === 'comfirmPwd' ){
            this.setState({
                comfirmPwd:!comfirmPwd
            })
        }else{
            this.setState({
                password:!password
            })
        }

    }

    addStatictics = () => {
        (function() {
            var hm = document.createElement("script")
            // hm.src = "https://hm.baidu.com/hm.js?06d6ee6b8e442bc9b751fe3dba8fb186"
            hm.src = "https://hm.baidu.com/hm.js?6a3a223361eb0e17831c9dcdd8198342"
            var s = document.getElementsByTagName("script")[0]
            s.parentNode.insertBefore(hm, s)
        })()
    }
    localstorage = () => {
        if(window.localStorage) {
            return window.localStorage
        }
        return {}
    }
    handleChangeAgree = (value) =>{
        this.setState({
            checkedAgree: value.target.checked,
        })
    }
    hanldeOpenAgree = (e)=>{
        e.preventDefault()
        window.open('/register/agreement', '_blank') 
    }
    render() {
        let random = null
        let storage = this.localstorage()
        random = 1 //storage.getItem('huzan_random')
        if(!random){
            random = Math.round(Math.random(0.5))+1
            storage.setItem('huzan_random',random)
        }
        const {submitting, form, oem} = this.props
        const {getFieldDecorator} = form
        const { type, btnDesc, isDisabled, comfirmPwd, password, isRegister, captchaImg} = this.state
        return (
            <div className={styles.mainWarp}>
                <div className={styles.main}>
                    <div className={styles.logo}>
                        <img
                            alt={'log'}
                            src={_.get(oem, 'oemConfig.loginLogoSrc')}
                        />
                    </div>
                    {
                        isRegister? <div>
                            <img src={require('../../../assets/icons/registerSuccess.png')} alt='注册成功' className={styles.successIcon}/>
                            <p className={styles.successDesc}>注册成功</p>
                            {
                                _.get(oem, 'oemConfig.id') === 'huzan' && (
                                    <p className={styles.successInfo}>恭喜您可以免费使用<span style={{'color':'#333'}}>“晒图红包”</span>功能啦！</p>
                                )
                            }
                            <Button
                                size="large"
                                onClick={this.handleChangeLogin}
                                className={styles.btn}
                            >
                                返回登录
                            </Button>
                        </div>:<Tabs
                            animated={false}
                            className={styles.tabs}
                            activeKey={type}
                            onChange={this.onSwitch}
                        >
                            <TabPane key="account" tab="登录">
                            </TabPane>
                            <TabPane key="register" tab="注册">
                                {
                                    parseInt(random, 10) === 1?
                                        <Form onSubmit={this.handleRegister} className={styles.form}>
                                            <FormItem>
                                                {getFieldDecorator(
                                                    'mobile', {
                                                        rules: [
                                                            {
                                                                required: true,
                                                                message: '请输入手机号码',
                                                            },
                                                            {
                                                                pattern: /^[0-9]{11}$/, message: '请填写正确11位手机号!',
                                                            },
                                                        ],
                                                    },
                                                )(
                                                    <Input
                                                        type="text"
                                                        size="large"
                                                        maxLength={11}
                                                        placeholder="请输入手机号码"
                                                        prefix={<Icon type="mobile" className={styles.prefixIcon}/>}
                                                    />,
                                                )}
                                            </FormItem>
                                            <FormItem>
                                                {getFieldDecorator('captcha', {
                                                    rules: [
                                                        {
                                                            required: true, message: '请输入图像验证码',
                                                        }
                                                    ],
                                                })(
                                                    <Input
                                                        size="large"
                                                        maxLength={4}
                                                        className={styles.authCode }
                                                        style={{width: 220}}
                                                        placeholder="请输入图像验证码"
                                                        prefix={<Icon type="barcode" className={styles.prefixIcon}/>}
                                                    />
                                                )}
                                                <div className={styles.captchaImg} onClick={this.getCaptchaImg}><img src={captchaImg || ''} alt=''/></div>
                                            </FormItem>
                                            <FormItem>
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
                                                        className={styles.authCode }
                                                        placeholder="请输入短信验证码"
                                                        prefix={<Icon type="safety" className={styles.prefixIcon}/>}
                                                        suffix={<Button  className={isDisabled? '' : styles.code} disabled={isDisabled}  onClick = {this.getMebileSms}>{btnDesc}</Button>}
                                                    />
                                                )}

                                            </FormItem>
                                            <FormItem>
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
                                                        type={password?'password':'text'}
                                                        size="large"
                                                        maxLength={16}
                                                        placeholder="密码,8~16位,至少包含大,小写字母,数字"
                                                        prefix={<Icon type="key" className={styles.prefixIcon}/>}
                                                        suffix={ <div onClick={ ()=>{this.handleChangeEyes('password')}}>{password ?<p className={styles.closeEyes}></p>: <Icon type="eye" className={styles.prefixIcon}/>}</div>  }
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
                                                        type={comfirmPwd?'password':'text'}
                                                        size="large"
                                                        maxLength={16}
                                                        placeholder="请再次输入密码"
                                                        prefix={<Icon type="check-circle" className={styles.prefixIcon}/>}
                                                        suffix={ <div onClick={ ()=>{this.handleChangeEyes('comfirmPwd')}}>{comfirmPwd ?<p className={styles.closeEyes}></p>: <Icon type="eye" className={styles.prefixIcon}/>}</div>  }
                                                    />,
                                                )}
                                            </FormItem>
                                            <FormItem>
                                                {getFieldDecorator(
                                                    'name'
                                                )(
                                                    <Input
                                                        size="large"
                                                        maxLength={32}
                                                        placeholder="请输入公司名称/店铺名称"
                                                        prefix={<p className={styles.campany}></p>}
                                                    />,
                                                )}
                                            </FormItem>
                                            <FormItem>
                                                {getFieldDecorator(
                                                    'area'
                                                )(
                                                    <Select placeholder='请选择地区' size="large" allowClear >
                                                        {
                                                            provinceData.map((province) => {
                                                                return <Option key={province.name} value={province.name}>{province.name}</Option>
                                                            })
                                                        }
                                                    </Select>
                                                )}
                                                <p className={styles.iconAddr}></p>
                                            </FormItem>
                                            {/* 
                                                <FormItem>
                                                {getFieldDecorator(
                                                    'inviter_mobile', {
                                                        rules: [
                                                            {
                                                                pattern: /^[0-9]{11}$/, message: '请填写正确11位手机号!',
                                                            },
                                                        ],
                                                    },
                                                )(
                                                    <Input
                                                        type="text"
                                                        size="large"
                                                        maxLength={11}
                                                        placeholder="请输入邀请人联系方式"
                                                        prefix={<Icon type="mobile" className={styles.prefixIcon}/>}
                                                    />
                                                )}
                                            </FormItem>
                                            */}
                                            <FormItem>
                                                <Checkbox   onChange={(value)=>{this.handleChangeAgree(value)}} checked={this.state.checkedAgree}>我已阅读并接受<a onClick={(e)=>{this.hanldeOpenAgree(e)}}>《用户协议》</a></Checkbox>
                                            </FormItem>
                                            <FormItem>
                                                <Button
                                                    className={styles.submit}
                                                    size="large"
                                                    type="primary"
                                                    htmlType="submit"
                                                    disabled={!this.state.checkedAgree}
                                                    loading={submitting}
                                                >
                                                    注册并登录
                                                </Button>
                                            </FormItem>
                                        </Form> :
                                        <div className={styles.registerCode}>
                                            <img className={styles.qrcode} src={require('../../../assets/images/qrcode.png')}  alt='' />
                                            <p>使用微信扫描</p>
                                            <p className={styles.desc}>扫码加微信，VIP客服手把手教您使用咯</p>
                                        </div>
                                }

                            </TabPane>

                        </Tabs>

                    }

                    <footer className={styles.footer}>
                        Copyright 2018.All rights reserved. 沪ICP备17005510号-2
                    </footer>
                </div>
            </div>
        )
    }
}
