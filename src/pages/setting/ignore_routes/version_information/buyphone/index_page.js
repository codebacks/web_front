import React, { Fragment } from 'react'
import {connect} from 'dva'
import Page from '@/components/business/Page'
import {Form, Row,Radio,InputNumber,Input,Checkbox,Button,Col,message,Modal,Icon,Cascader,Table } from 'antd'
import {jine} from '@/utils/display'
import {AREA_DATA} from 'components/business/CitySelect/AreaData'
import documentTitleDecorator from 'hoc/documentTitle'
import  styles  from './index.less'
@connect(({base,setting_version_information}) => ({
    base,setting_version_information
}))
@Form.create()
@documentTitleDecorator({
    title:'购买手机'
})
export default class buyversion extends React.Component{
    constructor(props){
        super(props)
        this.state ={
            default_version:'',
            year:1,
            purchase:true,
            phone_id:'',
            phone_num:1,
            chooseVersion:[],
            choosePhone:[],
            channel:'alipay_pc_direct',
            checked:false,
            province_id:undefined,
            city:undefined,
            visible:false,
            phone:[]
        }
    }
    componentDidMount () {
        // this.props.dispatch({
        //     type:'setting_version_information/currentVersion',
        //     payload:{},
        //     callback:(data)=>{
        //     }
        // })
        
        this.props.dispatch({
            type:'setting_version_information/phoneInfo',
            payload:{},
            callback:(data)=>{
                const phone = data&&data.filter(item=>item.stock_count>0).map(item=>{
                    return {
                        ...item,
                        checked:true,                        
                        num:1,
                    }
                })
                this.setState({phone})
            }
        })
    }

