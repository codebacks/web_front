import React, { Component, Fragment } from 'react'
import { Select, Input, Modal, Form, Upload, Cascader, Button, Icon, Checkbox, message} from 'antd'
import { SHOP_TYPE as SHOP_TYPES, getShopValByName  } from '../../../../../common/shopConf'
import _ from 'lodash'
import {AREA_DATA} from 'components/business/CitySelect/AreaData'
import styles from '../index.less'
import { connect } from 'dva'
const Option = Select.Option
const FormItem = Form.Item
const { TextArea } = Input
//表单样式
const formItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 },
    },
}
const tailFormItemLayout = {
    wrapperCol: {
        xs: {
            span: 24,
            offset: 0,
        },
        sm: {
            span: 20,
            offset: 4,
        },
    },
}

//地区数据
const options = AREA_DATA
//虎赞小店
class SelectAext extends Component {
    constructor(props){
        super(props)
        this.state={
            textArea: '',
            logoUrl: '',
            banUrl: '',
            isUpload: false,
        }
    }
    componentDidMount() {
        this.props.onRef(this)
    }
    handleSubmit = () => {
        const { isUpload } = this.state
        if(isUpload){
            message.error('正在上传图片')
            return
        }
        //设置默认的店铺类型
        this.props.form.setFieldsValue({
            type: this.props.defaultShopType
        })
        let validate
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.props.changeState(values)
                validate = true
            }else{
                validate = false 
            }
        })
        return validate
    }
    setTextArea= (e)=>{
        this.setState({
            textArea: e.target.value
        })
    }
    changeShopType= (value,option)=>{
        this.props.changeShopType(value,option)
        //console.log(this.props.form)
        //切换的时候更改表单的值
        this.props.form.setFieldsValue({
            type: value
        })
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
        if(value.length > 20){
            callback('限20个字内')
            return
        }
        callback()
    }
    //验证电话号码
    validateTel = (rule, value, callback)=>{
        if(!value){
            callback('请填写客服电话')
            return
        }
        if(/\s/.test(value)){
            callback('不支持空格')
            return
        }
        if(!(/^1(3|4|5|7|8)\d{9}$/.test(value))  && !(/^\d{3,4}-\d{7,8}$/.test(value))){
            callback('请填写正确的客服电话')
            return
        }
        callback()
    }
    logoChange= (info) =>{
        if (info.file.status === 'done') {
            message.success(`${info.file.name} 上传成功`)  
            this.setState({
                logoUrl: `${info.file.response.key}`,
                isUpload: false,
            })
        } 
    }
    banChange= (info) =>{
        if (info.file.status === 'done') {
            message.success(`${info.file.name} 上传成功`)  
            this.setState({
                banUrl: `${info.file.response.key}`,
                isUpload: false,
            })
        }
    }
    normFileLogo = (e) => {
        if(e.fileList && e.fileList[0] && e.fileList[0].response){
            return e.fileList[0].response.key
        }
        return this.state.logoUrl
    }
    normFileBan = (e) => {
        if(e.fileList && e.fileList[0] && e.fileList[0].response){
            return e.fileList[0].response.key
        }
        return this.state.banUrl
    }
    showAgree = (e) => {
        this.skipRef.click()
    }
    onChangeCheck = (e) => { 
        let value = e.target.checked
        let data
        if (value === true) {
            data = 1
        } else { 
            data = null
        }
        this.props.form.setFieldsValue({
            agreement: data
        })
    }
    render(){
        const { getFieldDecorator } = this.props.form
        const { logoUrl, banUrl } = this.state
        const {initData} = this.props.base
        const version_id = _.get(initData, 'company.product_version.id', '') 
        const SHOP_TYPE = version_id === 10|| version_id === 0 ? SHOP_TYPES.filter(item=>item.name !== "TaoBao" &&  item.name !== "TianMao" &&  item.name !== "JD" &&  item.name !== "YouZan"):SHOP_TYPES
        const  uploadProps = {
            name: 'file',
            accept:'image/*',
            action: '//upload.qiniup.com/',
            headers: {
                authorization: 'authorization-text',
            },
            data: {
                token: this.props.photoToken,
            },
            beforeUpload: (file, fileList)=>{
                this.setState({
                    isUpload: true
                })
                const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
                if (!isJPG) {
                    message.error('文件限制jpg/jpeg/png!')
                    fileList.pop()
                    this.setState({
                        isUpload: false
                    })
                }
                const isLt1M = file.size / 1024 / 1024 < 1
                if (!isLt1M) {
                    message.error('大小限制1MB!')
                    fileList.pop()
                    this.setState({
                        isUpload: false
                    }) 
                }
                return isJPG && isLt1M
            },
        }
        return ( 
            <Form>
                <FormItem 
                    label="店铺类型"
                    {...formItemLayout}
                >
                    {getFieldDecorator('type',{
                        rules: [{ required: true, message: '请选择店铺类型' }],
                    })(
                        <div className={styles.modalItem}>
                            <Select defaultValue={this.props.defaultShopType} onChange={this.changeShopType} dropdownClassName={styles.userSelect}> 
                                {
                                    SHOP_TYPE.map((item)=>{
                                        return <Option value={item.value} key={item.value}>{item.type}</Option>
                                    })
                                }
                            </Select>
                        </div>
                    )}
                </FormItem>
                <FormItem 
                    {...formItemLayout} 
                    label="店铺名称"
                    required= {true}
                >
                    {getFieldDecorator('name',{
                        rules: [
                            { validator: this.validateName},
                        ],
                    })(
                        <Input
                            placeholder="店铺名称"  
                            className={styles.modalItem}
                        />
                    )}
                </FormItem>
                <FormItem 
                    {...formItemLayout} 
                    label="店铺logo"
                    required= {true} 
                    extra={(<div className={styles.font12}>建议尺寸：160×160像素，只能上传jpg/jpeg/png文件，图片大小不超过1MB</div>)}
                >
                    {getFieldDecorator('logo_url',{
                        getValueFromEvent: this.normFileLogo,
                        rules: [{ required: true, message: '请上传店铺logo' }],
                    })(
                        <Upload {...uploadProps} showUploadList={false}  onChange={this.logoChange}>
                            {this.state.logoUrl
                                ?<div className={styles.uploadLogoShow}><img src={`//${this.props.photoPrefix}/${logoUrl}`} alt={'上传店铺logo'} /></div>
                                :<div className={styles.uploadLogo}><div><Icon type="plus" style={{fontSize: 20, color: '#ccc'}} /></div></div>
                            }
                        </Upload>
                    )}
                </FormItem>
                <FormItem 
                    {...formItemLayout} 
                    label="客服电话" 
                    required= {true}
                >
                    {getFieldDecorator('customer_service_mobile',{
                        rules: [
                            { validator: this.validateTel}
                        ],
                    })(
                        <Input
                            placeholder="客服电话" 
                            className={styles.modalItem}
                        />
                    )}
                </FormItem>
                <FormItem 
                    {...tailFormItemLayout} 
                >
                    {getFieldDecorator('agreement',{
                        valuePropName: 'checked',
                        rules: [
                            { required: true, message: '请阅读并同意协议' },
                        ],
                    })(
                        <Fragment>
                            <Checkbox onChange={this.onChangeCheck}>我已经阅读</Checkbox>
                            <span onClick={(e)=>this.showAgree(e)} className={styles.clickCon}>协议</span>
                        </Fragment>
                    )}
                </FormItem>
                <a style={{ display: 'none' }} ref={node => this.skipRef = node} href='/mall/agreement' target='_blank' rel="noopener noreferrer" >协议</a>
            </Form>
        )
    }    
}
const SelectAextForm = Form.create()(SelectAext)


