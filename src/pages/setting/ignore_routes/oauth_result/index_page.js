import React, {Component} from 'react'
import {connect} from 'dva'
import router from 'umi/router'
import { Icon, Button } from 'antd'
import documentTitleDecorator from 'hoc/documentTitle'
import styles from './index.less'
import api from 'setting/common/api/shops'
const urlArr = {
    'TaoBao': 'https://fuwu.taobao.com/ser/detail.htm?serviceCode=ts-9506&marketKey=FWSPP_MARKETING_URL&activityCode=ACT_25093938_180130170928&itemCode=ts-9506-v6&promIds=1002525802&tracelog=marketing-Detail&sign=BA4D8CE9E6E45B3A83DFF0BFC568D344',
    'JD': 'http://fw.jd.com/385802.html',
}

@connect(({setting_oauthResult, base}) => ({
    setting_oauthResult,
    base,
}))
@documentTitleDecorator()
export default class Index extends Component {
    constructor(props){
        super(props)
        const { accessToken } = this.props.base
        if(!accessToken){
            router.replace('/login')
        }
        this.state = {
            // 授权是否成功
            isSucc: '', 
            // 是否购买服务
            isBuy: false,
            //授权类型
            oauth_type: '',
            //商铺id
            shop_id: '', 
            //授权来源
            auth_source: '', 
            //回跳地址
            redirect_uri: '',  
            // 错误信息
            errorText:'',
        }
    }
    componentDidMount(){
        this.getPageInfo()
    }
    componentWillUnmount(){
        if(this.timer){
            clearInterval(this.timer)
        }
    }
    getPageInfo = ()=> {
        this.setState({
            oauth_type: this.props.location.query.type || '',
            shop_id: parseInt(this.props.location.query.shop_id, 10),
            auth_source: parseInt(this.props.location.query.auth_source, 10),
            redirect_uri: window.location.href,
        }, () => { 
            if(this.props.location.query.code){
                this.saveSuccessInfo()
            }
        })
        //如果存在code
        if(this.props.location.query.code){ 
        }else{
            if(this.props.location.query.error_description){
                //子账号
                if(this.props.location.query.error_description === `subuser can't access`){
                    this.setState({
                        isSucc: false,
                        errorText: '授权失败，子账号无法授权'
                    })
                //没购买
                }else{
                    this.setState({
                        isSucc: false,
                        isBuy: true,
                        errorText: '授权失败，未购买服务'
                    })
                }
            }else{
                this.setState({
                    isSucc: false,
                    errorText: '授权失败，发生异常'
                })
            }
        }
    }
    saveSuccessInfo = () => {
        const { oauth_type, shop_id, auth_source } = this.state
        this.props.dispatch({
            type: 'setting_oauthResult/shopOauthSucc',
            payload:{
                auth_type: oauth_type,
                shop_id: shop_id,
                auth_source: auth_source,
                code: this.props.location.query.code,
            },
            callback: (data)=>{
                if(!data.error){
                    this.setState({
                        isSucc: true
                    })
                } else {
                    // 如果是京东授权，却meta里面含有405则是没购买
                    let isStatus = data.error.response&&data.error.response.status
                    if (auth_source === 2 && isStatus && data.error.response.status === 405) {
                        this.setState({
                            isBuy: true,
                            isSucc: false,
                            errorText: data.error.errorText
                        })
                    } else { 
                        this.setState({
                            isSucc: false,
                            errorText: data.error.errorText
                        })
                    }
                }
            }
        })
    }
    oauthPageAgain = () => {
        let oauth_type = this.props.location.query.type
        let shop_id = parseInt(this.props.location.query.shop_id,10)
        let auth_source = parseInt(this.props.location.query.auth_source,10)
        let redirect_uri = window.location.href
        let len= redirect_uri.indexOf('?')
        if(len!==-1){
            redirect_uri = redirect_uri.substr(0,len)
        }
        if (auth_source === 2) {
            let url = `${api.getJdOauthUrl.url}?oauth_domain=${encodeURIComponent(`${redirect_uri}?&shop_id=${shop_id}&auth_source=2`)}`
            window.open(url)    
        }
        if (auth_source === 1 || auth_source === 4) { 
            let payload
            if (oauth_type) {
                payload= {
                    auth_type: oauth_type || '',
                    shop_id: shop_id,
                    auth_source: auth_source,
                    redirect_uri: `${encodeURIComponent(`${redirect_uri}?type=${oauth_type}&shop_id=${shop_id}&auth_source=${auth_source}`)}`,
                }
            } else { 
                payload= {
                    shop_id: shop_id,
                    auth_source: auth_source,
                    redirect_uri: `${encodeURIComponent(`${redirect_uri}?shop_id=${shop_id}&auth_source=${auth_source}`)}`,
                }
            }
            this.props.dispatch({
                type: 'setting_oauthResult/getOauthUrl',
                payload: payload,
                callback: () => {
                    this.skipToPage()
                }
            })
        }
    }
    skipToPage = ()=>{
        this.skipRefs.click()
    }
    render(){
        const { isSucc, isBuy, errorText, auth_source } = this.state
        return (
            <div style={{height: '100vh',position: 'relative'}}>
                <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)'}}>
                    {    
                        isSucc !== '' &&(
                            isSucc === true ? <SuccessComponent></SuccessComponent>
                                :<FailComponent 
                                    isBuy={isBuy} 
                                    errorText={errorText}
                                    auth_source={auth_source}
                                    oauthPageAgain={this.oauthPageAgain}  
                                ></FailComponent>
                        )
                    }
                    <a ref={node => this.skipRefs = node} href={this.props.setting_oauthResult.auth_url} target='_blank' rel="noopener noreferrer" style={{display: 'none'}}>跳转</a>
                </div>
            </div>
        )
    }
}

