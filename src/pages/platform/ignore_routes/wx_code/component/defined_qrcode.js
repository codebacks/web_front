import React ,{Component} from 'react'
import { Form, Upload, Icon,Modal, message ,InputNumber} from 'antd'
import styles from "../index.scss"
import HzInput from '@/components/HzInput'
import {connect} from 'dva'
import { parse } from 'qs'

@Form.create()
@connect(({platform_create,base}) =>({
    platform_create,
    base
}))
export default class QRcode extends Component {
    constructor(props) {
        super(props)
        this.state = {
            hostname:'//image.51zan.com',
            uploadloading:false,
            imageUrl:'',
            token:'',
            id:'',
        }
    }
    componentDidMount() {}
    componentDidUpdate(prevProps, prevState){
        const {definedWxFormInfo,visible_definde} = this.props
        if(visible_definde && !prevProps.visible_definde && Object.keys(definedWxFormInfo).length){
            const {displayNum,name,authImagePath} = definedWxFormInfo
            this.setState({
                imageUrl:this.state.hostname+'/'+authImagePath,
                id:definedWxFormInfo.id ? definedWxFormInfo.id : ''
            })
            this.props.form.setFieldsValue({
                authImagePath:authImagePath || '',
                name:name || '',
                displayNum:displayNum === -1 ?  '' : displayNum
            })
        }
    }
    handleOk = (e) => {
        const {id} = this.state
        e.preventDefault()
        this.props.form.validateFields((err,values) =>{
            if(!err){
                let definedWxForm = {} , id_object = {},form = {}
                if(!parse(values).displayNum && parse(values).displayNum !== 0){
                    form = {
                        displayNum:-1
                    }
                }
                if(id){
                    id_object = {id:id}
                }else{
                    id_object = {}
                }
                let empty = {
                    account:'',
                    remark:'',
                    depts:[],
                    uin:'',
                }
                definedWxForm = {
                    ...parse(values),
                    ...form,
                    ...id_object,
                    ...empty
                }   
                this.setState({
                    imageUrl:''
                }) 
                this.props.onOk && this.props.onOk(definedWxForm)
            }
        })
        
        
    }
    handleCancle = () => {
        this.props.form.resetFields()
        this.setState({
            imageUrl:''
        })
        const { onClose } = this.props
        onClose && onClose()
    }
    handleUploadChange = (info) =>{
        if (info.file.status === 'done'){
            this.setState({
                imageUrl:this.state.hostname+`/${info.file.response.key}`,
                uploadloading: false,
            },()=>{
                this.props.form.validateFields(['qrcodeImg'], { force: true })
            })
        }
        
    }
    // 输入1~9整数
    formatterInt = (value) => {
        const reg = /[^\d]/g
        if (typeof value === 'string' && (Number(value) >= 0 && Number(value) <= 99999999)) {
            return !isNaN(Number(value)) ? value.replace(reg, '') : ''
        } else if ((typeof value === 'number') && (value >= 0 && value <= 99999999)) {
            return !isNaN(value) ? String(value).replace(reg, '') : ''
        } else {
            return ''
        }
    }
    render() {
        const FormItem = Form.Item
        const { getFieldDecorator } = this.props.form
        const {visible_definde} = this.props
        const {imageUrl} = this.state
        const formItemLayout = {
            labelCol: {
                span: 6,
                style: { width: '100px' }
            },
            wrapperCol: {
                span: 18
            }
        }
        const  uploadProps = {
            name: 'file',
            accept:'image/*',
            action: '//upload.qiniup.com/',
            data: {
                token: this.state.token,
            },
            showUploadList:false,
            onChange:this.handleUploadChange,
            disabled:this.props.platform_create.loading,
            beforeUpload: (file, fileList)=>{
                this.setState({
                    uploadloading: true
                })
                const isJPG = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg'
                if (!isJPG) {
                    message.error('支持扩展名：.png/.jpeg/.jpg!')
                    fileList.pop()
                    this.setState({
                        uploadloading: false
                    })
                    return false
                }
                
                const isLt1M = file.size / 1024 / 1024 < 1
                if (!isLt1M) {
                    message.error('大小限制1MB!')
                    fileList.pop()
                    this.setState({
                        uploadloading: false
                    }) 
                    return false
                }
                
                var that = this
                return new Promise((resolve,reject) =>{
                    that.props.dispatch({
                        type:'platform_create/uploadBg',
                        payload:{
                            type:'image'
                        },
                        callback:(data,meta) =>{
                            that.setState({
                                token:that.props.platform_create.token
                            },() => {
                                if(data && meta.code === 200){
                                    resolve()
                                }else {
                                    reject()
                                }
                            })
                        }
                    })
                })
                // return isJPG && isLt1M
            },
        }
        const uploadButton = (
            <div className={styles.qrcode_uploadWrap_text}>
                <Icon className={styles.uploadIcon} type={this.state.uploadloading ? 'loading' : 'plus'} />
                <div className={styles.uploadText}>上传图片</div>
            </div>
        )
        return (
            <Modal 
                title="添加二维码"
                visible={visible_definde}
                width={520}
                onCancel={this.handleCancle}
                onOk={this.handleOk}
                maskClosable={false}
                destroyOnClose
            >
                <Form className="hz-from-edit hz-from-label-right">
                    <FormItem label="上传二维码" 
                        {...formItemLayout} 
                        extra={(<div className={styles.uploadTip}>图片大小请控制在1MB以内，支持扩展名：.png/.jpeg/.jpg</div>)}
                    >
                        {getFieldDecorator('authImagePath', {
                            rules: [{ required: true, message: '请上传二维码' }]
                        })(
                            <Upload
                                listType="picture-card"
                                {...uploadProps}
                            >
                                {imageUrl ? <div className={styles.qrcode_uploadWrap}>
                                    <img src={imageUrl}  alt="二维码" className={styles.qrcode_Img} />
                                </div>
                                    : uploadButton
                                }
                            </Upload>
                        )}
                    </FormItem>
                    <FormItem label="二维码名称" {...formItemLayout}>
                        {getFieldDecorator('name', {
                            rules: [
                                { required: true, message: '请输入二维码名称' },
                                { pattern: /^[a-zA-Z0-9\u4E00-\u9FA5\uF900-\uFA2D]{1,12}$/, message: '中文、英文、数字, 1-12'},
                            ]
                        })(
                            <HzInput placeholder="请输入二维码名称" maxLength={12}/>
                        )}
                    </FormItem>
                    <FormItem label="展示次数" {...formItemLayout}>
                        {getFieldDecorator('displayNum', {
                            rules: [
                                { required: false, message: '请输入展示次数' },
                            ]
                        })(
                            <InputNumber min={0} max={99999999} formatter={this.formatterInt} placeholder="请输入展示次数（不填则默认为不限）"  style={{width:'100%'}} maxLength={8}/>
                        )}
                    </FormItem>
                </Form>
            </Modal>
        )
    }
}
