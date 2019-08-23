import React,{Fragment} from 'react'
import {connect} from 'dva'
import Page, { DEFAULT_PAGER , DEFAULT_PAGER_FILTER} from '../../../../../components/business/Page'
import {Form, Row,Radio,InputNumber,Input,Checkbox,Button,Col ,message,Select ,Modal,Icon,Cascader } from 'antd'
import {jine} from '../../../../../utils/display'
import {AREA_DATA} from 'components/business/CitySelect/AreaData'
import Router  from 'umi/router' 
import {Link} from 'dva/router'
import documentTitleDecorator from 'hoc/documentTitle'
import  styles  from './index.less'
const Option = Select.Option
const confirm = Modal.confirm
@connect(({base,setting_version_information}) => ({
    base,setting_version_information
}))
@Form.create()
@documentTitleDecorator({
    title:'购买版本'
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
            personal_num:1,
            first_buy:1
        }
    }
    componentDidMount () {
        this.setState({
            default_version:this.props.location.query.type,
            first_buy:Number(this.props.location.query.first_buy)
        })
        this.props.dispatch({
            type:'setting_version_information/currentVersion',
            payload:{},
            callback:(data)=>{
                this.setState({
                    chooseVersion: data.product_version_list.filter((value,index)=> this.props.location.query.type == value.id)
                })
            }
        })
        
        this.props.dispatch({
            type:'setting_version_information/phoneInfo',
            payload:{},
            callback:(data)=>{
                this.setState({
                    phone_id:data[0].id,
                    choosePhone:data.filter((value,index)=> data[0].id == value.id)
                })
            }
        })
    }
    handleChangeVersion=(e)=>{
        const { versionInfo } = this.props.setting_version_information
        this.setState({
            default_version:e.target.value,
            chooseVersion:versionInfo.product_version_list.filter((value,index)=> e.target.value   == value.id)
        })
    }

    handleChangeYear =(e)=>{
        this.setState({
            year:e.target.value
        })
    }
    handleChangePurchase  =(e)=>{
        this.setState({
            purchase:e.target.value
        })
    }
    handleChangeChannel = (e)=>{
        this.setState({
            channel:e.target.value
        })
    }
    handleChangePhoneId = (e) =>{
        const { phoneInfo } = this.props.setting_version_information
        this.setState({
            phone_id:e.target.value,
            choosePhone:phoneInfo.filter((value,index)=>e.target.value == value.id)
        })
    }
    handleChangePhoneNum = (value=1) =>{
        const {first_buy} = this.state
        if(isNaN(value) || value === null){
            value = 1
        }
        this.setState({
            phone_num:  value>10000?10000:value,
            personal_num:first_buy ===1?(value>10000?10000:value):this.state.personal_num
        })
    }
    handleChangePersonalNum = (value) =>{
        const { first_buy } = this.state
        if(isNaN(value) || value === null){
            value = 1
        }
        this.setState({
            personal_num:  value>10000?10000:value,
            phone_num: first_buy ===1? (value>10000?10000:value):this.state.phone_num
        })
    }
    onChangeChecked = (e)=>{
        this.setState({
            checked: e.target.checked,
        })
    }
    showConfirm=( data, channel,origin)=> {

        confirm({
            title: '您已享受首单优惠，此单不再享受优惠，是否继续支付？',
            okText:'继续支付',
            onOk:()=>{
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
                        this.setState({
                            visible:true
                        })
                        // 支付宝支付
                        if(channel === 'alipay_pc_direct'){
                            var pingpp = require('pingpp-js')  

                            pingpp.setUrlReturnCallback(function (err, url) {
                                window.open(url,'_blank')
                            }, ['alipay_pc_direct']) 
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
                            window.open(`/setting/version_information/charge/wechat?charge_id=${value.charge_id}&type=stewardversion`,'_blank')
                        }else if(channel === 'native_b2b'){
                            window.open(`/setting/version_information/charge/publictransfer?charge_id=${value.charge_id}&type=stewardversion` , '_blank')
                        }
                        
                        
                    }
                })
            },
            onCancel() {
            }
        })
    }
    handlerecharge=()=>{
        const {phone_num,year,chooseVersion,choosePhone,channel,checked,personal_num,first_buy} = this.state

        let  software_money = chooseVersion[0].price * personal_num
        let hardware_money = phone_num!==0  ? choosePhone[0].price * phone_num : 0
        let choose_phone =  phone_num!==0  ?  choosePhone:[{name:''}]
        let discount_money = first_buy === 1? chooseVersion[0].save_price :0
        let formArr =  phone_num!==0 ? ['receiver_address','mobile','consignee','address']:[]
        let amount = hardware_money+software_money-discount_money
        this.props.form.validateFields(formArr,(err, values) => {         
            if (!err) {
                if(checked){
                    let formObj = first_buy !== 0|| phone_num!==0?
                        {
                            receiver_address:  `${values.address.join('')} ${values.receiver_address}`,   
                            mobile:values.mobile,
                            consignee:values.consignee,
                            channel:channel,
                            item:{
                                phone:{
                                    id:choosePhone[0].id,
                                    count:phone_num
                                },
                                version:{
                                    id:chooseVersion[0].id,
                                    count:personal_num
                                }
                            }
                        }:{
                            channel:channel,
                            item:{
                                version:{
                                    id:chooseVersion[0].id,
                                    count:personal_num
                                }
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
                        // if(amount !== data.pay_amount){
                        //     this.showConfirm( data, channel,origin)
                        //     return false
                        // }
                        // let tempwindow=window.open('_blank')
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
                                this.setState({
                                    visible:true
                                })
                                // 支付宝支付
                                if(channel === 'alipay_pc_direct'){
                                    var pingpp = require('pingpp-js')  

                                    pingpp.setUrlReturnCallback( (err, url) =>{
                                        this.timer = setTimeout(()=>{
                                            window.open(url,'_blank')
                                        },500)
                                    }, ['alipay_pc_direct']) 

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
                                    this.timer = setTimeout(()=>{
                                        window.open(`/setting/version_information/charge/wechat?charge_id=${value.charge_id}&type=stewardversion`,'_blank')
                                    },500)
                                   
                                }else if(channel === 'native_b2b'){
                                    this.timer = setTimeout(()=>{
                                        window.open(`/setting/version_information/charge/publictransfer?charge_id=${value.charge_id}&type=stewardversion`,'_blank')
                                    },500)
                                }
                                
                                
                            }
                        })
                    })      
                }else{
                    message.error('请阅读并同意用户协议!')
                }
                
            }
        })
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
    hanldeOpenAgree = (e)=>{
        e.preventDefault()
        window.open('/register/agreement', '_blank')
        
    }
    render(){
        const RadioGroup = Radio.Group
        const formItemLayout = {
            labelCol: {
                span: 5,
                style: {
                    width: '100px',
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
                    width: '98px',
                },
            },
            wrapperCol: {
                span: 20,
            },
        }
        const { versionInfo} = this.props.setting_version_information

        const {phone_num,year,chooseVersion,choosePhone,channel,visible,personal_num,first_buy} = this.state


        let  software_money = versionInfo.product_version_list?versionInfo.product_version_list[0].price * personal_num :0

        let hardware_money = choosePhone.length>0 ? choosePhone[0].price * phone_num : 0

        let discount_money =   first_buy !== 0 && versionInfo.product_version_list?versionInfo.product_version_list[0].save_price:0
        const { getFieldDecorator } = this.props.form

        return (
            <Page>
                <Page.ContentHeader
                    breadcrumbData={[{
                        name: '版本信息',
                        path: '/setting/version_information'
                    },{
                        name: '购买版本'
                    }]}
                />
                <Page.ContentBlock title='购买信息' hasDivider={false} style={{marginTop: '-16px'}}>
                    <div className={styles.blockBox}>
                        <p className={styles.name}>软件服务</p>
                        <p className={styles.tips}>如购买中有疑问，请联系客服及销售确认后再购买</p>
                        <Form>
                            <Form.Item label='产品版本' {...formItemLayout}>
                                <span>{chooseVersion.length>0?chooseVersion[0].name:''}</span>    
                            </Form.Item>
                            <Form.Item  label='购买期限' {...formItemLayout}>
                                <span>{year}年</span>    
                            </Form.Item>
                            <Form.Item  label='微信号管控数' {...formItemLayout}>
                                <InputNumber 
                                    min={1} 
                                    max={10000} 
                                    value={personal_num} 
                                    formatter={value => {return value>=10000?10000:value}}
                                    parser={value => value.replace('.', '')}
                                    onChange={this.handleChangePersonalNum}/>
                                    
                                <p className={styles.explanation}>对应群管理数量为<span className={styles.bold}> {10*personal_num} </span>个</p>   
                            </Form.Item>
                            <Form.Item  label='金额' {...formItemLayout}>
                                <span  className={styles.discountMoney}>￥{ jine(software_money,'',"Fen") }</span>
                            </Form.Item>
                        </Form>
                    </div>
                    <div className={styles.blockBox +' '+ styles.marginBtmNone}>
                        <p className={styles.name}>硬件配套</p>
                        <p className={styles.tips}>微信号需要搭配专用手机才能使用，我们会帮您完成手机调试、配置等工作，到手后直接登录微信使用</p>
                        <Form>
                            <Form.Item  label='手机型号' {...formItemLayoutHardware}>
                                <span>{choosePhone.length>0?choosePhone[0].name:''}</span>
                                <p className={styles.explanation}>采购手机均为小米厂商提供的新机，质量及售后问题均由手机厂商直接负责</p>
                            </Form.Item>
                            <Form.Item  label='采购数量' {...formItemLayoutHardware}>
                                <InputNumber 
                                    min={Number(first_buy)} 
                                    max={10000} 
                                    value={phone_num} 
                                    formatter={value => {return value>=10000?10000:value}}
                                    parser={value => value.replace('.', '')}
                                    onChange={this.handleChangePhoneNum}/>
                                <p className={styles.explanation}>一部手机对应管理一个微信号，若您有10个微信号需要管理，需采购10部手机</p>
                            </Form.Item>
                            {first_buy !== 0|| phone_num!==0?<Fragment>
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
                            </Fragment>:''
                            }  
                            <Form.Item  label='金额' {...formItemLayoutHardware}>
                                <span  className={styles.discountMoney}>￥{ jine( hardware_money,'',"Fen") }</span>
                            </Form.Item>
                        </Form>
                    </div>
                </Page.ContentBlock>
                <Page.ContentBlock  title='结算信息' hasDivider={false}>
                    <div className={styles.blockBox}>
                        <Form>
                            <Form.Item label='产品版本' {...formItemLayout}>
                                <p>{chooseVersion.length>0? <span>{chooseVersion[0].name} / {year}年</span> :'' }</p>
                            </Form.Item> 
                            <Form.Item  label='微信号管控数' {...formItemLayout}>
                                <p>{personal_num} ( 对应群管理数量为 <strong>{10*personal_num}</strong> 个 )</p>
                            </Form.Item>
                            {first_buy !== 0|| phone_num!==0?<Form.Item  label='硬件配套' {...formItemLayout}>
                                <p>{`${choosePhone.length>0?choosePhone[0].name:''}  x${phone_num}`}  </p>
                            </Form.Item>:''
                            }
                            <Form.Item  label='总计金额' {...formItemLayout}>
                                <p>￥{ jine(software_money + hardware_money,'',"Fen") }</p>
                            </Form.Item>
                            {first_buy !== 0 ?<Form.Item  label='优惠金额' {...formItemLayout}>
                                <p  className={styles.discountMoney}>-￥{ jine(discount_money,'',"Fen") }</p>
                            </Form.Item>:''
                            }
                            <Form.Item  label='应付金额' {...formItemLayout}>
                                <p className={styles.totalMoney}>￥{jine(software_money + hardware_money - discount_money,'',"Fen") }</p>
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
                    <Checkbox   checked={this.state.checked}  onChange={this.onChangeChecked} >本人已阅读并同意 <a onClick={(e)=>{this.hanldeOpenAgree(e)}}>《用户协议》</a></Checkbox>
                    <Button type='primary'  style={{display:'block',marginTop:16}}    onClick={()=>{this.handlerecharge()}}>提交订单</Button>
                </footer>
                <Modal
                    visible={visible}
                    onOk={this.handleOk}
                    className={styles.payModel}
                    cancelText='支付遇见问题'
                    centered={true}
                    okText='支付完成'
                    closable={false}
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