    handleChangeChannel = (e)=>{
        this.setState({
            channel:e.target.value
        })
    }
    handleChangePhoneNum = (value=1) =>{
        if(value === null || isNaN(value)){
            value =1
        }
        this.setState({
            phone_num:  value>10000?10000:value
        })
    }
    onChangeChecked = (e)=>{
        this.setState({
            checked: e.target.checked,
        })
    }
    handlerecharge=()=>{
        const {channel,checked,phone} = this.state
        this.props.form.validateFields((err, values) => {         
            if (!err) {
                if(checked){
                    const phones = phone && phone.filter(item=>item.checked).map(value=>{
                        return {
                            id:value.id,
                            count:value.num
                        }
                    })
                    let formObj = {
                        receiver_address:  `${values.address.join('')} ${values.receiver_address}`,   
                        mobile:values.mobile,
                        consignee:values.consignee,
                        channel:channel,
                        item:{
                            phone:phones
                        }
                    }

                    let origin = window.location.origin
                    
                    let creatorder= ()=>{
                        var create_order = new Promise( (resolve,reject)=>{
                            this.props.dispatch({
                                type:'setting_version_information/createVersionOrder',
                                payload:formObj,
                                callback:(data)=>{
                                    resolve(data)
                                }
                            })
                        })
                        return create_order
                    }
                    creatorder().then((data)=>{
                        
                        this.props.dispatch({
                            type:'setting_version_information/upgradeVersionCharge',
                            payload:{
                                no:data.no,
                                channel:channel,
                                extra:channel === 'alipay_pc_direct'?{
                                    success_url:`${origin}/setting/version_information`
                                }:{}
                            },
                            callback:(value)=>{
                                // this.setState({
                                //     visible:true
                                // })
                                // 支付宝支付
                                if(channel === 'alipay_pc_direct'){
                                    
                                    var pingpp = require('pingpp-js')  

                                    // pingpp.setUrlReturnCallback((err, url)=> {
                                    //     url&&this.newWin.location.replace(url)
                                    // }, ['alipay_pc_direct']) 
                                    pingpp.createPayment(value.payment.charge, function(result, err) {
                                        if (result === "success") {
                                            // 只有微信公众账号 (wx_pub)、微信小程序 (wx_lite)、QQ 公众号 (qpay_pub)、支付宝口碑 (alipay_qr)
                                            // 支付成功的结果会在这里返回，其他的支付结果都会跳转到 extra 中对应的 URL。
                                        } else if (result === "fail") {
                                            // data 不正确或者微信公众账号/微信小程序/QQ 公众号/支付宝口碑支付失败时会在此处返回
                                        } else if (result === "cancel") {
                                            // 微信公众账号、微信小程序、QQ 公众号、支付宝口碑支付取消支付
                                        }
                                    })
                                }else if(channel === 'wx_pub_qr'){
                                    window.location.href=`/setting/version_information/charge/wechat?charge_id=${value.charge_id}`
                                }else if(channel === 'native_b2b'){
                                    window.location.href=`/setting/version_information/charge/publictransfer?charge_id=${value.charge_id}&type=buyphone`
                                }                            
                            }
                        })
                    })      
                }else{
                    message.error('请阅读并同意商品条款与协议!')
                }
                
            }
        })
    }
    hanldeOpenAgree = (e)=>{
        e.preventDefault()
        window.open('/agreement/commodityRule', '_blank')
        
    }
    componentWillUnmount (){
        clearTimeout(this.timer)
    }
    handleCancel = ()=>{
        this.setState({
            visible:false
        })
        window.open('http://newhelp.51zan.cn/manual/content/%E7%B3%BB%E7%BB%9F%E8%AE%BE%E7%BD%AE/%E4%BF%A1%E6%81%AF/%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98.md','_blank')
    }
    handleOk =()=>{
        this.setState({
            visible:false
        })
        window.open('/setting/version_information','_self')
    }
    handleChoosePhone =(id)=>{
        const { phone } = this.state
        let checkedPhone =  phone.filter(item=>item.checked)
        if(checkedPhone.length===1 &&checkedPhone[0].id === id ){
            message.error('必须选择一款手机购买')
            return false
        }


        let p =  phone.map(item=>{
            return {
                ...item,
                checked:item.id ===id? !item.checked:item.checked
            }
        })
        this.setState({phone:p})
    }
    handleChangePhoneNum =(value,id,max_num)=>{
        if(isNaN(value) || !value){
            value =1
        }
        if(value>max_num){
            message.error('输入超过最大库存')
        }
        const { phone } = this.state
        let p =  phone.map(item=>{
            return {
                ...item,
                num:item.id ===id? value:item.num
            }
        })
        this.setState({phone:p})
    }
    render(){
        const RadioGroup = Radio.Group
        const formItemLayout = {
            labelCol: {
                span: 5,
                style: {
                    width: '70px',
                },
            },
            wrapperCol: {
                span: 20,
            },
        }
        const formItemLayoutHardware = {
            labelCol: {
                span: 4,
                style: {
                    width: '94px',
                },
            },
            wrapperCol: {
                span: 20,
            },
        }

        const {channel,visible,phone} = this.state
        let hard_money = 0,hard_name=''
        phone && phone.filter(item=>item.checked).forEach(value=>{
            hard_money += value.num*value.price
            hard_name += `${value.name}  x${value.num} /`
        })

        const { getFieldDecorator } = this.props.form

        const columns=[{
            title:'手机型号',
            key:'name',
            dataIndex:'name',
            render:(text,record)=>{
                return <Checkbox
                    checked={record.checked}
                    onChange={()=>{this.handleChoosePhone(record.id)}}
                >
                    {text}
                </Checkbox>
            }
        },{
            title:'采购数量',
            key:'num',
            dataIndex:'num',
            render:(text, record)=> {
                return record.checked? <InputNumber 
                    min={1} 
                    max={record.stock_count} 
                    value={text} 
                    parser={value => value.replace('.', '')}
                    onChange={(value)=>{this.handleChangePhoneNum(value,record.id,record.stock_count)}}/>:'--'
            }
        },{
            title:'金额',
            key:'price',
            dataIndex:'price',
            render:(text,record)=>{
                return record.checked? jine(text*record.num,'','Fen') :'--'
            }
        }]
        return (
            <Page>
                <Page.ContentHeader
                    breadcrumbData={[{
                        name: '版本信息',
                        path: '/setting/version_information'
                    },{
                        name: '购买手机'
                    }]}
                />
                <Page.ContentBlock title='购买信息' hasDivider={false} style={{marginTop: '-16px'}}>
                    <div className={styles.blockBox +' '+ styles.marginBtmNone}>
                        <p className={styles.name}>专用手机</p>
                        <p className={styles.explanation}>采购手机均为小米厂商提供的新机，质量及售后问题均由手机厂商直接负责，一部手机对应管理一个微信号，若您有10个微信号需要管理，需采购10部手机</p>
                        <Table columns={columns} dataSource={phone}  rowKey={(record, index) => index} pagination={false}    loading={false}/>
                        <Form style={{marginTop:16}}>
                            <Form.Item  style={{marginBottom:8}}  label={<span><s style={{color:'red',textDecoration:'none'}}>*</s> 收货地址</span>} {...formItemLayoutHardware}>
                                <Row>
                                    <Col  style={{width:300,marginRight:16}} span={6} >
                                        <Form.Item >
                                            {getFieldDecorator('address', {
                                                rules: [
                                                    {
                                                        required: true, message: '请选择省市区',
                                                    }
                                                ],
                                            })(
                                                <Cascader options={ AREA_DATA }    placeholder="请选择省市区" />
                                            )}
                                            
                                        </Form.Item>
                                    </Col>

                                    <Col span={10}>
                                        <Form.Item>
                                            {getFieldDecorator('receiver_address', {
                                                rules: [
                                                    {
                                                        required: true, message: '请输入详细地址',
                                                    },
                                                    {
                                                        pattern:/[a-zA-Z0-9_\u4e00-\u9fa5]+\s*/, message: '请输入详细地址!',
                                                    },
                                                ],
                                            })(
                                                <Input    placeholder="请输入详细地址" />
                                            )}
                                        </Form.Item> 
                                    </Col>
                                </Row>
                            </Form.Item>
                            <Form.Item  style={{marginBottom:8}}   label='收货人姓名' {...formItemLayoutHardware} >
                                {getFieldDecorator('consignee', {
                                    rules: [
                                        {
                                            required: true, message: '请输入收货人姓名',
                                        },
                                        {
                                            pattern:/[a-zA-Z0-9_\u4e00-\u9fa5]+\s*/, message: '请填写正确收货人姓名!',
                                        },
                                    ],
                                })(
                                    <Input  style={{width:300}}   placeholder="请输入收货人姓名" />
                                )}
                            </Form.Item> 
                            <Form.Item  label='联系方式' {...formItemLayoutHardware}>
                                {getFieldDecorator('mobile', {
                                    rules: [
                                        {
                                            required: true, message: '请输入收货人联系电话', 
                                        },
                                        {
                                            pattern: /^1[0-9]{10}$/, message: '请填写正确11位手机号!',
                                        },
                                    ],
                                })(
                                    <Input   style={{width:300}}    maxLength={11}  placeholder="请输入收货人联系电话" />
                                )}
                            </Form.Item>  
                            <Form.Item  label='金额' {...formItemLayoutHardware}>
                                <span className={styles.discountMoney}>￥{ jine( hard_money,'',"Fen") }</span>
                            </Form.Item>
                        </Form>
                    </div>
                </Page.ContentBlock>
                <Page.ContentBlock  title='结算信息' hasDivider={false}>
                    <div className={styles.blockBox}>
                        <Form> 
                            <Form.Item  label='专用手机' {...formItemLayout}>
                                <p>{hard_name.substr(0,hard_name.length-1)}  </p>
                            </Form.Item>
                            <Form.Item  label='总计金额' {...formItemLayout}>
                                <p>￥{ jine( hard_money,'',"Fen") }</p>
                            </Form.Item>
                            <Form.Item  label='应付金额' {...formItemLayout}>
                                <p className={styles.totalMoney}>￥{ jine(hard_money,'',"Fen") }</p>
                            </Form.Item>
                            <Form.Item label='付款方式' {...formItemLayout}>
                                <RadioGroup onChange={this.handleChangeChannel} value={channel}>
                                    <Radio value='alipay_pc_direct'><img src={require('../../../assets/images/zhifubao@2x.png')} alt="支付宝"  style={{height:22}}/></Radio>
                                    <Radio value='wx_pub_qr'><img src={require('../../../assets/images/weixinzhifu@2x.png')} alt="微信支付"  style={{height:22}}/></Radio> 
                                    <Radio value='native_b2b'>对公转账</Radio>
                                </RadioGroup>
                            </Form.Item>
                        </Form>
                    </div> 
                </Page.ContentBlock>
                <footer>
                    <Checkbox   checked={this.state.checked}  onChange={this.onChangeChecked} >本人已阅读并同意 <span onClick={(e)=>{this.hanldeOpenAgree(e)}} style={{color: '#4391FF',cursor: 'pointer'}}>《商品条款与条件》</span></Checkbox>
                    <Button type='primary'  style={{display:'block',marginTop:16}}    onClick={()=>{this.handlerecharge()}}>提交订单</Button>
                </footer>
                <Modal
                    visible={visible}
                    onOk={this.handleOk}
                    className={styles.payModel}
                    cancelText='支付遇见问题'
                    okText='支付完成'
                    closable={false}
                    centered={true}
                    maskClosable={false}
                    onCancel={this.handleCancel}
                >
                    <p><Icon type="exclamation-circle" theme="filled"  style={{color:'#F15043',fontSize:'20px'}} /><span className={styles.payTip}>在完成付款之前，请不要关闭这个窗口</span></p>
                    <p style={{paddingLeft:'28px'}}>请在新页面扫码支付，完成购买！</p>
                </Modal>
            </Page>
        )
    }

}
