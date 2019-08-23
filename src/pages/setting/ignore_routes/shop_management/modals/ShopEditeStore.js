//虎赞小店店铺授权
import React , {Component} from 'react'
import {connect} from 'dva'
import { Input, Modal, Form,  Cascader, message } from 'antd'
import {AREA_DATA} from 'components/business/CitySelect/AreaData'
const FormItem = Form.Item
const { TextArea } = Input

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
//地区数据
const options = AREA_DATA
class FormContent extends Component {
    constructor(props){
        super(props)
        this.state={
            name: this.props.currentShop.name,
            province: this.props.currentShop.province,
            city: this.props.currentShop.city,
            county: this.props.currentShop.county,
            address: this.props.currentShop.address,    
        }
    }
    componentDidMount(){
        this.props.onRef(this)
        this.props.form.setFieldsValue({
            name: this.props.currentShop.name,
            textArea: this.props.currentShop.address,
        }) 
    }
    shopNameChange = (e)=> {
        this.setState({
            name: e.target.value,
        })  
        this.props.form.setFieldsValue({
            name: e.target.value,
        }) 
    }
    areaChange = (value)=> {
        this.setState({
            province: value[0],
            city: value[1],
            county: value[2],  
        })
        this.props.form.setFieldsValue({
            textArea: value
        })
    }
    textAreaChange = (e)=> {
        this.setState({
            address: e.target.value,
        })
        this.props.form.setFieldsValue({
            textArea: e.target.value,
        }) 
    }
    handleSubmit = () => {
        let validate
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.props.changeState({...values,...this.state})
                validate = true
            }else{
                validate = false 
            }
        })
        return validate
    }
    //验证店铺名
    validateName = (rule, value, callback)=>{
        if(!value){
            callback('请填写店铺名')
            return
        }
        if(/\s/.test(value)){
            callback('不支持空格')
            return
        }
        if(value.length > 100){
            callback('限100个字内')
            return
        }
        callback()
    }
    validateArea = (rule, value, callback) => {
        const { province, city, county, address } = this.state
        // 判断province是否在地址中
        let flag = false
        options.forEach((item) => { 
            if (item.value === province) { 
                flag = true
            }
        })
        if (!province || !city || !county || !flag) {
            callback('请填写门店地址')
            return
        }
        if(!address){
            callback('请填写详细地址')
            return
        }
        callback()
    }
    render(){
        const { getFieldDecorator } = this.props.form
        const { province, city, county } = this.state
        return (
            <Form>
                <FormItem 
                    {...formItemLayout} 
                    label="门店名称"
                    required= {true}
                >
                    {getFieldDecorator('name',{
                        rules: [{ validator: this.validateName }],
                    })(
                        <Input
                            onChange={this.shopNameChange}
                            placeholder="门店名称" 
                            style={{ width: 240 }} 
                        />
                    )}
                </FormItem> 
                <FormItem 
                    {...formItemLayout} 
                    label="门店地址"
                    required= {true}
                    extra={(
                        <TextArea 
                            value={this.state.address}
                            onChange={this.textAreaChange}
                            placeholder="详细地址" 
                            style={{ width: 240, marginTop: 20 }}  
                            rows={4} 
                        />
                    )}
                >
                    {getFieldDecorator('textArea',{
                        rules: [
                            { validator: this.validateArea },
                        ],
                    })(
                        <div> 
                            <Cascader 
                                ref={node => this.casNode = node}
                                options={options} 
                                onChange={this.areaChange}
                                placeholder="省/市/区" 
                                style={{ width: 240 }}
                                value={[province, city, county]}
                            ></Cascader>
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
export default class ShopEditeStore extends Component {
    constructor(){
        super()
        this.state= {
            confirmLoading: false
        }
    }
    closeShopEdite = () => {
        this.props.dispatch({
            type: 'setting_shopManagement/setProperty',
            payload:{ shopEditeStoreVisible: false }
        }) 
    }
    onRef = (ref) => {
        this.childComponent = ref
    }
    changeState = (value) => {
        this.setState({
            confirmLoading: true
        })
        const shopId = this.props.setting_shopManagement.currentShop.id
        const type = this.props.setting_shopManagement.currentShop.type
        //请求接口，保存门店修改
        this.props.dispatch({
            type: 'setting_shopManagement/editeShopStore',
            payload:{ 
                id: shopId,
                type: type,
                name: value.name || '',
                province: value.province || '',
                city: value.city || '',
                county: value.county || '',
                address: value.address || '',
            },
            callback: (data) => {
                this.setState({
                    confirmLoading: false
                })
                //隐藏弹窗
                this.props.dispatch({
                    type: 'setting_shopManagement/setProperty',
                    payload:{ shopEditeStoreVisible: false }
                })
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
    saveShopEdite = () => {
        this.childComponent.handleSubmit()
    }
    render(){
        const { confirmLoading } = this.state
        const { shopEditeStoreVisible, currentShop } = this.props.setting_shopManagement
        return (<div>
            <Modal
                title="编辑"
                visible={shopEditeStoreVisible}
                onCancel={this.closeShopEdite}
                onOk={this.saveShopEdite}
                width={600}
                confirmLoading= { confirmLoading }
            > 
                <FormComponent 
                    currentShop={currentShop} 
                    onRef={this.onRef} 
                    changeState={this.changeState}
                    key={new Date()}
                ></FormComponent>
            </Modal>  
        </div>)
    }
}