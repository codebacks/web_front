//虎赞小店店铺授权
import React , {Component} from 'react'
import router from 'umi/router'
import {connect} from 'dva'
import { Select,  Modal, Form, message } from 'antd'

const FormItem = Form.Item
const Option = Select.Option

//表单样式
const formItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 },
        style: {
            paddingLeft: 10
        }
    },
}

class FormContent extends Component {
    componentDidMount(){
        this.props.form.setFieldsValue({
            mpa_id: '',
        })
    }
    changeShopType = (value) => {
        this.props.form.setFieldsValue({
            mpa_id: value,
        }) 
    }
    goAdd = () => {
        this.props.closeShopOauth()
        router.push('/setting/authorization/mp_auth')
    }
    render(){
        const { getFieldDecorator } = this.props.form
        const { programList } = this.props
        return (
            <Form>
                <FormItem 
                    {...formItemLayout} 
                    label="当前店铺" 
                    required= {true}
                >
                    <span className="ant-form-text">{this.props.currentShop.name}</span>
                </FormItem>  
                <FormItem 
                    {...formItemLayout} 
                    label="授权小程序" 
                    required= {true}
                >
                    {getFieldDecorator('mpa_id',{
                        rules: [{ required: true, message: '请选择授权小程序' }],
                    })(
                        <div>
                            <Select defaultValue='' style={{ width: 180 }} onChange={this.changeShopType} >
                                <Option value='' key=''>请选择</Option>
                                {
                                    programList.length>0&&programList.map((item) => {
                                        return <Option value={`${item.id},${item.app_id}`} key={item.id}>{item.name}</Option>
                                    })
                                }
                            </Select>
                            <span onClick={this.goAdd} style={{marginLeft: 10, color: '#4492FF'}}>去添加</span>
                        </div>
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
export default class ShopOauthXuan extends Component { 
    constructor(props){
        super(props)
        this.state= {
            confirmLoading: false
        }
    }
    saveShopOauth = () => {
        this.formContent.validateFields((err, values)=>{
            if(!err){
                this.setState({
                    confirmLoading: true
                })
                const shopId = this.props.setting_shopManagement.currentShop.id
                // console.log(values.mpa_id.split(',')[0])
                // console.log(values.mpa_id.split(',')[1])
                //请求接口保存修改
                this.props.dispatch({
                    type: 'setting_shopManagement/shopOauthXuan',
                    payload:{ 
                        shop_id: shopId,
                        wx_account_id: values.mpa_id?values.mpa_id.split(',')[0]:'',
                        app_id: values.mpa_id?values.mpa_id.split(',')[1]:'',
                    },
                    callback: (data) => {
                        this.setState({
                            confirmLoading: false
                        }) 
                        this.props.dispatch({
                            type: 'setting_shopManagement/setProperty',
                            payload:{ shopOauthXuanVisible: false }
                        })
                        if(!data.error){
                            message.success(`授权成功`)
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
    closeShopOauth = () => {
        this.props.dispatch({
            type: 'setting_shopManagement/setProperty',
            payload:{ shopOauthXuanVisible: false }
        }) 
    }
    render(){
        const { confirmLoading } = this.state
        const { shopOauthXuanVisible, currentShop, oauthXuanList } = this.props.setting_shopManagement
        const programList = oauthXuanList
        return (<div>
            <Modal
                title="授权小程序"
                visible={shopOauthXuanVisible}
                onCancel={this.closeShopOauth}
                onOk={this.saveShopOauth}
                width={400}
                confirmLoading= { confirmLoading }
            > 
                <FormComponent 
                    ref={node => this.formContent = node} 
                    programList={programList} 
                    currentShop={currentShop} 
                    closeShopOauth={this.closeShopOauth}
                ></FormComponent>
            </Modal>  
        </div>)
    }
}