import React, {Component} from 'react'
import {connect} from 'dva'
import {Form} from 'antd'
import documentTitleDecorator from 'hoc/documentTitle'
import styles from './index.less'
import QrCode from 'qrcode.react'
import { jine } from '@/utils/display'

@Form.create()
@connect(({platform_voicepacket}) => ({
    platform_voicepacket
}))
@documentTitleDecorator({
    title: '微信支付'
})
export default class wechatPay extends Component {
    state = {
        status:0,
        fee:0,
        paid_amount:0,
        charge_amount:0,
        code_url:'',
        name:''
    }


    componentDidMount() {
        const { no } = this.props.location.query
        this.props.dispatch({
            type:'platform_voicepacket/rechargeStatus',
            payload:{
                no:no
            },
            callback:(data)=>{
                this.setState({
                    status:data.status,
                    fee:data.fee,
                    paid_amount:data.paid_amount,
                    charge_amount:data.charge_amount,
                    code_url:data.code_url
                })
            }
        })
        this.props.dispatch({
            type: 'platform_voicepacket/voicePacketsAccount',
            payload: {
            },
            callback:(data) =>{
            }
        })

        this.timer = setInterval(()=>{
            this.props.dispatch({
                type:'platform_voicepacket/rechargeStatus',
                payload:{
                    no:no
                },
                callback:(data)=>{
                    this.setState({
                        status:data.status
                    })
                    if(data.status === 2 || data.status === 3 || data.status === 4 ){
                        clearInterval(this.timer)
                    }
                }
            })
        },2000)
    }
    componentWillUnmount (){
        clearInterval(this.timer)
    }
    render() {
        const {code_url,paid_amount ,charge_amount,fee,status} = this.state
        const { accountInfo } = this.props.platform_voicepacket
        return (
            <div className={styles.vioce_wechat_pay}>
                {
                    status === 2 ? <p style={{marginTop:'212px',marginBottom:'40px'}}>
                        <img  className={styles.wechatPayIcon} src={require('../../../assets/images/rechargeSuccess.svg')} alt=""/>
                        <span className={styles.payName}>充值完成</span>
                    </p>:<div>
                        <p>
                            <img  className={styles.wechatPayIcon} src={require('../../../../../assets/images/wechatPay.svg')} alt=""/>
                            <span className={styles.payName}>微信支付</span>
                        </p>
                        <p>
                            <QrCode value={code_url} size={150}  style={{display:code_url?'inline-block':'none'}}   />
                            <p className={ styles.shade}  style={{'display': status=== 4 ? 'block':'none'}}>
                                <span>二维码已过期请重新支付</span>
                            </p>
                        </p>
                    </div>
                }
                <p className={styles.recharge}>{accountInfo.nick_name}红包账户充值：{jine(paid_amount,'','Fen')}元</p>
                <p className={styles.receive}>到账金额：{jine(charge_amount,'','Fen')}元，服务费：{jine(fee,'','Fen')}元</p>
                <p className={styles.company}>收款方：广州布里吉信息科技有限公司</p>
            </div>
        )
    }
}
