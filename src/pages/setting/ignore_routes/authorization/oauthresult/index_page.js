import React, {Component} from 'react'
import {connect} from 'dva'
import { Icon, Button } from 'antd'
import config from 'setting/config'
import documentTitleDecorator from 'hoc/documentTitle'
import styles from './index.less'

class SuccessComponent extends Component {
    render(){
        return (
            <div className={styles.info}>
                <Icon type="check-circle" style={{color: '#52C41A', fontSize: 70, marginBottom: 30}}></Icon>
                <div style={{color: '#52C41A', fontSize: 30, marginBottom: 20}}>恭喜,授权成功!</div>
                <div style={{color: '#999', fontSize: 18}}>{`本页面将在${this.props.timeLimit}s内自动关闭`}</div>
            </div>
        )
    }
}

class FailComponent extends Component {
    closeOauthPage = ()=> {
        this.props.closePageProps()
    }
    oauthAgain = ()=> {
        this.props.oauthPageAgain()
    }
    render(){
        return (
            <div className={styles.info}>
                <Icon type="close-circle" style={{color: '#F5222D', fontSize: 70, marginBottom: 30}}></Icon>
                <div style={{color: '#F5222D', fontSize: 30, marginBottom: 20}}>很遗憾,授权失败!</div>
                <div style={{color: '#999', fontSize: 18, marginBottom: 20}}>{this.props.failureCause}</div>
                <div>
                    <Button onClick={this.closeOauthPage}>关闭页面</Button> 
                    <Button style={{marginLeft: 10}} type='primary' onClick={this.oauthAgain}>再次授权</Button> 
                </div>
            </div>
        )
    }
}


@connect(({setting_oauthResult, base}) => ({
    setting_oauthResult,
    base,
}))
@documentTitleDecorator()
export default class Index extends Component {
    constructor(){
        super()
        this.state = {
            status: '',
            timeLimit: 5,
            //授权类型
            oauth_type: '',
            //返回的appid
            appid: '',
            //回跳地址
            redirect_uri: '',
            // 失败原因
            failureCause: '',
        }
    }
    componentDidMount(){
        this.getPageInfo()
    }
    pageInit = ()=> {
        let timer = setInterval(()=>{
            let timeLimit = this.state.timeLimit-1
            if(this.state.timeLimit === 0){
                clearInterval(timer)
                this.closeCurrentPage()
            }else{
                this.setState({
                    timeLimit: timeLimit
                })
            }
        },1000)
    }
    // 获取url上的参数信息
    getPageInfo = () => {
        this.setState({
            oauth_type: this.props.location.query.type,
            appid: this.props.location.query.appid,
            redirect_uri: window.location.href,
        }, () => {
            if(this.props.location.query.appid){
                this.saveSuccessInfo()
            }else{
                this.setState({
                    status: false,
                },()=>{
                    let code = parseInt(this.props.location.query.msg, 10)
                    let error_tip = ''
                    switch (code){
                        case 1:
                            error_tip = '系统异常,请稍后再试!'
                            break
                        case 2:
                            error_tip = '系统异常,请稍后再试!'
                            break
                        case 3:
                            error_tip = '使用授权码换取令牌失败,请稍后再试!'
                            break
                        case 4:
                            error_tip = '使用授权码换取令牌失败,请稍后再试!'
                            break
                        case 5:
                            error_tip = '微信接口异常，请稍后重新授权！'
                            break
                        case 6:
                            error_tip = '微信接口异常，请稍后重新授权！'
                            break
                        case 7:
                            error_tip = '获取公众号信息失败!'
                            break
                        case 8:
                            error_tip = '该公众号尚未微信认证，请认证后重试！'
                            break
                        case 10:
                            error_tip = '微信接口异常，请稍后重新授权！'
                            break
                        case 11:
                            error_tip = '微信接口异常，请稍后重新授权！'
                            break
                        case 12:
                            error_tip = '微信接口异常，请稍后重新授权！'
                            break
                        case 13:
                            error_tip = '该小程序尚未微信认证，请认证后重试！'
                            break
                        default:
                            break
                    }
                    this.setState({
                        failureCause: error_tip
                    })
                })
            }
        })
    }
    saveSuccessInfo = ()=> {
        const {oauth_type, appid } = this.state
        this.props.dispatch({
            type: oauth_type === '1'?'setting_oauthResult/subAuth':'setting_oauthResult/mpaAuth',
            payload:{
                app_id: appid,
            },
            callback: (res) => {
                if (res.error) {
                    this.setState({
                        status: false,
                        failureCause: res.error.errorText,
                    },() => {
                    })
                } else {
                    this.pageInit()
                    this.setState({
                        status: true,
                    })
                }
            }
        })
    }
    closePageProps = ()=> {
        this.closeCurrentPage()
    }
    closeCurrentPage = ()=> {
        window.opener=null
        window.open('','_self')
        window.close()
    }
    oauthPageAgain = ()=> {
        const {oauth_type} = this.state
        if (oauth_type === '1') {
            window.location.href = config.mpAuth
            // window.open(config.mpAuth, '_blank')
        } else if (oauth_type === '2') {
            window.location.href = config.mpaAuth
            // window.open(config.mpaAuth, '_blank')
        }
    }
    render(){
        const { timeLimit, status, failureCause } = this.state
        return (
            <div style={{height: '100vh',position: 'relative'}}>
                <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)'}}>
                    {
                        status === true
                            ?(<SuccessComponent 
                                timeLimit={timeLimit}
                            ></SuccessComponent>)
                            :(<FailComponent 
                                timeLimit={timeLimit}
                                failureCause={failureCause}
                                closePageProps={this.closePageProps}
                                oauthPageAgain={this.oauthPageAgain}
                            ></FailComponent>)
                    }
                </div>
            </div>
        )
    }
}