import React from 'react'
import { connect } from 'dva'
import { Form, Row, Radio, Col, Input, InputNumber,DatePicker, Button,message, Select, Cascader,TimePicker  } from 'antd'
import documentTitleDecorator from 'hoc/documentTitle'
import Page from 'components/business/Page'
import { Link } from 'dva/router'
import router from 'umi/router'
import MessageAccount from '@/pages/crm/components/MessageManage/MessageAccount'
import { SHOP_TYPE, getMappingPlatformByType, getMappingFromByType, getMappingDecByOri } from '@/common/shopConf'
import  SendMessageModule from '@/pages/crm/components/MessageManage/SendMessageModule'
import { toNumber } from 'utils/display'
import moment from 'moment'
const InputGroup = Input.Group;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;
const format = 'HH:mm'
const { RangePicker } = DatePicker
@connect(({ atuo_send_message, crm_customerPool }) => ({
    atuo_send_message, crm_customerPool
}))
@Form.create()
@documentTitleDecorator({
    title: '自动发送'
})
export default class extends React.Component {
    state ={
        type:1,
        value:1,
        form :{},
        visible:false,
        loading:false,
        inputValue:{
            filter_repeated_days:0,
            limit_every_day_count:0
        },
        inputDisabled:{
            filter_repeated_days:true,
            limit_every_day_count:true
        },
        btnDisabled:false
    }
    componentDidMount(){
        this.getShops()
        let obj =  window.localStorage.getItem('SMSMESSAGECOUNT') 
        if( obj ){
                obj = JSON.parse(obj) 
                if(obj.date === `${moment().year()}/${moment().month()}/${moment().date()}`){
                    this.setState({
                        btnDisabled : true
                    })
                }else{
                    window.localStorage.removeItem('SMSMESSAGECOUNT')
                }
       }
    }
    getShops = () => {
        this.props.dispatch({
            type: 'crm_customerPool/getShops'
        })
    }
    onChange = (e) => {
        this.setState({
            value: e.target.value,
        })
    }


    InputNumberChange = (value , code) =>{
        this.values[code] = value
        if(['amount_min','amount_max'].indexOf(code) > -1){
            this.props.form.validateFields(['amount'],{force:true})
        }else{
            this.props.form.validateFields(['average_amount'],{force:true}) 
        }
    }

    handleChangeSendTime =(value ,key )=>{
        this.values[key] = moment(value).format('HH:mm')
        this.props.form.validateFields(['send_time'],{force:true})
    }   

    disabledHours =()=>{
        return [0,1,2,3,4,5,6,7,8,20,21,22,23]
    }
    values = {
        amount_max:'',
        amount_min:'',
        average_amount_min:'',
        average_amount_max:'',
        min_send_hour:'9:00',
        max_send_hour:'19:30'
    }
    sendTimeOfValidator  =  (rule, value, callback) => {
        let values = this.values
        let nowTime = moment().format('YYYY-MM-DD')
        if(moment(`${nowTime} ${values.min_send_hour}`).isAfter(`${nowTime} ${values.max_send_hour}`) ||
            moment(`${nowTime} ${values.min_send_hour}`).isSame(`${nowTime} ${values.max_send_hour}`)){
            callback('发送时间段开始值必须小于结束值')
        }
        callback()
    }
    amountOfValidator  =  (rule, value, callback) => {
        let values = this.values
        if(Number(values.amount_min) > Number(values.amount_max)){
            callback('区间最小值不能大于最大值')
        }else{
            callback()
        }
    }

    averageAmountOfValidator  =  (rule, value, callback) => {
        let values = this.values  
        if(Number(values.average_amount_min) > Number(values.average_amount_max)){
            callback('区间最小值不能大于最大值')  
        }else{
            callback()
        }
    }
    radioValuefValidator =  (rule, value, callback) => {
        if(this.radioValue['limit_every_day_count'] === '1' && !this.state.inputValue['limit_every_day_count']){
            callback('请输入')
        }else{
            callback()
        }
    }
    radioValuefValidators =  (rule, value, callback) => {
        if(this.radioValue['filter_repeated_days'] === '1' && !this.state.inputValue['filter_repeated_days']){
            callback('请输入')
        }else{
            callback()
        }
    }
    radioValue = {
        limit_every_day_count:'0',
        filter_repeated_days:'0'
    }
    radioChange = (e,key) =>{
        let value = e.target.value
        this.radioValue[key]  = value
        const { inputValue, inputDisabled} = this.state
        if(value !=='1'){
            inputValue[key]=''
            inputDisabled[key]=true
            this.setState({
                inputValue,inputDisabled
            },()=>{
                this.props.form.validateFields([key],{force:true}) 
            })
        }else{
            inputDisabled[key]=false
            this.setState({
                inputDisabled
            },()=>{
                this.props.form.validateFields([key],{force:true}) 
            })
        }
        
    }
    inputChange = (value,key) =>{
        const { inputValue} = this.state
        inputValue[key] = value 
        this.setState({
            inputValue
        },()=>{
            setTimeout(_=>{
                this.props.form.validateFields([key],{force:true}) 
            })
        })
    }
    // 获取字符长度
    getStrLength = (str) => {
        if (str && str.replace) {
            return str.replace(/[^\x00-\xff]/g, "01").length
        }
        return 0
    }

