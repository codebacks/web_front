/*
 * @Author: sunlzhi 
 * @Date: 2018-09-27 18:27:17 
 * @Last Modified by: sunlizhi
 * @Last Modified time: 2018-11-22 15:34:23
 */

import React, {Component} from 'react'
import {connect} from 'dva'
import {Button, Modal, Steps, Progress} from 'antd'
import config from 'setting/config'
import PaySetting from './components/PaySetting'
import CreateShop from './components/CreateShop'
import styles from './index.less'
import {routerRedux } from 'dva/router'
import Page from '@/components/business/Page'

const confirm = Modal.confirm
const Step = Steps.Step

@connect(({initialization, base, setting_pay}) => ({
    initialization,
    base,
    setting_pay,
}))

export default class Index extends Component {
    constructor(props) {
        super(props)
        this.state = {
            formVisible: false,
            authVisible: false,
            payConfigureVisible: false,
            editPayConfigureOption: '',
            editPayConfigureId: -1,
            confirmLoading: false,
            current: -1,
            percent: 0,
            modalFormProp: {
                label: '',
                title: '',
                visible: false,
            },
            // 支付配置列表
            payConfigure: [
                {
                    id: -1,
                    used_info: '',
                    key: '请选择',
                    update_time	: '',
                    pay_conf_id: -1,
                }
            ],
            // 授权信息
            authInfoData: [],
            // 设置有没有店铺,1代表有，2代表没有
            hasShop: 1,
        }
    }

    // 页面加载调用
    componentDidMount() {
        this.getProcedure()
    }

    componentWillUnmount() {
        clearInterval(this.timer)
    }

    // 获取商城授权到第几步
    getProcedure = () => {
        this.props.dispatch({
            type: 'initialization/procedure',
            payload: {},
            callback: (data) =>{
                let status = data.status - 1
                if (status === 5) {
                    this.props.dispatch(routerRedux.push({
                        pathname: '/mall/overview'
                    }))
                    // const accessToken = this.props.base.accessToken
                    // window.location.href = mallConfig.yqxHost_mall + '/?token=' + accessToken
                } else if(status === 2 || status === 3 || status === 4) {
                    if (status === 2) {
                        this.setState({hasShop: 2})
                    }
                    this.setState({current: 2})
                } else {
                    this.setState({
                        current: status
                    })
                }
                // console.log(data)
            }
        })
    }

    // 解除授权
    showConfirm (app_id) {
        confirm({
            title: '确认要解除吗？',
            content: '解除后，与小程序相关的功能将无法使用，是否确定解除？',
            okText: '确认',
            cancelText: '取消',
            onOk: () => {
                this.props.dispatch({
                    type: 'setting_mpa/mpaUnbind',
                    payload: {
                        app_id: app_id
                    },
                    callback: () => {
                        this.props.dispatch({
                            type: 'setting_mpa/deleteMpa',
                            payload: {
                                app_id: app_id
                            }
                        })
                    }
                })
            },
            onCancel() {},
        })
    }

    // 模态弹窗取消（关闭）
    handleCancel = () => {
        this.setState({
            formVisible: false,
            payConfigureVisible: false,
        })
    }
    
    // 授权弹窗关闭
    handleCancelAuth = () => {
        window.location.reload()
    }

    // 点击授权信息，查看授权状态
    authInfoClick = (app_id) => {
        this.setState({authInfoData: []})
        this.props.dispatch({
            type: 'setting_mpa/getSubAuthInfo',
            payload: {
                app_id: app_id
            },
            callback: (res) => {
                let data = res
                if (data.length && data.length>0) {
                    for (let [i, v] of data.entries()) {
                        v.key = (i+1)
                    }
                    this.setState({authInfoData: data})
                } else {
                }
                // console.log(data)
            }
        })
        this.setState({
            formVisible: true
        })
    }

    // 授权小程序
    addAuth = () => {
        window.open(config.mpaAuth, '_blank')
        this.setState({
            formVisible: false,
            authVisible: true
        })
    }

    // 进度条定时器
    setTimePercent = () => {
        let _this = this
        this.timer = setInterval(() => {
            let percent = _this.state.percent + 10
            if (percent > 100) {
                percent = 100
                clearInterval(_this.timer)

                // const accessToken = _this.props.base.accessToken
                // window.location.href = mallConfig.yqxHost_mall + '/?token=' + accessToken
                this.props.dispatch(routerRedux.push({
                    pathname: '/mall/overview'
                }))
            }
            _this.setState({ percent })
        },100)
    }

