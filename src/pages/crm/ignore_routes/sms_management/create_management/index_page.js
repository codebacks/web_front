import React, { Component } from "react"
import {
    Radio,
    Input,
    Form,
    Button,
    Icon,
    Row,
    Col,
    Popover,
    message,
} from "antd"
import { connect } from 'dva'
import router from 'umi/router'
import documentTitleDecorator from 'hoc/documentTitle'
import MessageView from '@/pages/crm/components/MessageManage/MessageView'
import MessageNotEnough from '@/pages/crm/components/MessageManage/MessageNotEnough'
import QrcodeModel from '@/pages/crm/components/MessageManage/QrcodeModel'
import Page from 'components/business/Page'
import styles from "./index.less"

const FormItem = Form.Item
const RadioGroup = Radio.Group
const { TextArea } = Input
const unsubscribe = '回复0屏蔽'
const unsubscribeYX = '回T退订'
@connect(({ base, sms_managamnet,crm_customerPool ,sms_account }) => ({
    base,
    sms_managamnet,
    crm_customerPool,
    sms_account
}))
@documentTitleDecorator({
    title: '新建模版'
})
@Form.create()
export default class Index extends Component {
    constructor(props) {
        super(props)
        this.isBlur = false
        this.textArea = null
        this.state = {
            textLength:unsubscribeYX.length,
            qrcodesList: [],
            btnList:[],
            send_count:1,
            text:unsubscribeYX,
            unsubscribe:unsubscribeYX,
            rechargeVisible:false,
            qrcode_disabled:false,
            qrcode_id:''
        }
    }

    onBlur = () => {
        this.isBlur = true
    }

    noBlur = () => {
        this.isBlur = false
    }
    // 获取光标位置
    getCursortPosition = element => {
        let cursorPos = 0
        if (document.selection) {
            // IE Support
            element.focus()
            let selectRange = document.selection.createRange()
            selectRange.moveStart("character", -element.value.length)
            cursorPos = selectRange.text.length
        } else if (element.selectionStart || element.selectionStart == "0") {
            cursorPos = element.selectionStart
        }
        return cursorPos
    }
    // 设置光标位置
    setCaretPosition = (element, pos, end) => {
        end = end || pos
        if (element.setSelectionRange) {
            // IE Support
            element.focus()
            element.setSelectionRange(pos, end)
        } else if (element.createTextRange) {
            let range = element.createTextRange()
            range.collapse(true)
            range.moveEnd("character", end)
            range.moveStart("character", pos)
            range.select()
        }
    }

    handleClick = (value, e,placeholder) => {

        e.preventDefault()
        if( placeholder ==='{#var_wechat#}'){
            this.setState({
                qrcodeVisible:true
            })
            return false
        }
        let textArea = this.textArea.textAreaRef
        let pos = this.getCursortPosition(textArea)
        let str = textArea.value
        let arr = this.getTargetIndex(str)
        let select = []
        if (arr.length > 0) {
            select = arr.filter(item => {
                if (pos - 1 >= item.start && pos + 1 <= item.end) {
                    return item
                }
            })
        }
        // 去除
        if (select.length) {
            let el = select[0]
            pos = el.start
            str = str.replace(new RegExp(el.source, 'g'), (item, index) => {
                if (index === el.start) {
                    return ''
                }
                return item
            })
        } else {
            //选中时
            let selectedText = this.getSelectedText(textArea)
            if (selectedText) {
                str = str.replace(new RegExp(selectedText, 'g'), (item, index) => {
                    if (index === pos) {
                        return ''
                    }
                    return item
                })
            }
        }
        let len = 0
        let start = "",
            end = ""
        if (this.isBlur) {
            start = str.slice(0, pos)
            end = str.slice(pos, str.length)
            start += value
            len = start.length
            start += end
        } else {
            start = str + value
            len = start.length
        }
        this.isBlur = false
        textArea.value = start
        this.props.form.setFieldsValue({
            content: start
        })
        this.onChangeTextArea(start)
        this.setCaretPosition(textArea, len)
    }