    onRef = (ref) =>{
        this.child= ref
    }
    sendMessage = ()=>{
        let validateArray=['names','filter_repeated_days','limit_every_day_count','amount','average_amount','shop_id','is_wechat_binded','created_at','type','signature','content','send_time']
        this.props.form.validateFields(validateArray,(err, values) => {
            const payload={}
            if(!err){
                if(values.shop_id){
                    payload.shop_id = values.shop_id[1]
                    payload.type = values.shop_id[0]
                    
                    payload.platform_type = getMappingPlatformByType(payload.type) || ''
                    payload.data_from= payload.type === 999 ? '1' : getMappingFromByType(payload.type) || ''
                }
                
                let content = values.content.replace(/^【[\s\S]*?】/,'')
                let sms_template =values.content.replace(/^【[\s\S]*?】/,'')
                this.child.ButtonKeys.forEach(item => {
                    sms_template = sms_template.replace(new RegExp(item.tag, 'g'), item.value)
                })

                if(content.indexOf('{#新码微信号#}')>-1 && this.child.state.qrcode_id ){
                    sms_template = sms_template.replace(/{#var_wechat#}/g, `{#${this.child.state.qrcode_id}_var_wechat#}`)
                }


                payload.name = values.names
                payload.amount_max=this.values.amount_max?this.values.amount_max*100:''
                payload.amount_min=this.values.amount_min?this.values.amount_min*100:''
                payload.average_amount_max=this.values.average_amount_max?this.values.average_amount_max*100:''
                payload.average_amount_min=this.values.average_amount_min?this.values.average_amount_min*100:''
                payload.is_wechat_binded=values.is_wechat_binded
                payload.created_at_begin= values.created_at && values.created_at.length?moment(values.created_at[0]).format('YYYY-MM-DD')+' 00:00:00':''
                payload.created_at_end=  values.created_at && values.created_at.length?moment(values.created_at[1]).format('YYYY-MM-DD')+' 23:59:59':''
                payload.template_type=values.type
                payload.limit_every_day_count = this.radioValue['limit_every_day_count']==='1'?this.state.inputValue['limit_every_day_count']:''
                payload.filter_repeated_days = this.radioValue['filter_repeated_days']==='1'?this.state.inputValue['filter_repeated_days']:''
                payload.templates={
                    template_id:this.child.state.template.id,
                    template_name:this.child.state.template.name,
                    sms_sign:values.signature,
                    sms_content:content,
                    sms_template:sms_template,
                    var_params:{
                        qrcode_id:this.child.state.qrcode_id
                    }
                }
                payload.min_send_hour = this.values.min_send_hour
                payload.max_send_hour = this.values.max_send_hour
                this.props.dispatch({
                    type:'atuo_send_message/postAutoSend',
                    payload,
                    callback:(data)=>{
                        router.push('/crm/automatic_send')
                        message.success('任务创建成功')
                    }
                }) 
            }
        })
    }
    goBackHistory =()=>{
        router.push('/crm/automatic_send')
    }
    render() {
        
        const formItemLayout = {
            labelCol: {
                span: 3,
                style: {
                    width: '80px',
                    textAlign: 'right'
                },
            },
            wrapperCol: {
                span: 18,
                style: {
                    width: '320px',
                },
            },
        }
        const formItemLayoutEveryDay = {
            labelCol: {
                span: 3,
                style: {
                    width: '80px',
                    textAlign: 'right'
                },
            },
            wrapperCol: {
                span: 18,
                style: {
                    width: '650px',
                },
            },
        }
        const {UserPoolCount,smsCount,filterCount,step,shops}  = this.props.crm_customerPool
        let types = []
        const arr =SHOP_TYPE.filter((item) => { 
            return item.name !== 'HuZan' && item.name !== 'Mendian'
        })
        arr.push({
            value:999,
            type:'导入'
        })
        arr.forEach((item, index) => { 
            types.push({
                value: item.value,
                label: item.type,
                children: [{
                    value:'',
                    label:'不限'
                }],
            })
        })
        
        shops.forEach((val,key) => { 
            types.forEach((v,k) => { 
                if (val.type === v.value) { 
                    v.children.push({
                        value: val.id,
                        label: val.name,  
                    })
                }
            }) 
        })
        const { getFieldDecorator } = this.props.form
        return <Page>
            <Page.ContentHeader
                breadcrumbData={[{
                    name: '自动发送',
                    path: '/crm/automatic_send/'
                }, {
                    name: '创建任务'
                }]}
            />
            <MessageAccount /> 
            <Page.ContentBlock title='基础规则' hasDivider={false}>
                <Form layout="horizontal">
                    <Row>
                        
                            <FormItem label="任务名称：" {...formItemLayout} >
                                {getFieldDecorator("names", {
                                    rules: [
                                        {
                                            required: true,
                                            message: "请输入任务名称"
                                        },
                                        {
                                            max: 10,
                                            message: "最多10个字符"
                                        }
                                    ]
                                })(
                                    <Input placeholder='请输入任务名称' />
                                )}
                            </FormItem>
                        
                    </Row>
                    <Row>
                        <FormItem {...formItemLayoutEveryDay} label="每日发送：" >
                            {getFieldDecorator("limit_every_day_count", {
                                    rules: [
                                        { validator: this.radioValuefValidator}
                                    ],
                                    initialValue: '0'
                                })(
                                <RadioGroup onChange={(e)=>{this.radioChange(e,'limit_every_day_count')}}  >
                                    <Radio onClick={e => e.stopPropagation()} value='0'>不限</Radio>
                                    <Radio value='1'>限发<InputNumber
                                        onChange={(e)=>{this.inputChange(e,'limit_every_day_count')}}
                                        value={this.state.inputValue.limit_every_day_count}
                                        min={1}
                                        step={1}
                                        max={999999}
                                        formatter={value => {
                                            return !isNaN(value) && value > 0 ? Math.floor(value) : ''
                                        }}
                                        disabled={this.state.inputDisabled.limit_every_day_count}
                                        placeholder="请输入"
                                        style={{ width: 100, paddingRight: 0 ,marginLeft:4}}
                                        /> 条（每日达上限后自动停止发送，隔日早上9点继续发送）</Radio>
                                    
                                </RadioGroup>
                            )}
                        </FormItem>
                    </Row> 
                    <Row>
                    <FormItem {...formItemLayoutEveryDay} label="发送过滤：" >
                        {getFieldDecorator("filter_repeated_days", {
                                rules: [
                                    { validator: this.radioValuefValidators}
                                ],
                                initialValue: '0'
                            })(
                            <RadioGroup onChange={(e)=>{this.radioChange(e,'filter_repeated_days')}} >
                                <Radio onClick={e => e.stopPropagation()} value='0'>不限</Radio>
                                <Radio value='1'>过滤<InputNumber
                                    onChange={(e)=>{this.inputChange(e,'filter_repeated_days')}}
                                    value={this.state.inputValue.filter_repeated_days}
                                    min={1}
                                    step={1}
                                    max={30}
                                    formatter={value => {
                                        return !isNaN(value) && value > 0 ? Math.floor(value) : ''
                                    }}
                                    disabled={this.state.inputDisabled.filter_repeated_days}
                                    placeholder="请输入"
                                    style={{ width: 100, paddingRight: 0,marginLeft:4 }}
                                    /> 天内发送过的客户</Radio>
                                
                            </RadioGroup>
                        )}
                    </FormItem>

                    <FormItem label="发送时间段：" {...formItemLayout}>
                        {getFieldDecorator("send_time",{
                            rules: [ {validator: this.sendTimeOfValidator}]
                        })(
                            <div>
                                <TimePicker  minuteStep={30} disabledHours={this.disabledHours}  value={moment(this.values.min_send_hour,format)}  onChange={(value) => this.handleChangeSendTime(value,'min_send_hour')}     allowClear={false} format={format} />
                                <span style={{padding:'0 24px'}}>至</span>
                                <TimePicker  minuteStep={30}  disabledHours={this.disabledHours} value={moment(this.values.max_send_hour,format)}  onChange={(value) => this.handleChangeSendTime(value,'max_send_hour')}     allowClear={false} format={format} />
                            </div>
                        )} 
                    </FormItem>             
                                    
                </Row> 
                </Form>
            </Page.ContentBlock>

            <Page.ContentBlock title='发送人群' hasDivider={false}>
                <Form layout="horizontal">
                    <Row>                        
                        <FormItem label="所属店铺：" {...formItemLayout}>
                            {getFieldDecorator("shop_id")(
                                <Cascader placeholder='选择店铺' options={types} ></Cascader>
                            )} 
                        </FormItem>                        
                    </Row>
                    <Row>                        
                        <FormItem label="是否加粉：" {...formItemLayout}>
                            {getFieldDecorator("is_wechat_binded")(
                                <Select placeholder='不限'>
                                    <Option key={2} value={2}>未加粉</Option>
                                    <Option key={2} value={1}>已加粉</Option>
                                </Select>
                            )} 
                            
                        </FormItem>                        
                    </Row>
                    <Row>                    
                        <FormItem label="创建时间：" {...formItemLayout}>
                            {getFieldDecorator('created_at')(
                                <RangePicker style={{width:'100%'}}  />
                            )}                            
                        </FormItem>
                    </Row>
                    <Row>                        
                        <FormItem label="订单总额：" {...formItemLayout}>
                            {getFieldDecorator("amount",{
                                rules: [ {validator: this.amountOfValidator}]
                            })(
                                <div>
                                    <InputGroup compact>
                                        <InputNumber
                                            min={0}
                                            max={99999999}
                                            onChange={(value) => this.InputNumberChange(value,'amount_min')}
                                            formatter={value => `￥${value}`.substr(0,12)}
                                            parser={value => value.replace('￥', '')}
                                            style={{ width: 142, textAlign: 'center' }} placeholder="不限" />
                                        <Input
                                            style={{ width: 34, borderLeft: 0, pointerEvents: 'none', backgroundColor: '#fff'}}
                                            placeholder="~"
                                            disabled
                                        />
                                        <InputNumber 
                                        min={0}
                                        max={99999999}
                                        onChange={(value) => this.InputNumberChange(value,'amount_max')}
                                        formatter={value => `￥${value}`.substr(0,12)}
                                        parser={value => value.replace('￥', '')}
                                        style={{ width: 144, textAlign: 'center', borderLeft: 0 }} placeholder="不限" />
                                    </InputGroup>
                                </div>
                            )} 
                        </FormItem>                       
                    </Row>
                    <Row>                       
                        <FormItem label="平均单价：" {...formItemLayout}>
                        
                            {getFieldDecorator("average_amount",{
                                rules: [ {validator: this.averageAmountOfValidator}]
                            })(
                            <div>
                            <InputGroup compact>
                                <InputNumber 
                                    min={0}
                                    max={99999999}
                                    onChange={(value) => this.InputNumberChange(value,'average_amount_min')}
                                    formatter={value => `￥${value}`.substr(0,12)}
                                    parser={value => value.replace('￥', '')}
                                    style={{ width: 142, textAlign: 'center' }} placeholder="不限" />
                                <Input
                                    style={{ width: 34,paddingRight:'1px', borderLeft: 0, pointerEvents: 'none', backgroundColor: '#fff'}}
                                    placeholder="~"
                                    disabled
                                />
                                <InputNumber 
                                min={0}
                                max={99999999}
                                onChange={(value) => this.InputNumberChange(value,'average_amount_max')}
                                formatter={value => `￥${value}`.substr(0,12)}
                                parser={value => value.replace('￥', '')}
                                style={{ width: 144, textAlign: 'center', borderLeft: 0 }} placeholder="不限" />
                            </InputGroup>
                            </div>
                            )} 
                        </FormItem>
                        <Row>
                                
                            <FormItem label="订单状态：" {...formItemLayout}>

                                <RadioGroup value='1'>
                                    <Radio value='1'>待发货</Radio>
                                </RadioGroup>
                                {/*
                                    {getFieldDecorator('order_type', {
                                        initialValue: '1'
                                    })(
                                        <RadioGroup>
                                            <Radio value='1'>待发货</Radio>
                                        </RadioGroup>
                                    )}   
                                 */}
                            </FormItem>
                                
                        </Row>
                    </Row>
                </Form> 
            </Page.ContentBlock>
            <Page.ContentBlock title='短信编辑' hasDivider={false}>
                <SendMessageModule   {...this.props}  onRef={this.onRef}  user_num={1}/>
            </Page.ContentBlock>
            <div style={{paddingLeft:80,paddingBottom:80}}>
                <Button type='primary' onClick={()=>{this.sendMessage()}} disabled={this.state.btnDisabled} >保存</Button>
                <Button  onClick={this.goBackHistory} style={{'marginLeft':'24px'}}>取消</Button>
                <p style={{paddingTop:16,color:'#000'}}>注：短信可发送时间段为 9:00~19：30</p>  
            </div>
        </Page>
    }


}
