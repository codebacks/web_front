'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户:[吴明]
 */
import React from 'react'
import {Modal, Table,Tabs,InputNumber,Radio ,message,Icon ,Button,Checkbox} from 'antd'
import {connect} from 'dva'
import {Link} from 'dva/router'
import styles  from './index.less'
@connect(({ base, crm_customerPool_paySMS}) => ({
    base, crm_customerPool_paySMS
}))
export default class extends React.Component {
    constructor(props) {
        super()
        this.state = {
            loading:false,
            data:[{
                id:1,
                name:'500元超值短信包',
                include:'10000',
                per_price:0.05,
                num:'',
                count:0,
                total_price:'0'
            },{
                id:2,
                name:'5000元超值短信包',
                include:'125000',
                per_price:0.04,
                num:'',
                count:0,
                total_price:'0'
            }],
            totalMoney:0,
            totalNum:0,
            num:0,
            money:0,
            combo:1,
            payOk:0,
            channel:'alipay_pc_direct',
            checked:false
        }
    }
    handleCancelTip = () =>{
        this.props.dispatch({
            type:'crm_customerPool/smsCount',
            payload:{
            },
            callback:(count)=>{
                this.props.onCancel(count)

                this.interval= setTimeout(()=>{
                    this.setState({
                        payOk:0
                    })
                })
            }
        })
    }
    handleCancel = () => {
        this.props.onCancel()
    }
    componentWillUnmount() {
        clearInterval(this.interval)
    }
    changeTabs = (value) =>{
        this.setState({
            combo:value 
        })
    }
    handleOk = () =>{
        const {totalMoney ,combo, money,totalNum,num,data,channel,checked} = this.state
        let origin = window.location.origin
        if(combo == 1 && !totalMoney){
            message.warn('请输入购买数量')
            return false
        }
        if(combo == 2 &&  !num) {
            message.warn('请输入购买数量')
            return false
        }
        if(!checked){
            message.error('请阅读并同意《短信服务使用协议》')
            return false
        }
        var pressorder = ()=>{
            var promise = new Promise((resolve,reject)=>{
                this.props.dispatch({
                    type:'crm_customerPool_paySMS/pressOrder',
                    payload:{
                        pay_way:3,
                        ext_info:combo==1?`套餐购买了${totalNum}条短信`:`按条购买了${num}条短信`,
                        type:combo,
                        channel:channel,
                        number:combo==2?num :'',
                        packages:combo == 1?[{
                            type: data[0].id,
                            number:data[0].count
                        },{
                            type: data[1].id,
                            number:data[1].count
                        }]:''
                    },
                    callback:(data)=>{
                        resolve(data)
                    }
                })
            })
            return promise
        }

        pressorder().then(data=>{
            this.props.dispatch({
                type:'crm_customerPool_paySMS/recharge',
                payload:{
                    id:data.data.id,
                    channel:channel,
                    extra:channel === 'alipay_pc_direct'?{
                        success_url:`${origin}/crm/hand_send/message_recharge_record`
                    }:{}
                },
                callback:(value)=>{
                    this.setState({
                        // payOk:1,
                        totalMoney:0,
                        totalNum:0,
                        num:0,
                        money:0
                    })
                    // 支付宝支付
                    if(channel === 'alipay_pc_direct'){
                        var pingpp = require('pingpp-js')  

                        // pingpp.setUrlReturnCallback(function (err, url) {
                        //     window.open(url,'_blank')
                        // }, ['alipay_pc_direct']) 
                        pingpp.createPayment(value.payment.charge, function(result, err) {
                            if (result == "success") {
                                // 只有微信公众账号 (wx_pub)、微信小程序 (wx_lite)、QQ 公众号 (qpay_pub)、支付宝口碑 (alipay_qr)
                                // 支付成功的结果会在这里返回，其他的支付结果都会跳转到 extra 中对应的 URL。
                            } else if (result == "fail") {
                                // data 不正确或者微信公众账号/微信小程序/QQ 公众号/支付宝口碑支付失败时会在此处返回
                            } else if (result == "cancel") {
                                // 微信公众账号、微信小程序、QQ 公众号、支付宝口碑支付取消支付
                            }
                        })
                    }else if(channel === 'wx_pub_qr'){
                        window.location.href=`/setting/version_information/charge/wechat?charge_id=${value.charge_id}&type=message&callback=crm/hand_send/message_recharge_record`
                    }else if(channel === 'native_b2b'){
                        window.location.href=`/setting/version_information/charge/publictransfer?charge_id=${value.charge_id}`
                    } 
                }
            })
        })
    }
    handleChangeChannel = (e)=>{
        this.setState({
            channel:e.target.value
        })
    }
    onChange = (value,index) =>{
        const {data} = this.state
        if(!isNaN(value)){
            data[index].num = value
            data[index].count = value
            if(index===0){
                data[index].total_price = value * 500
                data[index].num = value * data[index].include
            }else {
                data[index].total_price = value * 5000
                data[index].num = value * data[index].include
            }
            const totalMoney = Number(data[0].total_price) + Number(data[1].total_price)
            const totalNum = Number(data[0].num) + Number(data[1].num)
            this.setState({
                ...data,
                totalMoney:totalMoney,
                totalNum:totalNum
            })
        }
    }
    onChangeMessageNum = (value) =>{
        if(!isNaN(value)){
            const nums = value
            const moneys = (value*0.05).toFixed(2)
            this.setState({
                num:nums,
                money:moneys
            })
        }
    }
    componentDidMount() {
        this.interval = null
    }
    onChangeChecked = ()=>{
        const {checked} = this.state
        this.setState({
            checked:!checked
        })
    }
    hanldeOpenAgree =(e)=>{
        // e.stopPropagation()
        e.preventDefault()
        window.open('/agreement/messageRule','_blank')

    }
    render() {
        const {data,loading,totalMoney,totalNum,num,money,payOk,channel} = this.state
        const TabPane = Tabs.TabPane
        const RadioGroup = Radio.Group
        const columns = [
            {
                title: '短信包',
                dataIndex: 'name',
                key:'name'
            },
            {
                title: '包含短信（条）',
                dataIndex: 'include',
                key:'include'
            },
            {
                title: '单价（条/元）',
                dataIndex: 'per_price',
                key:'per_price'
            },
            {
                title: '购买数量',
                render:(text,record,index)=>{
                    return <InputNumber 
                        min={0}
                        max={99999999}
                        placeholder='请输入'  
                        formatter={value => `${value}`}
                        parser={value => value.replace(/\./g, '')}
                        onChange={(value)=>this.onChange(value,index)} />
                }
            },
            {
                title: '总价（元）',
                dataIndex: 'total_price',
                key:'total_price'
            }
        ]
        return (
            payOk ? (<Modal
            visible={this.props.visible}
            className={styles.payModel}
            title="提示"
            onCancel={this.handleCancelTip}
            footer={null}
          >
            <div className={styles.payHelp}>
                <Icon type="exclamation-circle" theme="filled" className={styles.icon} />
                <div>
                    <p>在完成付款之前，请不要关闭这个窗口</p>
                    <p>支付完成后，根据您的情况，请点击下面的按钮</p>
                    <p>
                        <Button ><a href='http://newhelp.51zan.cn/manual/content/%E5%AE%A2%E6%88%B7%E7%AE%A1%E7%90%86/%E7%9F%AD%E4%BF%A1%E7%AE%A1%E7%90%86/%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98.md'>支付遇到问题</a></Button>
                        <Button type="primary"  style={{'marginLeft':'16px'}}><Link to='/crm/sms_batch_send/sms_account'>支付完成</Link></Button>
                    </p>
                </div>
            </div>
            </Modal>):
        (<Modal visible={this.props.visible}
            title='购买短信'
            className={styles.payModel}
            onCancel={this.handleCancel}
            onOk={this.handleOk}
            okText="支付"
            cancelText="返回"
            width={800}>
            <Tabs defaultActiveKey="1"  onChange={(value)=>{this.changeTabs(value)}}>
                <TabPane tab="套餐购买" key="1">
                    <Table
                        columns={columns}
                        dataSource={data}
                        size="middle"
                        loading={loading}
                        rowKey={record => record.id}
                        pagination={false}
                    />
                    <div className={styles.totalMessage}>准备购买<span>{totalNum}</span>条短信，待支付<span>￥{totalMoney}</span>元，购买后短信拥有条数<span>{totalNum+this.props.smsCount}</span>条</div>
                    <div>付款方式： 
                        <RadioGroup onChange={this.handleChangeChannel} value={channel}>
                            <Radio value='alipay_pc_direct'><img src={require('../../../assets/images/zhifubao@2x.png')} alt="支付宝"  style={{height:22}}/></Radio>
                            <Radio value='wx_pub_qr'><img src={require('../../../assets/images/weixinzhifu@2x.png')} alt="微信支付"  style={{height:22}}/></Radio> 
                            <Radio value='native_b2b'>对公转账</Radio>
                        </RadioGroup>
                    </div>
                </TabPane>
                <TabPane tab="按条购买" key="2">
                    <div>购买<InputNumber 
                        min={1}
                        max={99999999}
                        style={{'margin':'0 8px','width':'120px'}}
                        placeholder='请输入'  
                        formatter={value => `${value}`}
                        parser={value => value.replace(/\./g, '')}
                        onChange={(value)=>this.onChangeMessageNum(value)} />条  <span style={{marginLeft:16}}>注：每条单价 0.05 元</span></div>
                    <div className={styles.totalMessage}>准备购买<span>{num}</span>条短信，待支付<span>￥{money}</span>元，购买后短信拥有条数<span>{num+this.props.smsCount}</span>条</div>
                    <div>付款方式：<RadioGroup onChange={this.handleChangeChannel} value={channel}>
                            <Radio value='alipay_pc_direct'><img src={require('../../../assets/images/zhifubao@2x.png')} alt="支付宝"  style={{height:22}}/></Radio>
                            <Radio value='wx_pub_qr'><img src={require('../../../assets/images/weixinzhifu@2x.png')} alt="微信支付"  style={{height:22}}/></Radio> 
                            <Radio value='native_b2b'>对公转账</Radio>
                        </RadioGroup>
                    </div>
                </TabPane>
            </Tabs>
            <Checkbox  style={{marginTop:16}}  checked={this.state.checked}  onChange={this.onChangeChecked} >本人已阅读并同意 <span onClick={(e)=>{this.hanldeOpenAgree(e)}} style={{color: '#4391FF',cursor: 'pointer'}}>《短信服务使用协议》</span></Checkbox>
        </Modal>)
        )
    }
}