    // 子组件修改current步骤
    handleCurrent = (event) =>{
        if (event === 3) {
            this.setState({
                current: event
            },() => {
                this.setTimePercent()
            })
        } else if (event === 2) {
            this.getProcedure()
        }
    }

    render() {
        return <Page>
            <Page.ContentHeader 
                title="虎赞小店"
                helpUrl="http://newhelp.51zan.cn/manual/content/%E8%99%8E%E8%B5%9E%E5%B0%8F%E5%BA%97.md"
            />
            <div className={styles.object}>
                {   this.state.current >= 0 && this.state.current !== 3 &&
                    <div>
                        <Steps className={styles.steps} current={this.state.current}>
                            <Step title="授权管理小程序"/>
                            <Step title="绑定微信支付账号"/>
                            <Step title="绑定管理小程序"/>
                            <Step title="完成"/>
                        </Steps>
                        <div className={styles.stepsInner}>
                            {
                                this.state.current === 0
                                && <div className={styles.mpaAuth}>
                                    <p className={styles.mpaAuthButton} onClick={this.addAuth}>点击进入微信小程序授权界面</p>
                                    <p>没有小程序？<a href="https://mp.weixin.qq.com/wxopen/waregister?action=step1" target="_blank" rel="nofollow me noopener noreferrer">点击注册小程序</a></p>
                                    <img className={styles.mpaAuthImg} src={require('../../assets/initialization1.png')} alt=""/>
                                    <div className={styles.mpaAuthExplain}>
                                        <h4>说明</h4>
                                        <h5>小程序所有权问题</h5>
                                        <p>不提供小程序，小程序必须贵公司自行申请（地址：<a href="https://mp.weixin.qq.com" target="_blank" rel="nofollow me noopener noreferrer">https://mp.weixin.qq.com</a>）。</p>
                                        <h5>绑定小程序</h5>
                                        <p>绑定小程序前，请先进入小程序管理界面（地址：<a href="https://mp.weixin.qq.com" target="_blank" rel="nofollow me noopener noreferrer">https://mp.weixin.qq.com</a>），登陆后在“设置-第三方服务-第三方平台授权管理”路径下取消其他所有授权，确保第三方授权为空，再授权虎赞绑定管理贵公司的小程序。</p>
                                    </div>
                                </div>
                            }
                            {
                                this.state.current === 1
                                && <PaySetting
                                    key={'pay'+this.state.current}
                                    handleCurrent={this.handleCurrent}
                                    {...this.props}
                                />
                            }
                            {
                                this.state.current === 2
                                && <CreateShop
                                    key={'shop'+this.state.current}
                                    handleCurrent={this.handleCurrent}
                                    hasShop={this.state.hasShop}
                                    {...this.props}
                                />
                            }
                        </div>
                    </div>
                }
                {   this.state.current === 3 &&
                    <div className={styles.createAnimate}>
                        <img src={require('../../assets/initialization4.png')} alt=""/>
                        <Progress className={styles.progress} percent={this.state.percent} showInfo={false} strokeWidth={11} ></Progress>
                        {this.state.percent===100?<p>创建成功！</p>:<p>正在创建中…</p>}
                        <div className={styles.mpaAuthExplain}>
                            <h4>说明</h4>
                            <h5>虎赞小店</h5>
                            <p>搭建自己的品牌网店，与客户更多元化链接</p>
                        </div>
                    </div>
                }
                {/* 授权小程序提示 */}
                <Modal visible={this.state.authVisible} title="提示"
                    onCancel={this.handleCancelAuth}
                    footer={[<Button key="back" onClick={this.addAuth}>
                    授权失败，重试
                    </Button>, <Button key="submit" type="primary" onClick={this.handleCancelAuth}>
                    已成功授权
                    </Button>]}>
                    <div>
                        <span className={styles.subAuthTips}>请在新窗口中完成微信小程序授权</span>
                        <a href="http://newhelp.51zan.cn/manual/content/%E7%B3%BB%E7%BB%9F%E8%AE%BE%E7%BD%AE/%E5%B0%8F%E7%A8%8B%E5%BA%8F.md" target="_blank" rel="noopener noreferrer">使用教程</a>
                    </div>
                </Modal>
                {/* <a href={mallConfig.yqxHost_mall + '/?token=' + accessToken} target="_blank" rel="nofollow me noopener noreferrer" ref='link_mall' style={{display: 'none'}}>a</a> */}
            </div>
        </Page>
    }
}