class SuccessComponent extends Component {
    render(){
        return (
            <div className={styles.info}>
                <Icon type="check-circle" style={{color: '#52C41A', fontSize: 70, marginBottom: 30}}></Icon>
                <div style={{color: '#52C41A', fontSize: 30, marginBottom: 20}}>恭喜,授权成功!</div>
            </div>
        )
    }
}

class FailComponent extends Component {
    state = {
        skipUrl: ''
    }
    closeOauthPage = ()=> {
        this.props.closePageProps()
    }
    oauthAgain = ()=> {
        this.props.oauthPageAgain()
    }
    goToShop = () => { 
        let url
        const type = this.props.auth_source
        if (type === 1) {
            url = urlArr['TaoBao']
        } 
        if (type === 2) {
            url = urlArr['JD']
        } 

        this.setState({
            skipUrl: url
        }, () => { 
            this.buyRefs.click()
        })
    }
    render(){
        return (
            <div className={styles.info}>
                <Icon type="close-circle" style={{color: '#F5222D', fontSize: 70, marginBottom: 30}}></Icon>
                <div style={{color: '#F5222D', fontSize: 30, marginBottom: 20}}>很遗憾,授权失败!</div>
                <div style={{color: '#999', fontSize: 18, marginBottom: 20}}>{this.props.errorText?this.props.errorText:''}</div>   
                <div>
                    {
                        this.props.isBuy ?
                            <span>
                                <Button style={{marginLeft: 10}} onClick={this.oauthAgain}>再次授权</Button> 
                                <Button style={{marginLeft: 10}} type='primary' onClick={this.goToShop}>去购买</Button> 
                            </span>
                            :
                            <Button style={{marginLeft: 10}} type='primary' onClick={this.oauthAgain}>再次授权</Button> 
                    }                    
                </div>
                <a ref={node => this.buyRefs = node} href={this.state.skipUrl} target='_blank' rel="noopener noreferrer" style={{display: 'none'}}>去购买</a>
            </div>
        )
    }
}