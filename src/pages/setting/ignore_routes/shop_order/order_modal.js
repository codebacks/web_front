
import React, {Component} from 'react'
import { Modal, Form, Input, Button, Upload, Switch, Popover, Icon, message } from 'antd'
import styles from './index.less'
import {connect} from 'dva'

const FormItem = Form.Item
const { TextArea } = Input
const TEMPLATE_KEYS = [
    {
        key: "快递公司",
        tag: '{快递公司}',
    },
    {
        key: "快递单号",
        tag: '{快递单号}',
    }
]
const DEF_TEXT = `您的订单发货啦！{快递公司}{快递单号}`

@Form.create()
@connect(({setting_orders_import_shop, base}) => ({
    setting_orders_import_shop,
    base,
}))
export default class OrderModal extends Component{
    state = {
        visible: true,
        textLen: DEF_TEXT.length,
        FileList: [],
    }
    componentDidMount(){
        this.props.form.setFieldsValue({
            remark: DEF_TEXT
        })
    }
    onOk = ()=>{
        this.props.form.validateFields((error,value)=>{
            console.log(value)
            if(!error){
                this.props.dispatch({
                    type: 'setting_orders_import_shop/importLogistics',
                    payload: {
                        url: value.url,
                        remark: value.remark || '',
                        is_send: value.is_send === true ? 1 : 0,
                    },
                    callback: (data) => {
                        if(!data.error){
                            message.success('导入成功，请刷新当前页面进行查询')
                        } 
                    }
                }) 
                this.onCancel()
            }
        })  
    }
    onCancel = ()=>{
        this.props.onClose()
    }
    // 导入物流信息
    onFileChange = (info) => {
        let fileList = info.fileList.slice(-1)
        this.setState({
            FileList: fileList
        })
        if (info.file.status === 'done') {
            message.success(`${info.file.name} 上传成功`)
            this.props.form.setFieldsValue({
                url: `https://document.51zan.com/${info.file.response.key}`,
            }) 
        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} 上传失败`)
            this.props.form.setFieldsValue({
                url: ''
            }) 
        }
    }
    onFileRemove = (file)=>{
        this.props.form.setFieldsValue({
            url: '',
        })
    }
    handleClick = (value, e)=>{
        e.preventDefault()
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
                return ''
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
            remark: start
        })
        this.props.form.validateFields(['remark'],{force:true})
        this.onChangeTextArea(start)
        this.setCaretPosition(textArea, len)
    }
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
    getCursortPosition = element => {
        let cursorPos = 0
        if (document.selection) {
            // IE Support
            element.focus()
            let selectRange = document.selection.createRange()
            selectRange.moveStart("character", -element.value.length)
            cursorPos = selectRange.text.length
        } else if (element.selectionStart || element.selectionStart === "0") {
            cursorPos = element.selectionStart
        }
        return cursorPos
    }
    getTargetIndex = (str) => {
        let arr = []
        str.replace(/(\{.+?\})/g, (i, ii, index) => {
            arr.push({
                source: i,
                start: index,
                end: index + i.length
            })
        })
        return arr
    }
    textAreaChange = (e) => {
        let keyCode = e.keyCode
        let textArea = this.textArea.textAreaRef
        let pos = this.getCursortPosition(textArea)
        let str = textArea.value
        let arr = this.getTargetIndex(str)
        let selectedText = this.getSelectedText(textArea)
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
    getSelectedText = (e) => {
        if (document.selection) {
            return document.selection.createRange().text

        } else if (window.getSelection().toString()) {
            return window.getSelection().toString()

        } else if (e.selectionStart !== undefined && e.selectionEnd !== undefined) {
            let start = e.selectionStart
            let end = e.selectionEnd
            return e.value.substring(start, end)
        }
    }
    onChangeTextArea = (value) => {
        this.setState({
            textLen: value.length,
        })
    }
    onSwitch = (val)=>{
        this.setState({
            visible: val,
            textLen: DEF_TEXT.length,
        },()=>{
            if(val === true){
                this.props.form.setFieldsValue({
                    remark: DEF_TEXT
                })
            }
        })
    }
    render(){
        const { getFieldDecorator } = this.props.form
        const  uploadProps = {
            name: 'file',
            accept:'.xlsx',
            action: '//upload.qiniup.com/',
            headers: {
                authorization: 'authorization-text',
            },
            data: {
                token: this.props.setting_orders_import_shop.photoToken,
            },
            beforeUpload: (file, fileList)=>{
                this.setState({importLoad: true})
                // 当上传的问题的类型为空的时候，判断文件后缀是否为csv
                let isCSV
                if(file.type){
                    isCSV = file.type === 'application/vnd.ms-excel' || file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/msexcel' || file.type === 'application/x-ms-excel' || file.type === 'application/xls'
                }else{
                    let name = file.name
                    const arr = name.split('.')
                    isCSV = arr.length>1 && (arr[arr.length-1].toLowerCase() === 'xls' || arr[arr.length-1].toLowerCase() === 'xlsx')
                }
                if (!isCSV) {
                    message.error('文件限制.xls!')
                    fileList.pop()
                    this.setState({importLoad: false})
                }
                const isLt100M = file.size / 1024 / 1024 < 100
                if (!isLt100M) {
                    message.error('大小限制100MB!')
                    fileList.pop()
                    this.setState({importLoad: false})
                }
                return isCSV && isLt100M
            },
        }
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 4 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 20 },
                style:{
                    paddingLeft: 10
                }
            },
        }
        return (
            <Modal 
                title='上传物流信息'
                visible={this.props.visible}
                okText='导入'
                onOk={this.onOk}
                onCancel={this.onCancel}
                width={480}
            >
                <Form>
                    <FormItem label="上传文件" {...formItemLayout} required= {true}>
                        {getFieldDecorator('url',{
                            rules: [{ required: true, message: '请上传文件' }],
                        })(
                            <div>
                                <Upload  
                                    {...uploadProps}
                                    showUploadList={true}
                                    fileList={this.state.FileList}
                                    onChange={this.onFileChange}
                                    onRemove={this.onFileRemove} 
                                >
                                    <Button type="primary" ghost icon="upload" >上传文件</Button>
                                    <Popover overlayStyle={{width: 240}} placement="bottomLeft" arrowPointAtCenter={true} content={<div>当前仅支持导出90天内的数据，导入物流模板为导出订单表格，请在表格项“快递公司、快递单号”填写后上传</div>}>
                                        <span className={styles.explain}><Icon className="hz-text-primary hz-icon-size-default" type="question-circle-o" /></span>
                                    </Popover>
                                </Upload>
                            </div>
                        )}
                    </FormItem>
                    <FormItem label="物流提醒" {...formItemLayout}>
                        {getFieldDecorator('is_send',{
                            valuePropName: 'checked',
                            initialValue: true
                        })(
                            <Switch checkedChildren="开启" unCheckedChildren="关闭" onChange={this.onSwitch}/>
                        )}
                        <span style={{marginLeft: 16, fontSize: 12, color: '#999'}}>导入成功后，给好友发送消息</span>
                    </FormItem>
                    {
                        this.state.visible === true &&(
                            <FormItem 
                                label="消息内容" 
                                {...formItemLayout} 
                                extra={
                                    (<div>
                                        <span>插入标签：</span>
                                        {
                                            TEMPLATE_KEYS.map((i, index) => (
                                                <Button
                                                    className={styles.btnLable}
                                                    key={index}
                                                    size='small'
                                                    onClick={e => this.handleClick(i.tag, e)}
                                                >
                                                    {i.key}
                                                </Button>
                                            ))
                                        }
                                    </div>)
                                }
                            >
                                {getFieldDecorator('remark',{
                                    rules: [{ required: true, message: '请输入消息内容' }],
                                })(
                                    <TextArea  
                                        ref={el => (this.textArea = el)}
                                        rows={5}
                                        maxLength={50}
                                        onChange={e => this.onChangeTextArea(e.target.value)}
                                        onClick={this.textAreaChange}
                                        onKeyDown={this.textAreaChange}
                                    />
                                )}
                                <span className={styles.maxText}>{this.state.textLen}/50</span>
                            </FormItem>
                        )
                    }
                </Form>
            </Modal>
        )
    }
}
