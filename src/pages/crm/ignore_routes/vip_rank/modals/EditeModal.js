import React, { Component, Fragment } from 'react'
import { connect } from 'dva'
import { Input, Form, Modal, Upload, Icon, Row, Spin, Radio, Switch, message } from 'antd'
import styles from './index.less'
import {jine} from '../../../../../utils/display'
import HzInput from '@/components/HzInput'
const FormItem = Form.Item
const RadioGroup = Radio.Group
const imgDomain = 'image.51zan.com'
const defaultImage = 'retail/web/vip_level/icon/'

@connect(({ base, vip_data }) => ({
    base,
    vip_data,
}))
@Form.create()
export default class Index extends Component {
    state = {
        loading: false,
        fileList: [],
        imageNum: 1,
        previewVisible: false,
        min_count: '',
        min_amount: '',
        type: '',
        defaultImg: true,
        current: {},
    }
    componentDidMount(){
        this.props.dispatch({
            type: 'vip_data/getToken',
            payload: {
                type: 'image',
            }
        })
        this.checkShow()
    }
    checkShow = ()=>{
        const { item } = this.props
        if (item && JSON.stringify(item) !== '{}') { 
            this.setState({
                loading: true,
            })
            this.props.dispatch({
                type: 'vip_data/vipRankDetail',
                payload: {
                    id: item.id,
                    level: item.level
                },
                callback: (data) => { 
                    this.setState({
                        loading: false,
                        current: {...data}
                    })
                    const name = data.name || ''
                    const min_count = data.min_count || ''
                    const min_amount = data.min_amount&&jine(data.min_amount, '0.00', 'Fen') || ''
                    const icon_url = data.icon_url || ''
                    let defaultImg
                    if(icon_url.indexOf(defaultImage) === -1){
                        defaultImg = false
                    }else{
                        defaultImg = true
                    }
                    let list = []
                    list.push({
                        uid: 1,
                        status: 'done',
                        urlText: icon_url,
                        url: icon_url?`//${imgDomain}/${icon_url}`:'',
                    })
                    this.setState({
                        fileList: icon_url ? list : '',
                        min_count: min_count,
                        min_amount: min_amount, 
                        type: item.type || 1,
                        defaultImg: defaultImg,
                    })
                    this.props.form.setFieldsValue({
                        name: name,
                        min_count: min_count,
                        min_amount: min_amount,
                        icon_url: list,
                        type: item.type || 1,
                        status: item.status === 1 ? true : false
                    })
                }
            }) 
        }
    }
    onOk = () => {
        this.props.form.validateFields((error, values) => { 
            console.log(values)
            if (!error) {
                const { item } = this.props
                let list = ''
                values.icon_url && values.icon_url.length>0 && values.icon_url.forEach(item=>{
                    if(item.response){
                        list = item.response.key
                    }else{
                        list = item.urlText
                    }
                })
                this.props.dispatch({
                    type: 'vip_data/vipRankUpdate',
                    payload: {
                        id: item.id,
                        name: values.name || '',
                        min_count: values.min_count || '',
                        min_amount: values.min_amount&&values.min_amount*100 || '',
                        icon_url: list || '',
                        level: item.level&&(item.level + ''),
                        status: values.status === true ? 1 : 2,
                        type: values.type,
                    },
                    callback: () => {
                        message.success('修改成功，本次修改将于次日生效!')
                        this.props.dispatch({
                            type: 'vip_data/vipRankList',
                            payload: {},
                        })
                        this.props.onChange(false)
                    }
                })
            }
        })
    }
    onCancel = () => { 
        this.props.onChange(false)
    }
    handleChange = ({ fileList }) => {
        this.setState({ fileList })
    }
    handleCancel = () => this.setState({ previewVisible: false })
    handlePreview = (file) => {
        const  photoPrefix  = imgDomain
        if(file.url){
            this.setState({
                previewImage: file.url,
                previewVisible: true,
            })
        }else{
            this.setState({
                previewImage: `//${photoPrefix}/${file.response.key}`,
                previewVisible: true,
            })
        }
    }
    normFileImg = (e)=> {
        if(e.fileList && e.fileList.status!=='removed'){
            return e.fileList
        }
    }
    changeMinCount = (e) => {
        let val = e.target.value
        this.setState({
            min_count: val,
        })
        this.props.form.setFieldsValue({
            min_count: val,
        })
        this.props.form.validateFields(['type'], {force: true})
    }
    changeMinAmount = (e) => {
        let val = e.target.value
        this.setState({
            min_amount: val,
        })
        this.props.form.setFieldsValue({
            min_amount: val,
        })
        this.props.form.validateFields(['type'], {force: true})
    }
    validatorCondit = (rule, value, callback) => {
        if (this.timer) {
            clearTimeout(this.timer)
        }
        this.timer = setTimeout(() => { 
            const { min_count, min_amount, type } = this.state
            console.log(min_count, min_amount, type)
            const pattern1 = /^([1-9]\d*)$/g
            const pattern2 = /^([1-9]\d*)$|^(\d+\.(\d){1,2})$/g
            const validate_a = min_count&&!pattern1.test(min_count)
            const validate_b = min_amount&&!pattern2.test(min_amount)
            console.log(validate_a, validate_b)
            if(type === 1){   
                if(validate_b){
                    callback('请输入正确的购物金额，最多两位小数')
                }
                if(!min_amount) {
                    callback('请输入会员条件')
                }
            }else if(type === 2){
                if(validate_a){
                    callback('请输入正确的购物次数')
                }
                if(!min_count) {
                    callback('请输入会员条件')
                }
            }else if(type === 3 || type === 4){
                if(validate_a){
                    callback('请输入正确的购物次数')
                }
                if (validate_b) { 
                    callback('请输入正确的购物金额，最多两位小数')
                }
                if(!min_count && min_amount) {
                    callback('请输入购物次数')
                }
                if(min_count && !min_amount) {
                    callback('请输入购物金额，最多两位小数')
                }
                if(!min_count || !min_amount) {
                    callback('请输入会员条件')
                }
            }
            callback()
        },20)
    }
    onChangeRadio = (e)=>{
        let val = e.target.value
        this.setState({
            type: val,
            min_count: '',
            min_amount: '',
        },()=>{
            this.props.form.setFieldsValue({
                min_count: '',
                min_amount: '',
            }) 
        })
    }
    onChangeType = (e)=>{
        const { current } = this.state
        let val = e.target.value
        let isDefault = val===1 ? true : false
        let icon_url = ''
        if(isDefault){
            icon_url = `retail/web/vip_level/icon/v_${current.level}.svg`
        }else{
            icon_url = ''
        }
        let list = []
        icon_url&&list.push({
            uid: 1,
            status: 'done',
            urlText: icon_url,
            url: icon_url?`//${imgDomain}/${icon_url}`:'',
        })
        this.setState({
            defaultImg: isDefault,
            fileList: list,
        },()=>{
            this.props.form.setFieldsValue({
                icon_url: list,
            }) 
        })
    }
    render () {
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
        const { photoToken } = this.props.vip_data
        const  uploadProps = {
            name: 'file',
            accept:'image/*',
            action: '//upload.qiniup.com/',
            headers: {
                authorization: 'authorization-text',
            },
            data: {
                token: photoToken,
            },
            beforeUpload: (file, fileList)=>{
                this.setState({
                    isUpload: true
                })
                console.log(file.type)
                const isJPG = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/svg+xml'
                if (!isJPG) {
                    message.error('仅支持.jpg/jpeg/png/svg文件格式!')
                    fileList.pop()
                    this.setState({
                        isUpload: false
                    })
                }
                const isLt1M = file.size / 1024 / 1024 < 2
                if (!isLt1M) {
                    message.error('大小限制2MB!')
                    fileList.pop()
                    this.setState({
                        isUpload: false
                    }) 
                }
                return isJPG && isLt1M
            },
        }
        const uploadButton = (
            <div>
                <Icon type={'plus'} style={{fontSize: 24}} />
                <div className="ant-upload-text">上传图片</div>
            </div>
        )
        const { imageNum, fileList, type, min_count, min_amount, defaultImg } = this.state
        return (
            <Fragment>
                <Modal
                    title="编辑"
                    visible={this.props.visible}
                    onOk={this.onOk}
                    onCancel={this.onCancel}
                    width={580}
                >
                    <Spin spinning={this.state.loading}>
                        <Form>
                            <FormItem label="会员名称" {...formItemLayout}>
                                {getFieldDecorator('name',{
                                    rules: [
                                        { required: true, message: '请输入会员名称' },
                                        { max: 7, message: '最多7个字' }
                                    ],
                                })(
                                    <HzInput placeholder="输入会员名称，最多7个字" maxLength={7} />
                                )}
                            </FormItem>
                            <FormItem label="会员条件" {...formItemLayout} required={true}>
                                {getFieldDecorator('type',{
                                    rules: [
                                        { validator: this.validatorCondit }
                                    ],
                                })(
                                    <RadioGroup onChange={this.onChangeRadio}>
                                        <Radio className={styles.radioStyle} value={1}>
                                            <div style={{display: 'inline-block'}}>
                                                <span>购物金额≥</span> 
                                                <Input className={styles.inputStyle} value={type === 1 ? min_amount : '' } disabled={type !== 1}  onChange={this.changeMinAmount} />
                                                <span>元</span>
                                            </div>
                                        </Radio>
                                        <Radio className={styles.radioStyle} value={2}>
                                            <div style={{display: 'inline-block'}}>
                                                <span>购物次数≥</span> 
                                                <Input className={styles.inputStyle} value={type === 2 ? min_count : '' }  disabled={type !== 2}  onChange={this.changeMinCount} />
                                                <span>次</span>
                                            </div>
                                        </Radio>
                                        <Radio className={styles.radioStyle} value={3}>
                                            <div style={{display: 'inline-block'}}>
                                                <span>购物次数≥</span> 
                                                <Input className={styles.inputStyle} value={type === 3 ? min_count : '' }  disabled={type !== 3} onChange={this.changeMinCount}  />
                                                <span>次或购物金额≥</span>
                                                <Input className={styles.inputStyle} value={type === 3 ? min_amount : '' } disabled={type !== 3}  onChange={this.changeMinAmount} />
                                                <span>元</span>
                                            </div>
                                        </Radio>
                                        <Radio className={styles.radioStyle} style={{marginBottom: 0}} value={4}>
                                            <div style={{display: 'inline-block'}}>
                                                <span>购物次数≥</span> 
                                                <Input className={styles.inputStyle} value={type === 4 ? min_count : '' } disabled={type !== 4}  onChange={this.changeMinCount} />
                                                <span>次且购物金额≥</span>
                                                <Input className={styles.inputStyle} value={type === 4 ? min_amount : '' } disabled={type !== 4}  onChange={this.changeMinAmount} />
                                                <span>元</span>
                                            </div>
                                        </Radio>
                                    </RadioGroup>
                                )}
                                <FormItem style={{display: 'none'}}>{getFieldDecorator('min_count')(<Input />)}</FormItem>
                                <FormItem style={{display: 'none'}}>{getFieldDecorator('min_amount')(<Input/>)}</FormItem>
                            </FormItem>
                            <FormItem
                                label="会员图标"
                                {...formItemLayout}
                                extra={(<span style={{ fontSize: 12 }}>{defaultImg===true ? '如不更换图片，则会员图标将显示默认图片': '最多上传1张，图片大小请控制在2MB以内，支持扩展名：.png .jpeg .jpg .svg'}</span>)}
                                className={styles.uploadClass}
                            >
                                <RadioGroup onChange={this.onChangeType} value={defaultImg === true ? 1 : 2}>
                                    <Radio value={1}>默认图片</Radio>
                                    <Radio value={2}>自定义图片</Radio>
                                </RadioGroup>
                                <div>
                                    {getFieldDecorator('icon_url',{
                                        getValueFromEvent: this.normFileImg,
                                    })(
                                        <Upload
                                                {...uploadProps}
                                                listType="picture-card"
                                                className={defaultImg===true ? styles.deleteHidden : ''}
                                                fileList={fileList}
                                                onChange={this.handleChange}
                                                onPreview={this.handlePreview}
                                            >
                                                {
                                                    fileList.length >= imageNum ? null : uploadButton
                                                }
                                        </Upload>
                                    )}
                                </div>
                            </FormItem>
                            <FormItem label="是否启用" {...formItemLayout}>
                                {getFieldDecorator('status',{
                                    valuePropName: 'checked'
                                })(
                                    <Switch checkedChildren="启用" unCheckedChildren="关闭" />
                                )}
                            </FormItem>
                        </Form>
                    </Spin>
                </Modal>
                <Modal visible={this.state.previewVisible} footer={null} onCancel={this.handleCancel} wrapClassName={styles.modalCon}>
                    <img alt="example" style={{ width: '100%' }} src={this.state.previewImage} />
                </Modal>
            </Fragment>
        )
    }
}
