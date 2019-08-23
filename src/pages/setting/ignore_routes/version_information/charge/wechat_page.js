
import React,{Fragment} from 'react'
import {connect} from 'dva'
import documentTitleDecorator from 'hoc/documentTitle'
import { Divider } from 'antd'
import {jine} from '../../../../../utils/display'
import styles from './index.less'



@connect(({base,setting_version_information}) => ({
    base,setting_version_information
}))


@documentTitleDecorator({
    title:'微信支付'
})

export default class WechatPay   extends React.Component{
    constructor(props){
        super(props)
        this.state ={
            qrcode:'',
            countDown:'',
            status:'',
            expire:false
        }
    }
    
    componentDidMount () {
        const { charge_id} = this.props.location.query       
        this.queryPayStatus(charge_id)  
        this.checkStatus = setInterval(()=>{
            this.queryPayStatus(charge_id)
        },3000)

    }
    queryPayStatus =(charge_id)=>{
        
        this.props.dispatch({
            type:'setting_version_information/queryOrderStatus',
            payload:{
                id:charge_id
            },
            callback:(data)=>{
                this.setState({
                    status:data.is_paid
                })
                if(data.is_paid){
                    let origin = window.location.origin
                    let  callback_url = this.props.location.query.callback || 'setting/version_information'
                    this.goToPath= setTimeout(()=>{
                        window.location.href= `${origin}/${callback_url}`
                    },2000)
                }
                // 过期、撤销、 已付款、
                if(!data.can_pay){
                    this.setState({
                        expire:true
                    })
                    clearInterval(this.checkStatus)
                }else{
                    clearInterval(this.timer)
                    let   EXPIRATION_TIME_SECONDS =  parseInt((new Date(data.charge_expired_at).getTime() - new Date().getTime())/1000)
                    this.timer = setInterval(()=>{
                        EXPIRATION_TIME_SECONDS --  
                        if(EXPIRATION_TIME_SECONDS<=0){
                            clearInterval(this.timer)
                            this.setState({
                                expire:true
                            })
                        }else{
                            this.getSecondToMinute(EXPIRATION_TIME_SECONDS)
                        }
                    },1000)
            
                }
            }
        })
    }

    getSecondToMinute = (value) => {
        let minute = Math.floor(value/60)
        minute =  minute === 0?'':`${minute}分`
        let second = value % 60
        second =  second === 0?'':`${second}秒`
        this.setState({
            countDown:minute+second
        })
    }  
    paySuccess = () =>{
        const {orderInfo} = this.props.setting_version_information
        const { type } = this.props.location.query 
        return <Fragment>
            <div className={styles.pay_success}>
                <img   src={require('../../../assets/images/success.svg')}  style={{width:40}}/>
                <span>支付成功！</span>
                <span>{
                    !type?'':'系统即将进行服务升级，请稍后登录系统刷新页面查看。'
                }
                </span>    
            </div>
            <div className={styles.versionInformation}>
                <p>
                    订单编号： <span className={styles.bold}> {orderInfo.order_no} </span>
                </p>
                <p>
                【微信支付】 <span>{orderInfo.body}</span>
                </p>
                <p  style={{marginBottom:0}}>
                应付总额：<span className={styles.time}>￥{jine(orderInfo.amount,'','Fen')} </span>   
                </p>
            </div>
        </Fragment>
    } 
    nonPayment = ()=>{
        const {  countDown , expire} = this.state
        const { orderInfo } = this.props.setting_version_information

        return <Fragment>
            <div className={styles.tips}>
                <img  src={require('../../../assets/images/success.svg')}  style={{width:24}}/>               
                <span>订单已提交成功！订单编号为<strong>{orderInfo.order_no}</strong>，请尽快完成支付！</span>
            </div>
            <div className={styles.payInfo}>
                <p className={styles.wechatTitle}>
                    <img   src={require('../../../../../assets/images/wechatPay.svg')}  style={{width:48}}/>
                    <span> 微信支付 </span>
                </p>
                <div className={styles.relative}>
                    <img  className={styles.qrcode}   src={orderInfo.payment?orderInfo.payment.qr:''}   />
                    {
                        expire? <p className={ styles.shade}>
                            <span>当前二维码已失效 请重新提交订单支付！</span>
                        </p>:<p>距离二维码过期还剩 <span className={styles.time}>{countDown}</span>，过期后请重新下单获取二维码</p>
                    }
                </div>
                <p>
                    <span>{orderInfo.body}</span>
                   
                </p>
                <p>
                    应付总额：<span className={styles.time}>¥{jine(orderInfo.amount,'','Fen')}</span>
                </p>
            </div>
        </Fragment>
    }
    
    showContent =(status) =>{
        if(status){
            return  this.paySuccess()
        }else{
            return this.nonPayment()
        }
    }

    componentWillUnmount (){
        clearInterval(this.timer)
        clearInterval(this.checkStatus)
    }
    render(){
        const {  status} = this.state
        const { type } = this.props.location.query 
        return (
            <div className={styles.payContent}>
                <header>
                    {
                        type=== 'stewardversion'?<Fragment>
                            <span className={styles.versionName}>私域管家</span>
                            <Divider type="vertical" />
                        </Fragment>: <img src='//image.yiqixuan.com/retail/logo/51-logo_x160.png' alt="虎赞"  style={{width:44}}   />
                    }     
                    <span>订单支付</span>
                </header>
                {
                    this.showContent(status)
                }
            </div>
        )
    }
}