//淘宝天猫内容
class SelectBext extends Component {
    componentDidMount() {
        this.props.onRef(this)
    }
    changeShopType= (value,option)=>{
        this.props.changeShopType(value,option)
        this.props.form.setFieldsValue({
            type: value
        })
    }
    handleSubmit = () => {
        //设置默认的店铺类型
        this.props.form.setFieldsValue({
            type: this.props.defaultShopType
        })
        let validate
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.props.changeState(values)
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
        if(value.length > 100){
            callback('限100个字内')
            return
        }
        callback()
    }
    render(){
        const { getFieldDecorator } = this.props.form
        const {initData} = this.props.base
        const version_id = _.get(initData, 'company.product_version.id', '') 
        const SHOP_TYPE = version_id === 10 || version_id === 0 ? SHOP_TYPES.filter(item=>item.name !== "TaoBao" &&  item.name !== "TianMao" &&  item.name !== "JD" &&  item.name !== "YouZan"):SHOP_TYPES
        return (
            <Form>
                <FormItem 
                    label=""
                    {...formItemLayout}
                >
                    <div style={{marginLeft: 15, lineHeight: '24px'}}>{this.props.defaultShopType ===9 ? '微商小店为微商类型商家自建店铺无需授权，创建后可在牛客服进行手动录单操作！': '请确保店铺名称与平台店铺一致，否则将无法同步！'}</div>
                </FormItem>
                <FormItem label="店铺类型" required= {true} {...formItemLayout}>
                    {getFieldDecorator('type',{
                        rules: [{ required: true, message: '请选择店铺类型' }],
                    })(
                        <div className={styles.modalItem}>
                            <Select defaultValue={this.props.defaultShopType} onChange={this.changeShopType} dropdownClassName={styles.userSelect}>
                                {
                                    SHOP_TYPE.map((item)=>{
                                        return <Option value={item.value} key={item.value}>{item.type}</Option>
                                    })
                                }
                            </Select>
                        </div>
                    )}
                </FormItem>     
                <FormItem 
                    {...formItemLayout} 
                    label="店铺名称"
                    required= {true}
                    extra={(<span>
                        {
                            parseInt(this.props.defaultShopType) === getShopValByName('TaoBao') && (
                                <div>
                                    <div style={{marginBottom: 8}}>登录淘宝千牛卖家中心，鼠标悬浮顶部导航栏卖家头像，获取店铺名称。示例如下：</div>
                                    <div><img src="https://image.51zan.com/2019/06/05/FsMyef5tO62m8YbkPpR9OyPH6JJP.png" /></div>
                                </div>
                            )
                        }
                        {
                            parseInt(this.props.defaultShopType) === getShopValByName('TianMao') && (
                                <div>
                                    <div style={{marginBottom: 8}}>登录天猫商家中心，店铺描述中直接获取店铺名称。示例如下：</div>
                                    <div><img src="https://image.51zan.com/2019/06/05/FrjBg-j3qM6OdpC9lSYrQeEzC8x8.png" /></div>
                                </div>
                            )
                        }
                    </span>)}
                >
                    {getFieldDecorator('name',{
                        rules: [
                            { validator: this.validateName},
                            { whitespace: true, message: '店铺名不能为空格'},
                        ],
                    })(
                        <Input
                            placeholder="店铺名称"  
                            className={styles.modalItem}
                        />
                    )}
                </FormItem>
            </Form>
        )
    }
}
const SelectBextForm = Form.create()(SelectBext)

