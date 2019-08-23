//虎赞小店店铺授权
import React , {Component} from 'react'
import {connect} from 'dva'
import { Input, Modal, Form, message } from 'antd'

const FormItem = Form.Item

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


class FormContent extends Component {
    componentDidMount(){
        this.props.form.setFieldsValue({
            name: this.props.currentShop.name || '',
        }) 
    }
    //验证店铺名
    validateName = (rule, value, callback)=>{
        if(!value){
            callback('请填写店铺名')
            return
        }
        if(/(^\s*)|(\s*$)/g.test(value)){
            const changeValue = value.replace(/(^\s*)|(\s*$)/g, "")
            this.props.form.setFieldsValue({
                name: changeValue
            })
        }
        if(value.length > 100){
            callback('限100个字内')
            return
        }
        callback()
    }
    render(){
        const { getFieldDecorator } = this.props.form
        return (
            <Form>
                <FormItem 
                    {...formItemLayout} 
                    label="店铺名称"
                    required= {true}
                >
                    {getFieldDecorator('name',{
                        rules: [{ validator: this.validateName }],
                    })(
                        <Input
                            placeholder="店铺名称" 
                            style={{ width: 180 }} 
                        />
                    )}
                </FormItem> 
            </Form>
        )
    }
}
const FormComponent = Form.create()(FormContent)


@connect(({setting_shopManagement, base}) => ({
    setting_shopManagement,
    base,
}))

export default class ShopEditeTao extends Component {
    constructor(){
        super()
        this.state= {
            confirmLoading: false
        }
    }
    closeShopEdite = () => {
        this.props.dispatch({
            type: 'setting_shopManagement/setProperty',
            payload:{ shopEditeTaoVisible: false }
        }) 
    }
    saveShopEdite = ()=> {
        this.formContent.validateFields((err, values)=>{
            if(!err){
                this.setState({
                    confirmLoading: true
                })
                const shopId = this.props.setting_shopManagement.currentShop.id
                const type = this.props.setting_shopManagement.currentShop.type
                //请求接口保存修改
                this.props.dispatch({
                    type: 'setting_shopManagement/editeShopStore',
                    payload:{ 
                        id: shopId,
                        type: type,
                        name: values.name || '',
                    },
                    callback: (data) => {
                        this.setState({
                            confirmLoading: false
                        })
                        //隐藏弹窗
                        this.props.dispatch({
                            type: 'setting_shopManagement/setProperty',
                            payload:{ shopEditeTaoVisible: false }
                        })
                        if(!data.error){
                            message.success(`修改成功`) 
                            const {shopType, shopStatus, shopName, currentPage, perPage } = this.props.setting_shopManagement
                            this.props.dispatch({
                                type: 'setting_shopManagement/getShopList',
                                payload:{
                                    page: currentPage,
                                    per_page: perPage,
                                    type: shopType,
                                    auth_status: shopStatus,
                                    name: shopName,
                                }
                            })  
                        }
                    }
                })
            }
        })
    }
    render(){
        const { confirmLoading } = this.state
        const { shopEditeTaoVisible, currentShop } = this.props.setting_shopManagement
        return (<div>
            <Modal
                title="编辑名称"
                visible={shopEditeTaoVisible}
                onCancel={this.closeShopEdite}
                onOk={this.saveShopEdite}
                width={400}
                confirmLoading= { confirmLoading }
            > 
                <FormComponent 
                    ref={node => this.formContent = node} 
                    currentShop={currentShop}
                    key={new Date()}
                ></FormComponent>
            </Modal>  
        </div>)
    }
}