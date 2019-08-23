import React, {Component} from 'react'
import { Modal, Form, Input, message } from 'antd'
import {connect} from 'dva'
import HzInput from '@/components/HzInput'

const FormItem = Form.Item
const formItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 5 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 19 },
        style: {
            paddingLeft: 10
        }
    },
}

class FormContent extends Component{
    componentDidMount(){
        this.props.form.setFieldsValue({
            memo: this.props.currentItem.memo
        })    
    }
    valueChange = (e)=> {
        this.props.form.setFieldsValue({
            memo: e.target.value
        })  
    }
    validateMemo = (rule, value, callback)=>{
        if(value && value.length > 20){
            callback('限20个字内')
            return
        }
        callback()
    }
    render(){
        const { getFieldDecorator } = this.props.form
        return(
            <Form>
                <FormItem label="备注名" {...formItemLayout}>
                    {getFieldDecorator('memo',{
                        rules: [
                            { validator: this.validateMemo},
                        ],
                    })(
                        <HzInput placeholder="限20字内" maxLength={20} style={{width: 180 }} onChange={this.valueChange}/>
                    )}
                </FormItem>
            </Form>  
        )
    }
}
const FormComponent = Form.create()(FormContent)

@connect(({setting_ordersImport, base}) => ({
    setting_ordersImport,
    base,
}))
export default class OrderDemo extends Component{
    constructor(){
        super()
        this.state= {
            confirmLoading: false
        }
    }
    saveOrderDemo = ()=> {
        this.formContent.validateFields((err, values)=>{
            if(!err){
                this.setState({
                    confirmLoading: true
                })
                const id = this.props.setting_ordersImport.currentItem.id
                this.props.dispatch({
                    type: 'setting_ordersImport/saveMemo',
                    payload: { 
                        id: id,
                        memo: values.memo || ''
                    },
                    callback: (data)=>{
                        this.setState({
                            confirmLoading: false
                        })
                        this.cancelOrderDemo()
                        if(!data.error){
                            message.success(`修改备注成功`)
                            this.props.dispatch({
                                type: 'setting_ordersImport/getOrderList',
                                payload:{}
                            })
                        }
                    }
                })  
            } 
        })
    }
    cancelOrderDemo = ()=> {
        this.props.onChange()
    }
    render(){
        const { confirmLoading } = this.state
        const {  currentItem } = this.props.setting_ordersImport
        return (
            <Modal 
                title="备注"
                visible={this.props.visible}
                cancelText="关闭"
                onOk={this.saveOrderDemo}
                onCancel={this.cancelOrderDemo}
                width={400}
                confirmLoading= { confirmLoading }
            >
                <FormComponent 
                    currentItem={currentItem}
                    ref={node => this.formContent = node}
                    key={new Date()}
                ></FormComponent>
            </Modal>
        )
    }
}