    name = <div>
        {'{#用户姓名\#}'}在发送时将会被替换<br/>
        为用户姓名，默认8个字，以实际<br/>
        发送为准
    </div>
    buyer_username = <div>
        {'{#用户购物账号#}'}在发送时将会被<br/>替换为订单内买家购物ID，默认10<br/>个字，以实际发送为准
    </div>

    shop_name = <div>
    {'{#店铺名称#}'}在发送时将会被替换<br/>为订单内买家下单店铺，默认8<br/>个字，以实际发送为准
    </div>
    var_wechat = <div>
        {'{#新码微信号#}'}在发送时将会被替换<br/>为新码内的微信号，每条短信将从新<br/>码内的微信号随机选取，默认9个字，<br/>以实际发送为准
    </div>
    ButtonKeys = [
        {
            key: "用户姓名",
            tag: '{#用户姓名#}',
            value: "{#name#}",
            content:this.name
        },
        {
            key: "用户购物账号",
            tag: '{#用户购物账号#}',
            value: "{#buyer_username#}",
            content:this.buyer_username
        },
        {
            key: "店铺名称",
            tag: '{#店铺名称#}',
            value: "{#shop_name#}",
            content:this.shop_name
        },
        {
            key: "新码微信号",
            tag: '{#新码微信号#}',
            value: "{#var_wechat#}",
            content:this.var_wechat
        },
        
    ]
    ButtonVars=[
        // {
        //     key: "数字变量",
        //     tag: '{#数字变量#}',
        //     value: "{#var_number#}"
        // },
        {
            key: "公众号",
            tag: '{#公众号#}',
            value: "{#var_mp#}"
        },
        {
            key: " 虎赞微信新码",
            tag: '{#虎赞微信新码#}',
            value: "{#var_wechat#}"
        },
        {
            key: "店铺名称",
            tag: '{#店铺名称#}',
            value: "{#shop_name#}"
        },
    ]
    // 获取当前所有标记位置
    getTargetIndex = (str) => {
        let arr = []
        str.replace(/(\{#.+?#\})/g, (i, ii, index) => {
            arr.push({
                source: i,
                start: index,
                end: index + i.length
            })
        })
        return arr
    }
    // 主动选中文本
    textAreaChange = (e) => {
        let keyCode = e.keyCode
        let textArea = this.textArea.textAreaRef
        let pos = this.getCursortPosition(textArea)
        let str = textArea.value
        let arr = this.getTargetIndex(str)
        let selectedText = this.getSelectedText(textArea)
        if(str.match(/^【[\s\S]*?】/) ){
            let  signature  =str.match(/^【[\s\S]*?】/)[0].length
            if(pos <=signature && (keyCode === 8 || keyCode === 46)){
                this.props.form.setFieldsValue({
                    signature: ''
                })
                this.setCaretPosition(textArea, 0, signature)
                return false
            }
        }
        if (arr.length > 0) {
            arr.forEach(item => {
                if (keyCode === 8 || keyCode === 46) {
                    if (pos - 1 >= item.start && pos <= item.end && !selectedText) {
                        this.setCaretPosition(textArea, item.start, item.end)
                    }
                } else {
                    if (pos - 1 >= item.start && pos + 1 <= item.end) {
                        this.setCaretPosition(textArea, item.start, item.end)
                    }
                }
            })
        }
    }
    // 获取选中文本
    getSelectedText = (e) => {
        if (document.selection) {
            return document.selection.createRange().text

        } else if (window.getSelection().toString()) {
            return window.getSelection().toString()

        } else if (e.selectionStart != undefined && e.selectionEnd != undefined) {
            let start = e.selectionStart
            let end = e.selectionEnd
            return e.value.substring(start, end)
        }
    }

    handleSubmit = () => {
        this.props.form.validateFields(['name','signature','content'],(err, values) => {
            if (!err) {
                let type = 'sms_managamnet/postMsmTemplate'
                if (this.props.location.query.id) {
                    type = 'sms_managamnet/putMsmTemplate'
                }
                let  content = values.content.replace(/^【[\s\S]*?】/,'')
                let sms_template= values.content.replace(/^【[\s\S]*?】/,'')
                this.ButtonKeys.forEach(item => {
                    sms_template = sms_template.replace(new RegExp(item.tag, 'g'), item.value)
                })
                if(content.indexOf('{#新码微信号#}')>-1 && this.state.qrcode_id){
                    sms_template = sms_template.replace(/{#var_wechat#}/g, `{#${this.state.qrcode_id}_var_wechat#}`)
                }
                let payload = {
                    name: values.name,
                    template: sms_template,
                    type: this.type,
                    content:content,
                    signature:values.signature
                }
                let tip = '新增短信模板成功'
                if (this.props.location.query.id){
                    payload.id = this.props.location.query.id
                    tip= '编辑短信模板成功'
                } 
                this.props.dispatch({
                    type,
                    payload,
                    callback: () => {
                        this.goBack()
                        message.success(tip)
                        
                    }
                })
                
            }
        })
    }

    goBack = () => {
        router.push('/crm/sms_management')
    }
    handleChangeSignature = (e)=>{
        let textArea
        let text = this.textArea.textAreaRef.value.replace(/^【[\s\S]*?】/,'')
        if(e.target.value){
            textArea =`【${e.target.value}】${text}` 
        }else{
            textArea=text
        }
        this.props.form.setFieldsValue({
            content: textArea
        })
        this.onChangeTextArea(textArea)
    }
    onChangeTextArea = (value) => {
        if(value.indexOf('{#新码微信号#}')>-1){
            this.setState({
                qrcode_disabled:true
            })
        }else{
            this.setState({
                qrcode_disabled:false
            })
        }
        let  text = `${value}${this.state.unsubscribe}`
        let send_count=   text.length>70?Math.ceil(text.length/67):1
        this.setState({
            send_count,
            text,
            textLength: text.length
        })
    }

    componentDidMount() {
        const {id} = this.props.location.query
        this.props.dispatch({
            type:'sms_account/getSMSCount'
        })
        if(id){
            this.props.dispatch({
                type: 'sms_managamnet/getMsmTemplateDatail',
                payload: id,
                callback:(value)=>{
                    this.props.form.setFieldsValue({
                        name:value.name,
                        signature:value.signature,
                        content:`【${value.signature}】${value.content}`,
                        type:value.type
                    })
                    this.type = value.type
                    this.setState({
                        unsubscribe:this.type ===1 ? unsubscribeYX:unsubscribe
                    })
                    var qrcodes = value.template.match(/\{\#(\d+)_var_wechat\#\}/)
                    if(value.content.indexOf('{#新码微信号#}')>-1 && qrcodes){
                        this.setState({
                            qrcode_id:qrcodes[1]
                        })
                    }
                    this.onChangeTextArea(`【${value.signature}】${value.content}`)
                }
            })
        }
        
        setTimeout(_ => {
            if (this.textArea) {
                const textArea = this.textArea.textAreaRef
                document.addEventListener("click", this.noBlur, false)
                textArea && textArea.addEventListener("blur", this.onBlur, false)
            }
        })
    }
    componentWillUnmount(){
        if (this.textArea) {
            const textArea = this.textArea.textAreaRef
            document.removeEventListener("click", this.noBlur, false)
            textArea && textArea.removeEventListener("blur", this.onBlur, false)
        }
    }
    type = 1
    
    onChange = (e) => {
        this.type = e.target.value
        this.setState({
            template:{},
            qrcode_id:[],
            unsubscribe:this.type ===1 ? unsubscribeYX:unsubscribe
        },()=>{
            this.onChangeTextArea('')
        })
        this.props.form.setFieldsValue({
            name:'',
            signature:'',
            content:''
        })
        

    }
    cancelMessageRecharge =()=>{
        this.setState({
            rechargeVisible:false
        })
    }
    sendTestMessage = ()=>{
        this.props.form.validateFields((err, values) => {
            if(!err){
                const { smsCount } = this.props.sms_account
                if(this.state.send_count<= smsCount){
                    let content = values.content.replace(/^【[\s\S]*?】/,'')
                    let sms_template=values.content.replace(/^【[\s\S]*?】/,'')
                    this.ButtonKeys.forEach(item => {
                        sms_template = sms_template.replace(new RegExp(item.tag, 'g'), item.value)
                    })
                    if(content.indexOf('{#新码微信号#}')>-1 && this.state.qrcode_id ){
                        sms_template = sms_template.replace(/{#var_wechat#}/g, `{#${this.state.qrcode_id}_var_wechat#}`)
                    }
                    let payload = {
                        template_name:values.name,
                        phone:values.phone,
                        sms_template: sms_template,
                        sms_content:content,
                        sms_sign:values.signature,
                        is_test:1,
                        sms_type:this.type,    
                    }
                    this.props.dispatch({   
                        type:'crm_customerPool/sendSms',
                        payload,
                        callback:()=>{
                            message.success('短信发送成功')
                        }
                    })
                }else{
                    this.setState({
                        rechargeVisible:true
                    })
                }
                
            }

        })
    }
    cancelQrcodeModel = (id)=>{
        this.setState({
            qrcodeVisible:false,
            qrcode_id:id,
        })
        if(id){
            let value = '{#新码微信号#}'
            let textArea = this.textArea.textAreaRef
            let pos = this.getCursortPosition(textArea)
            let str = textArea.value
            let arr = this.getTargetIndex(str)

            if(textArea.value.indexOf('{#新码微信号#}')>-1){
                this.setState({
                    qrcode_disabled:true
                })
                return false
            }
            let len = 0
            let start = "",
                end = ""
            if (pos!==str.length-1) {
                start = str.slice(0, pos)
                end = str.slice(pos, str.length)
                start += value
                len = start.length
                start += end
            } else {
                start = str + value
                len = start.length
            }
            this.isBlur = false
            textArea.value = start
            this.props.form.setFieldsValue({
                content: start
            })
            this.onChangeTextArea(start)
            this.setCaretPosition(textArea, len)
            this.setState({
                qrcode_disabled:true
            })
        }
    }
    render() {
        const { getFieldDecorator } = this.props.form

        const formItemLayout = {
            labelCol: { span: 3,style:{width:80} },
            wrapperCol: { span: 16,style:{width:470} }
        }
        const content = <div>
                <p>单条70个字,超出70个字将按照67个字每条计算</p>
                <p>一个汉字,数字,字母,空格都算一个字 </p>
                <p>带标签的短信按实际发出的长度计算</p>
            </div>
        const signatureTip=<p>短信签名建议为:店铺名称、公众号名称或者<br/>代表发送者身份的签名，一些特殊行词汇<br/>将导致发送短信失败！</p>
        // let btnList = []
        const {send_count} = this.state
        return (
            <Page>
                <Page.ContentHeader
                    breadcrumbData={[{
                        name: '模板管理',
                        path: '/crm/sms_management'
                    }, {
                        name:this.props.location.query.id? '编辑模板':'新建模版'
                    }]}
                />
                <Row>
                    <Col span={15}>
                    <Form className={styles.form_label_color} layout={"horizontal"}>
                    <FormItem {...formItemLayout} label="模版名称：">
                        {getFieldDecorator("name", {
                            rules: [
                                {
                                    required: true,
                                    message: "请输入模版名称"
                                },
                                {
                                    max: 10,
                                    message: "不能超过10个字"
                                }
                            ]
                        })(
                            <Input placeholder='请输入模版名称' />
                        )}
                    </FormItem>
                    <FormItem {...formItemLayout} label="短信类型：">
                    {getFieldDecorator("type", {
                        initialValue: 1
                    })(
                        <RadioGroup onChange={this.onChange}  >
                            <Radio value={1}>营销</Radio>
                            <Radio value={2}>加粉</Radio>
                        </RadioGroup>
                    )}
                    </FormItem>
                    <FormItem {...formItemLayout} label="短信签名：">
                        {getFieldDecorator("signature", {
                            rules: [
                                {
                                    required: true,
                                    message: "请输入短信签名"
                                },
                                {
                                    max: 8,
                                    message: "不能超过8个字"
                                }
                            ]
                        })(
                            <Input  style={{width:430}} placeholder='请输入短信签名' onChange={this.handleChangeSignature}/>
                        )}
                        <Popover placement="bottomLeft" content={signatureTip}  className={styles.charge_rule}  arrowPointAtCenter>
                            <Icon
                                type="question-circle"
                                style={{ marginLeft: 8 }}
                            />
                    </Popover>
                    </FormItem>
                    <FormItem {...formItemLayout} label="内容：">
                        
                        <div className={styles.text_area}>
                            <div className={styles.area_title}>
                                <p>已输入<span>{this.state.textLength}</span>个字   预估计费为<span>{send_count} </span> 条</p>
                                <p className={styles.charge_rule}>
                                    计费规则
                                    <Popover placement="bottomLeft" content={content} arrowPointAtCenter>
                                        <Icon
                                            type="question-circle"
                                            style={{ marginLeft: 8 }}
                                        />
                                    </Popover>
                                </p>
                            </div>   
                            <div className={styles.area_content}>
                                {getFieldDecorator("content", {
                                    rules: [
                                        {
                                            required: true,
                                            message: "请输入内容"
                                        }
                                    ]
                                })(
                                    <TextArea
                                        ref={el => (this.textArea = el)}
                                        rows={6}
                                        style={{width:'100%'}}
                                        onChange={e => this.onChangeTextArea(e.target.value)}
                                        onClick={this.textAreaChange}
                                        onKeyDown={this.textAreaChange}
                                    />
                                )}
                                <div className={styles.descLength}>{this.state.unsubscribe}</div>
                            </div>
                        </div>
                    </FormItem>
                    <FormItem {...formItemLayout} label="插入标签：">
                        {this.ButtonKeys.map((i, index) => (
                            <Popover placement="bottomLeft" content={i.content} arrowPointAtCenter>
                                <Button
                                    className={styles.btn_lable}
                                    key={i.value}
                                    style={{display:this.type ===1 && i.value == '{#var_wechat#}'?'none':'inline-block'}}
                                    disabled={i.value == '{#var_wechat#}' && this.state.qrcode_disabled}
                                    onClick={e => this.handleClick(i.tag, e,i.value)}
                                >
                                    {i.key}
                                </Button>
                            </Popover>
                        ))}
                    </FormItem>
                    {/*
                        {this.state.btnList.length > 0 ? <FormItem {...{...formItemLayout,...{wrapperCol: { span: 16,style:{width:500} }}}} label="动态参数：">
                        {this.state.btnList.map((i, index) => (
                            <Button
                                className={styles.btn_lable}
                                key={index}
                                onClick={e => this.handleClick(i.tag, e)}
                            >
                                {i.key}
                            </Button>
                        ))}
                    </FormItem>: null}
                    */}
                    
                    <FormItem label="手机号码："  {...formItemLayout} >
                        {getFieldDecorator(`phone`, {
                                rules:[{
                                    pattern: /^1[0-9]{10,}$/,
                                    message: '请输入正确手机号',
                                },
                                {
                                    required:true,
                                    message:'请输入手机号'
                                }]
                            })(
                            <Input  style={{width:384}}  placeholder='请输入手机号'/>
                        )}  
                        <Button   onClick={(e)=>{this.sendTestMessage()}} className={styles.send}>测试发送</Button>
                    </FormItem>
                    <Form.Item label=" " colon={false} {...formItemLayout} >
                        <Button type='primary' onClick={e => { e.preventDefault(); this.handleSubmit() }} loading={this.state.loading} style={{ marginRight: 16 }} htmlType="submit">保存</Button>
                        <Button onClick={e => { e.preventDefault();this.goBack()} } >取消</Button>
                    </Form.Item>
                    {/* <FormItem {...formItemLayout} label="插入新码参数：">
                        {this.state.qrcodesList.map((i, index) => (
                            <Button
                                key={index}
                                onClick={e => this.handleClick(i.tag, e)}
                            >
                                {i.name}
                            </Button>
                        ))}
                    </FormItem> */}

                </Form>
                </Col>
                <Col span={9} style={{width:268}}>
                    <MessageView content={this.state.text}/>
                </Col>
                </Row>
                {/*短信不足时弹框 */}
                <MessageNotEnough 
                    visible={this.state.rechargeVisible} 
                    onCancel={this.cancelMessageRecharge} 
                    send_count={this.state.send_count}
                    user_num = {1}
                />
                {/*新码微信号*/}
                <QrcodeModel
                    onCancel= {this.cancelQrcodeModel}
                    visible={this.state.qrcodeVisible} 
                />
            </Page>

        )
    }
}