//店铺内容
class SelectCext extends Component {
    constructor(){
        super()
        this.state={
            province: '',
            city: '',
            county: '',
            address: '',
        }
    }
    componentDidMount() {
        this.props.onRef(this)
    }
    changeShopType= (value,option)=>{
        this.props.changeShopType(value,option)
        this.props.form.setFieldsValue({
            type: value
        })
    }
    handleSubmit = () => {
        this.props.form.setFieldsValue({
            type: this.props.defaultShopType
        })
        let validate
        this.props.form.validateFields((err, values) => {
            console.log(values)
            if (!err) {
                this.props.changeState({...values,...this.state})
                validate = true
            }else{
                validate = false 
            }
        })
        return validate
    }
    areaChange = (value) => {
        this.setState({
            province: value[0],
            city: value[1],
            county: value[2],  
        })
        this.props.form.setFieldsValue({
            textArea: value
        }) 
    }
    textAreaChange = (e) => {
        this.setState({
            address: e.target.value, 
        })
        this.props.form.setFieldsValue({
            textArea: e.target.value,
        })
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
    validateArea = (rule, value, callback)=>{
        const { province, city, county, address } = this.state
        if(!province || !city  || !county ){
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
        const {initData} = this.props.base
        const version_id = _.get(initData, 'company.product_version.id', '')
        const SHOP_TYPE = version_id ===10 || version_id ===0? SHOP_TYPES.filter(item=>item.name !== "TaoBao" &&  item.name !== "TianMao" &&  item.name !== "JD" &&  item.name !== "YouZan"):SHOP_TYPES
        return (
            <Form>
                <FormItem label="店铺类型" required= {true} {...formItemLayout}>
                    {getFieldDecorator('type',{
                        rules: [{ required: true, message: '请选择店铺类型' }],
                    })(
                        <div className={styles.modalItem}>
                            <Select defaultValue={this.props.defaultShopType} onChange={this.changeShopType} dropdownClassName={styles.userSelect}> 
                                {
                                    SHOP_TYPE.map((item)=>{
                                        return <Option value={item.value} key={item.value}>{item.type}</Option>
                                    })
                                }
                            </Select>
                        </div>
                    )}
                </FormItem>     
                <FormItem 
                    {...formItemLayout} 
                    label="门店名称"
                    required= {true}
                >
                    {getFieldDecorator('name',{
                        rules: [{ validator: this.validateName}],
                    })(
                        <Input
                            placeholder="店铺名称"  
                            className={styles.modalItem}
                        />
                    )}
                </FormItem>
                <FormItem 
                    {...formItemLayout} 
                    label="门店地址"
                    required= {true}
                    extra={(
                        <TextArea 
                            placeholder="详细地址" 
                            className={styles.modalItem} 
                            style={{marginTop: 20}}  
                            rows={4}  
                            value={this.state.address} 
                            onChange={this.textAreaChange} 
                        />
                    )}
                >
                    {getFieldDecorator('textArea',{
                        rules: [
                            { validator: this.validateArea },
                        ],
                    })(
                        <div className={styles.modalItem}> 
                            <Cascader options={options} placeholder="省/市/区" value={[province, city, county]}  onChange={this.areaChange}></Cascader>        
                        </div>
                    )}
                </FormItem>
            </Form>
        )
    }
}
const SelectCextForm = Form.create()(SelectCext)

@connect(({setting_shopManagement, base}) => ({
    setting_shopManagement,
    base,
}))

export default class CreateShop extends Component {
    constructor(props){
        super(props)
        this.state = {
            type: getShopValByName('HuZan'),//店铺类型
            confirmLoading: false,
        }
    }
    changeShopType = (value,option) => {
        this.setState({
            type: value
        })
    }
    onRef = (ref) => {
        this.childComponent = ref
    }
    changeState= (value) => { 
        this.setState({
            confirmLoading: true
        })
        const name = value.name.replace(/(^\s*)|(\s*$)/g, "")
        this.props.dispatch({
            type: 'setting_shopManagement/createShop',
            payload: { 
                name: name || '',
                type: value.type || '',
                province: value.province || '',
                city: value.city || '',
                county: value.county || '',
                address: value.address || '',
                logo_url: value.logo_url? value.logo_url :'',
                description: value.description || '',
                customer_service_mobile: value.customer_service_mobile || '',
                banner: value.banner? value.banner :'',
            },
            callback: (data) => {
                this.setState({
                    confirmLoading: false
                })
                //隐藏弹窗
                this.cancelCreateShop()
                if(!data.error){
                    message.success(`创建成功`) 
                    this.props.dispatch({
                        type: 'setting_shopManagement/getShopList',
                        payload:{}
                    }) 
                }
            },
        })  
    }
    saveCreateShop = ()=>{
        this.childComponent.handleSubmit()
    }
    cancelCreateShop = ()=>{
        this.props.dispatch({
            type: 'setting_shopManagement/setProperty',
            payload: { createShopVisible: false },
        })
    }
    renderModal = (type) => {
        const { photoToken, photoPrefix } = this.props.setting_shopManagement
        if (type === getShopValByName('HuZan')) {
            return (
                <SelectAextForm
                    {...this.props}
                    changeShopType={this.changeShopType}
                    defaultShopType={this.state.type}
                    onRef={this.onRef}
                    changeState={this.changeState}
                    photoToken={photoToken}
                    photoPrefix={photoPrefix}
                    key={new Date()}
                ></SelectAextForm>
            )
        } else if (type === getShopValByName('Mendian')) { 
            return (
                <SelectCextForm 
                    {...this.props}
                    changeShopType={this.changeShopType} 
                    defaultShopType={this.state.type} 
                    onRef={this.onRef} 
                    changeState={this.changeState}
                    key={new Date()}
                ></SelectCextForm>
            )
        } else {
            return (
                <SelectBextForm 
                    {...this.props}
                    changeShopType={this.changeShopType} 
                    defaultShopType={this.state.type} 
                    onRef={this.onRef} 
                    changeState={this.changeState}
                    key={new Date()}
                ></SelectBextForm> 
            )
        }
    }
    render(){
        const {confirmLoading, type} = this.state
        const { createShopVisible } = this.props.setting_shopManagement
        return (
            <Modal 
                title='创建店铺'
                visible={createShopVisible}
                onCancel={this.cancelCreateShop}
                width= {600}
                confirmLoading= { confirmLoading }
                footer={(
                    <div>
                        <Button onClick={this.cancelCreateShop}>取消</Button>
                        <Button type="primary" onClick={this.saveCreateShop}>确定</Button>
                    </div>
                )}
            >
                { this.renderModal(type) }
            </Modal>
        )
    }
}