/*
 * @Author: sunlzhi 
 * @Date: 2018-10-11 14:15:42 
 * @Last Modified by: sunlzhi
 * @Last Modified time: 2018-11-05 16:01:21
 */

import React, { Component, Fragment } from 'react'
// import { connect } from 'dva'
import { Button, Form, Input, Upload, message, Icon, Select, Checkbox } from 'antd'
import styles from './index.less'

const { TextArea } = Input
const Option = Select.Option

@Form.create({})

export default class Index extends Component {
    state = {
        isEdit: false,
        payConfigure: [],
        editPayConfigureOption: '',
        textArea: '',
        logoUrl: '',
        banUrl: '',
        fileList: [],
        fileListBanner: [],
    }
    
    componentDidMount() {
        let {shopInfo} = this.props.initialization
        this.getToken()
        // 请求支付配置列表
        this.props.dispatch({
            type: 'initialization/getWxMerchants',
        })
        // 请求小程序列表
        this.props.dispatch({
            type: 'initialization/getMpas',
        })
        
        this.modifyLogoUrl(shopInfo)
    }

    // 修改logoUrl和banUrl
    modifyLogoUrl = (shopInfo) =>{
        // console.log(shopInfo.logo_url, shopInfo.description)
        this.setState({
            textArea: shopInfo.description,
            logoUrl: shopInfo.logo_url,
            banUrl: shopInfo.banner,
            
        })
        if (shopInfo.logo_url) {
            this.setState({
                fileList: [{
                    uid: -1,
                    status: 'done',
                    url: `//image.51zan.com/${shopInfo.logo_url}`,
                }],
            })
        }
        if (shopInfo.banner) {
            this.setState({
                fileListBanner: [{
                    uid: -1,
                    status: 'done',
                    url: `//image.51zan.com/${shopInfo.banner}`,
                }],
            })
        }
    }

    // 获取token
    getToken = () => {
        this.props.dispatch({
            type: 'initialization/getToken',
            payload: {
                type: 'image'
            }
        })
    }

    //添加数据
    getCreateData(paies) {
        this.props.dispatch({
            type: "setting_pay/create",
            payload: {
                paies: paies,
            },
            callback: () => {
                message.success(`添加支付配置成功`)
                this.props.onAddCompleted('ok')
            }
        })
    }
    
    setTextArea= (e)=>{
        this.setState({
            textArea: e.target.value
        })
    }

