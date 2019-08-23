//虎赞小店店铺授权
import React , {Component} from 'react'
import {connect} from 'dva'
import { Modal, Form, Input, message } from 'antd'
import { getShopTypeByVal } from '../../../../../common/shopConf'

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
            name: this.props.name,
        }) 
    }
    changeName = (e)=>{
        this.props.form.setFieldsValue({
            name: e.target.value,
        })    
    }
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
        if(value.length > 30){
            callback('限30个字内')
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
                    extra= {'请确保店铺名称与平台店铺一致，否则将无法同步'}
                >
                    {getFieldDecorator('name',{
                        rules: [
                            { validator: this.validateName},
                        ],
                    })(
                        <Input placeholder="限30字内" style={{ width: 240 }} onChange={this.changeName}  />
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
export default class ShopInfoTao extends Component {
    constructor(){
        super()
        this.state= {
            confirmLoading: false
        }
    }
    cancelGetShopInfo = () => {
        this.props.dispatch({
            type: 'setting_shopManagement/setProperty',
            payload:{ shopInfoTaoVisible: false }
        })    
    }
    saveShopInfo= () => {
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
                        this.cancelGetShopInfo() 
                        if(!data.error){
                            message.success(`修改成功`) 
                            this.props.dispatch({
                                type: 'setting_shopManagement/getShopList',
                                payload:{}
                            })  
                        }
                    }
                })
            }
        })
    }
    render(){
        const { confirmLoading } = this.state
        const { shopInfoTaoVisible, currentShop } = this.props.setting_shopManagement
        return (<div>
            {/*查看店铺信息弹窗*/}
            <Modal
                title= "查看详情"
                visible={shopInfoTaoVisible}
                onCancel = {this.cancelGetShopInfo}
                onOk={this.saveShopInfo}
                width={600}
                confirmLoading= { confirmLoading }
            >
                <FormComponent 
                    ref={node => this.formContent = node} 
                    name={currentShop.name}
                    key={new Date()}
                ></FormComponent>
                <Form>
                    <FormItem 
                        {...formItemLayout} 
                        label="店铺类型"
                    >
                        <span>{getShopTypeByVal(currentShop.type)}</span>
                    </FormItem>
                    <FormItem 
                        {...formItemLayout} 
                        label="店主ID"
                    >
                        <span>{currentShop.nick}</span>
                    </FormItem>
                    <FormItem 
                        {...formItemLayout} 
                        label="授权时间"
                    >
                        <span>{currentShop.auth_at}</span>
                    </FormItem>
                    <FormItem 
                        {...formItemLayout} 
                        label="到期时间"
                    >
                        <span>{currentShop.expire_at}</span>
                    </FormItem>
                    <FormItem 
                        {...formItemLayout} 
                        label="授权状态"
                    >
                        <span>{currentShop.auth_status === 1 ? '未授权' :(currentShop.auth_status === 2 ? '已授权' :'已到期')}</span>
                    </FormItem>
                </Form>
            </Modal>  
        </div>)
    }
}