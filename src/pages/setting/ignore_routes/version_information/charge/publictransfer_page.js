
import React,{Fragment} from 'react'
import {connect} from 'dva'
import documentTitleDecorator from 'hoc/documentTitle'
import styles from './index.less'
import { Table,Divider } from 'antd'
import { jine } from '@/utils/display'

@connect(({base,setting_version_information}) => ({
    base,setting_version_information
}))


@documentTitleDecorator({
    title:'对公转账'
})

export default class WechatPay   extends React.Component{
    constructor(){
        super()
        this.state ={

        }
    }
    componentDidMount () {
        const { charge_id} = this.props.location.query 
        
        this.props.dispatch({
            type:'setting_version_information/queryOrderStatus',
            payload:{
                id:charge_id
            },
            callback:(data)=>{}
        })
    }
    render(){
        const { orderInfo } = this.props.setting_version_information
        const columns = [{
            title: '姓名',
            dataIndex: 'name',
            width:170,
            key: 'name',
        }, {
            title: '年龄',
            dataIndex: 'content',
            width:400,
            key: 'content',
        }]
        const data=orderInfo.payment?[
            {
                name:'收款银行（必填）',
                content:orderInfo.payment.native.bank_name,
                key:'1'
            },
            {
                name:'银行账号（必填）',
                content:orderInfo.payment.native.bank_account,
                key:'2'
            },
            {
                name:'银行户名（必填）',
                content:orderInfo.payment.native.bank_account_name,
                key:'3'
            },
            {
                name:<span style={{fontWeight:'bold'}}>备注（必填）</span>,
                content:<span style={{fontWeight:'bold'}}>订单编号，如VO061310491295827424</span>,
                key:'4'
            },
        ]:[]
        const { type} = this.props.location.query 
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
                <div className={styles.tips}>
                    <img  src={require('../../../assets/images/success.svg')}  style={{width:24}}/>
                    <span>订单已提交成功！请尽快通过<span className={styles.bold}>「网上银行（网银）」</span>或<span className={styles.bold}>「银行柜台」</span>或<span className={styles.bold}>「手机银行」</span>完成转账！</span>
                </div>
                <div className={styles.transfer}>
                    <div className={styles.versionInfo}>
                        <p>
                            订单编号： <span className={styles.bold}> {orderInfo.order_no} </span>
                        </p>
                        <p style={{    marginLeft: -7}}>
                           【对公转账】 <span>{orderInfo.body} </span>
                        </p>
                        <p>
                           应付总额：<span className={styles.time}>￥{jine(orderInfo.amount,'','Fen')} </span>   
                        </p>
                    </div>
                    <div className={styles.accountInfo}>
                        <p>收款账户信息</p>
                        <Table dataSource={data}     className="ant-table-pagination" columns={columns} bordered showHeader={false} pagination={false} />
                    </div>
                    <div className={styles.attention}>
                        <p className={styles.mustread}> <img  src={require('../../../assets/images/attention.svg')}  className={styles.attentionIcon}/>  特别提醒（转账前必读）</p>   
                        <p>1. 为保证款项及时对账、手机及时发货，转账时请将<span className={styles.highlight}>「订单号」</span>填写至电汇凭证的 <span className={styles.highlight}>「汇款用途」、</span><span className={styles.highlight}>「附言」、</span><span className={styles.highlight}>「摘要」、</span><span className={styles.highlight}>「备注」</span>栏内，以防信息丢失； </p>
                        <p>2. <span className={styles.highlight}>「转账金额」与「订单应付总额」务必保持一致</span>，如果金额错误或分次转账，将无法完成支付，具体到账时间以银行为准；</p>
                        <p>3. 请在<span className={styles.highlight}>48H</span>内付清款项，超期系统会自动关闭订单；</p>
                        <p>4. {
                            type === 'buyphone'?'':'到账后，系统版本将自动升级。'
                        }如有疑问，请联系{
                            type === 'stewardversion'?'':'虎赞'
                        }售后电话：<span className={styles.highlight}>400-0190-739 </span>( 工作日09:30-18:30 )。</p>
                    </div>  
                </div> 
            </div>
        )
    }
}