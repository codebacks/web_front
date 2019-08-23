
import {Component} from 'react'
import { Modal, Form, Input, Select } from 'antd'
import {connect} from 'dva'
const FormItem = Form.Item
const Option = Select.Option

@connect(({crm_intergral, base}) => ({
    crm_intergral,
    base,
}))
@Form.create()
export default class Index extends Component {
    state ={
        loading: false
    }
    onOk = ()=>{
        this.props.form.validateFields((err, values)=>{
            if(!err){
                this.setState({
                    loading: true
                })
                const {item} = this.props
                this.props.dispatch({
                    type: 'crm_intergral/deliverGoods',
                    payload: {
                        id: item.id,
                        carrier: values.carrier || '',
                        carrier_tracking_no: values.carrier_tracking_no || '',
                    },
                    callback: ()=>{
                        this.props.form.resetFields()
                        this.setState({
                            loading: false
                        },()=>{
                            this.props.onDeliver(item)
                        }) 
                    }
                })
            }
        })
    }
    onCancel = ()=>{
        this.props.onChange('GoodVisible')
    }
    searchFilter = (input, option) => {
        const value = input.toUpperCase()
        if (/[a-zA-Z]/.test(value)) {
            if (option.key.indexOf(value) !== -1) {
                return true
            } else {
                return false
            }
        } else if (/[\u4E00-\u9FA5]{1,}/.test(value)) {
            if (option.props.children.indexOf(value) !== -1) {
                return true
            } else {
                return false
            }
        }
    }
    render(){
        //表单样式
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
                },
            },
        }
        const { getFieldDecorator } = this.props.form
        const {express} = this.props.crm_intergral
        return (
            <Modal
                title="发货"
                visible={this.props.visible}
                onOk={this.onOk}
                onCancel={this.onCancel}
                confirmLoading={this.state.loading}
            >
                <Form>
                    <FormItem 
                        {...formItemLayout} 
                        label="物流公司"
                    >
                        {getFieldDecorator('carrier',{
                            rules: [
                                {required: true, message: '请选择物流公司'}
                            ],
                        })(
                            <Select
                                showSearch
                                allowClear
                                placeholder='搜索快递公司'
                                filterOption={this.searchFilter}
                            >
                                {Object.keys(express).map((item, key) => {
                                    return <Option value={express[item]} key={item}>{express[item]}</Option>
                                })}
                            </Select>
                        )}
                    </FormItem> 
                    <FormItem 
                        {...formItemLayout} 
                        label="物流单号"
                    >
                        {getFieldDecorator('carrier_tracking_no',{
                            rules: [
                                {required: true, message: '请输入物流单号'},
                                {pattern: /^[0-9]*$/, message: '请输入正确的物流单号'}
                            ],
                        })(
                            <Input
                                placeholder="请输入" 
                                style={{ width: 360 }} 
                            />
                        )}
                    </FormItem> 
                </Form>
            </Modal>
        )
    }
}