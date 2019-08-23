import React , {Component} from 'react'
import {connect} from 'dva'
import { Input, Modal, Form, Upload, Icon, message } from 'antd'
import styles from '../index.less'
const FormItem = Form.Item
const { TextArea } = Input

@connect(({setting_shopManagement, base}) => ({
    setting_shopManagement,
    base,
}))
export default class ShopEditeXuan extends Component {
    state = {
        confirmLoading: false,
    }
    closeShopEdite = () => {
        this.props.dispatch({
            type: 'setting_shopManagement/setProperty',
            payload:{ shopEditeXuanVisible: false }
        }) 
    }
    saveShopEdite = ()=>{
        this.formContent.validateFields((err, values)=>{
            if(!err){
                this.setState({
                    confirmLoading: true
                })
                const { currentShop } = this.props.setting_shopManagement
                this.props.dispatch({
                    type: 'setting_shopManagement/editeShopStore',
                    payload:{ 
                        id: currentShop.id,
                        type: currentShop.type,
                        name: values.name || '',
                        logo_url: values.logo_url || '',
                        description: values.description || '',
                        customer_service_mobile: values.customer_service_mobile || '',
                        banner: values.banner || '',
                    },
                    callback: (data) => {
                        this.setState({
                            confirmLoading: false
                        })
                        //隐藏弹窗
                        this.closeShopEdite()
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
        const { shopEditeXuanVisible, photoToken, photoPrefix, currentShop } = this.props.setting_shopManagement
        return (
            <Modal
                title="编辑"
                visible={shopEditeXuanVisible}
                onCancel={this.closeShopEdite}
                onOk={this.saveShopEdite}
                width= {600}
                confirmLoading= { confirmLoading }
            > 
                <FormComponent ref={node => this.formContent = node} photoToken={photoToken} photoPrefix={photoPrefix} currentShop={currentShop}></FormComponent>
            </Modal> 
        )
    }
}

const FormComponent = Form.create()(
    class extends Component {
        state = {
            logoUrl: '',
            banUrl: '',
            textArea: '',
        }
        componentDidMount() {
            const { currentShop } = this.props
            this.props.form.setFieldsValue({
                name: currentShop.name || '',
                logo_url: currentShop.logo_url || '',
                customer_service_mobile: currentShop.customer_service_mobile || '',
                description: currentShop.description || '',
                banner: currentShop.banner || '',
            })
            this.setState({
                logoUrl: currentShop.logo_url?`${currentShop.logo_url}`:'',
                banUrl: currentShop.banner?`${currentShop.banner}`:'',
                textArea: currentShop.description || '',
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
            if(!(/^1(3|4|5|7|8)\d{9}$/.test(value)) && !(/^\d{3,4}-\d{7,8}$/.test(value))){
                callback('请填写正确的客服电话')
                return
            }
            callback()
        }
        normFileLogo = (e) => {
            console.log(e)
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
        logoChange = (info)=> {
            if (info.file.status === 'done') {
                message.success(`${info.file.name} 上传成功`)  
                this.setState({
                    logoUrl: `${info.file.response.key}`
                })
            } 
        }
        banChange = (info)=> {
            if (info.file.status === 'done') {
                message.success(`${info.file.name} 上传成功`)  
                this.setState({
                    banUrl: `${info.file.response.key}`
                })
            }
        }
        setTextArea= (e)=>{
            this.setState({
                textArea: e.target.value
            })
        }
        render(){
            const { getFieldDecorator } = this.props.form
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
            const  uploadProps = {
                name: 'file',
                action: 'https://upload.qiniup.com/',
                headers: {
                    authorization: 'authorization-text',
                },
                data: {
                    token: this.props.photoToken,
                },
                beforeUpload: (file, fileList)=>{
                    const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
                    if (!isJPG) {
                        message.error('文件限制jpg/jpeg/png!')
                        fileList.pop()
                    }
                    const isLt1M = file.size / 1024 / 1024 < 1
                    if (!isLt1M) {
                        message.error('大小限制1MB!')
                        fileList.pop()
                    }
                    return isJPG && isLt1M
                },
            }
            const { photoPrefix } = this.props
            const { logoUrl, banUrl } = this.state
            return (
                <Form>
                    <FormItem {...formItemLayout} label="店铺名称" required= {true}>
                        {getFieldDecorator('name',{
                            rules: [{ validator: this.validateName}]
                        })(<Input placeholder="店铺名称" className={styles.modalItem} />)}
                    </FormItem>
                    <FormItem {...formItemLayout} label="店铺logo" required= {true} extra={(<div className={styles.font12}>建议尺寸：160×160像素，只能上传jpg/jpeg/png文件，图片大小不超过1MB</div>)}>
                        {getFieldDecorator('logo_url',{
                            getValueFromEvent: this.normFileLogo,
                            rules: [{ required: true, message: '请上传店铺logo' }],
                        })(
                            <Upload {...uploadProps} showUploadList={false}  onChange={this.logoChange}>
                                {this.state.logoUrl
                                    ?<div className={styles.uploadLogoShow}><img src={`//${photoPrefix}/${logoUrl}`} alt={'上传店铺logo'} /></div>
                                    :<div className={styles.uploadLogo}><div><Icon type="plus" style={{fontSize: 20, color: '#ccc'}} /></div></div>
                                }
                            </Upload>
                        )}
                    </FormItem>
                    <FormItem {...formItemLayout} label="客服电话" required= {true}>
                        {getFieldDecorator('customer_service_mobile',{
                            rules: [{ validator: this.validateTel}],
                        })(<Input placeholder="客服电话" className={styles.modalItem} />)}
                    </FormItem>
                    <FormItem {...formItemLayout} label="店铺介绍" required= {true}  extra={(
                        <div className={styles.modalItem} style={{ marginTop: 5, textAlign: 'right',fontSize: 12,lineHeight: 1}}>
                            {this.state.textArea.length}/{45}
                        </div>
                    )}>
                        {getFieldDecorator('description',{
                            rules: [
                                { required: true, message: '请填写店铺介绍' },
                                { max: 45, message: '限45个字内' }
                            ],
                        })(<TextArea placeholder="介绍一下本店铺" className={styles.modalItem} rows={4} onChange={this.setTextArea} />)}
                    </FormItem>
                    <FormItem {...formItemLayout} label="店铺banner" extra={(<div className={styles.font12}>建议尺寸：160×160像素，只能上传jpg/jpeg/png文件，图片大小不超过1MB</div>)}>
                        {getFieldDecorator('banner',{
                            getValueFromEvent: this.normFileBan,
                        })(
                            <Upload {...uploadProps} showUploadList={false} onChange={this.banChange}>
                                {this.state.banUrl
                                    ?<div className={styles.uploadBannerShow}><img src={`//${photoPrefix}/${banUrl}`} alt={'上传店铺banner'} /></div>
                                    :<div className={styles.uploadBanner}>
                                        <div><Icon type="plus" style={{fontSize: 40,display: 'block', color: '#ccc'}} /><span>点击上传</span></div>
                                    </div>
                                }
                            </Upload>
                        )}
                    </FormItem>
                </Form>
            )
        }
    }
)