    // 提交表单
    handleSubmit = (e) => {
        e.preventDefault()
        this.props.form.validateFieldsAndScroll((err, values) => {
            // console.log(values)
            if (!err) {
                let data = {
                    type: 1,
                    name: values.name || '',
                    logo_url: this.state.logoUrl,
                    customer_service_mobile: values.customer_service_mobile || '',
                    description: values.description || '',
                    banner: this.state.banUrl || '',
                    account_id: values.account_id || '',
                    pay_conf_id: values.pay_conf_id || '',
                }

                let mpaId = ''
                for (let v of this.props.initialization.mpas) {
                    if (values.account_id === v.app_id) {
                        mpaId = v.id
                    }
                }
                data.wx_account_id = mpaId

                if (this.props.hasShop === 1) {
                    data.shop_id = this.props.initialization.shopInfo.id
                }
                this.props.dispatch({
                    type: this.props.hasShop === 1 ? 'initialization/updateShop' : 'initialization/addShop',
                    payload: data,
                    callback: (res) => {
                        this.props.handleCurrent(3)
                        // console.log(res)
                    }
                })
            }
        })
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

    // logo图片删除
    handleRemove = (file) => {
        const {fileList} = this.state
        for (let [i, v] of fileList.entries()) {
            if (v.uid === file.uid) {
                fileList.splice(i, 1)
                this.setState({
                    fileList,
                    logoUrl: ''
                },()=>{
                    this.props.form.validateFields(['logo_url'], {force: true})
                })
                break
            }
        }
    }

    // logo图片上传
    handleChange = (info) => {
        const {fileList} = info
        const photoPrefix = this.props.initialization.photoPrefix

        if (info.file.status === 'uploading') {
            this.setState({ fileList })
        }

        if (info.file.status === 'done') {
            fileList.map((file) => {
                if (file.response) {
                    file.url = `//${photoPrefix}/${file.response.key}`
                }
                return file
            })
    
            this.setState({
                fileList,
                logoUrl: `${info.file.response.key}`,
            })
        }
    }

    validatorLogo = (rule, value, callback) => {
        let {logoUrl} = this.state
        if (!logoUrl) {
            callback('请先上传logo图片！')
        }
        callback()
    }

    // banner图片删除
    handleRemoveBanner = (file) => {
        const {fileListBanner} = this.state
        for (let [i, v] of fileListBanner.entries()) {
            if (v.uid === file.uid) {
                fileListBanner.splice(i, 1)
                this.setState({
                    fileListBanner,
                    banUrl: ''
                })
                break
            }
        }
    }

    // banner图片上传
    handleChangeBanner = (info) => {
        const fileListBanner = info.fileList
        const photoPrefix = this.props.initialization.photoPrefix

        if (info.file.status === 'uploading') {
            this.setState({ fileListBanner })
        }

        if (info.file.status === 'done') {
            fileListBanner.map((file) => {
                if (file.response) {
                    file.url = `//${photoPrefix}/${file.response.key}`
                }
                return file
            })
    
            this.setState({
                fileListBanner,
                banUrl: `${info.file.response.key}`,
            })
        }
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
    render() {
        const FormItem = Form.Item
        const { getFieldDecorator } = this.props.form
        const {WxMerchants, mpas, shopInfo, mpaId} = this.props.initialization
        const {fileList, fileListBanner} = this.state
        
        // logo upload
        const uploadProps = {
            name: 'file',
            action: '//upload.qiniup.com/',
            accept: ".jpg,.png",
            headers: {},
            data: {
                token: this.props.initialization.qiniuToken,
            },
            beforeUpload: (file, fileList)=>{
                this.setState({
                    isUpload: true
                })
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
            listType: 'picture-card',
            onChange: this.handleChange,
            fileList: fileList,
            onRemove: this.handleRemove,
        }

        //banner upload
        const banneruploadProps = {
            name: 'file',
            action: '//upload.qiniup.com/',
            accept: ".jpg,.png",
            headers: {},
            data: {
                token: this.props.initialization.qiniuToken,
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
            listType: 'picture-card',
            onChange: this.handleChangeBanner,
            fileList: fileListBanner,
            onRemove: this.handleRemoveBanner,
            // showUploadList:false,
        }

        const formItemLayout = {
            labelCol: {
                xs: { span: 4 },
                sm: { span: 7 },
            },
            wrapperCol: {
                xs: { span: 18 },
                sm: { span: 17 },
                className: styles.formLabel
            }
        }
        const tailFormItemLayout = {
            labelCol: {
                xs: { span: 4 },
                sm: { span: 7 },
            },
            wrapperCol: {
                xs: {
                    span: 24,
                    offset: 0,
                },
                sm: {
                    span: 17,
                    offset: 7,
                },
                className: styles.formLabel
            },
        }


        // 选择小程序下拉框内容
        const mpaConfigureOption = mpas.map(payConf => <Option key={payConf.app_id}>{payConf.name}</Option>)
        // 选择支付配置下拉框内容
        const payConfigureOption = WxMerchants.map(payConf => <Option key={payConf.pay_conf_id}>商户号：{payConf.key}</Option>)

        return (
            <div className={styles.createShop}>
                <Form className={styles.form} onSubmit={this.handleSubmit}>
                    <FormItem {...formItemLayout} label="授权小程序名:">
                        {getFieldDecorator('account_id', {
                            rules: [{ required: true, message: '请选择小程序' }],
                            initialValue: mpaId.app_id,
                        })(
                            <Select className={styles.modalItem} placeholder="请选择">
                                {mpaConfigureOption}
                            </Select>
                        )}
                    </FormItem>
                    <FormItem {...formItemLayout} label="微信支付商户号:">
                        {getFieldDecorator('pay_conf_id', {
                            rules: [{ required: true, message: '请选择微信支付商户号' }],
                        })(
                            <Select className={styles.modalItem} placeholder="请选择">
                                {payConfigureOption}
                            </Select>
                        )}
                    </FormItem>
                    <FormItem {...formItemLayout} label="店铺名称:">
                        {getFieldDecorator('name', {
                            rules: [{ required: true, message: '请输入店铺名称' }],
                            initialValue: shopInfo.name,
                        })(
                            <Input className={styles.modalItem} placeholder="请输入" maxLength="20" />
                        )}
                    </FormItem>
                    <FormItem 
                        {...formItemLayout} 
                        label="店铺logo"
                        extra={(<div className={styles.font12}>建议尺寸：160×160像素，只能上传jpg/jpeg/png文件，图片大小不超过1MB</div>)}
                    >
                        {getFieldDecorator('logo_url',{
                            rules: [{ required: true, validator: this.validatorLogo }],
                            initialValue: shopInfo.logo_url,
                        })(
                            <Upload {...uploadProps}>
                                {fileList.length >= 1 ? null : <div>
                                    <Icon type='plus' style={{fontSize: 32}} />
                                    <div className="ant-upload-text">上传图片</div>
                                </div>
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
                            initialValue: shopInfo.customer_service_mobile,
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
                    <FormItem {...formItemLayout} label=" " className={styles.nextButton}>
                        <Button type="primary" htmlType="submit">下一步</Button>
                    </FormItem>
                </Form>
            </div>
        )
    }
}