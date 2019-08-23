import React, { Fragment } from 'react'
import { connect } from 'dva'
import { Button, Form, Input, Icon, message, Upload ,Modal} from 'antd'
import DocumentTitle from 'react-document-title'
import router from 'umi/router'
import styles  from './index.less'

const formItemLayout = {
    labelCol: {
        span: 6,
        style: {
            // width: '90px',
            textAlign: 'right',
        }
    },
    wrapperCol: {
        span: 18,
    }
}
@connect(({shop_fitment}) => ({
    shop_fitment
}))
export default class UploadContainer extends React.Component {
    state = {
        fileList: [],
        showUploadIcon: true,
        previewVisible: false,
        previewImage: ''
    }
    componentDidMount(){
        this.props.dispatch({
            type:'shop_fitment/getToken',
            payload: {
                type: 'image',
            }
        })
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.fileList[0]) {
            return {
                fileList: nextProps.fileList,
                showUploadIcon: nextProps.fileList && nextProps.fileList.length === 0
            }
        }
        return null
    }
    componentDidUpdate(prevProps){
        if(this.props.fileList[0] !== prevProps.fileList[0]){
            this.setState({
                fileList: this.props.fileList,
                showUploadIcon: this.props.fileList && this.props.fileList.length === 0,
            })
        }

        if(JSON.stringify(this.props.data[0])  !== JSON.stringify(prevProps.data[0])){
            this.props.form.setFieldsValue({
                path:this.props.data[0] && this.props.data[0].img_path
            })
            this.props.form.validateFields(['path'], { force: true })
        }
    }
    handleCancel = () => {
        this.setState({
            previewVisible: false,
            previewImage: ''
        })
    }
    setShowUploadIcon = (status) => {
        setTimeout(_ => {
            this.setState({
                showUploadIcon: status
            })
        }, 400)
    }
    handlePreview = (fileList) => {
        if (fileList && fileList[0]) {
            this.setState({
                previewVisible: true,
                previewImage: fileList[0].url
            })
        }

    }
    beforeUpload = (file, fileList) => {
        const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
        if (!isJPG) {
            message.error('只能上传jpg、jpeg和png格式的图片！')
        }
        const isLt2M = file.size / 1024 / 1024 <= 1
        if (!isLt2M) {
            message.error('图片大小不能超过1MB！')
        }
        const maxPic = this.state.fileList.length + fileList.length <= 1
        if (!maxPic) {
            message.error('最多只能上传1张图片！')
        }
        return isJPG && isLt2M && maxPic
    }
    fileList = []
    handleChange = (info) => {

        const { fileList } = info
        const photoPrefix = this.props.shop_fitment.photoPrefix

        if (info.file.status === 'uploading') {
            this.setState({ fileList }, () => {
                this.setShowUploadIcon(fileList.length === 0)
            })
        }

        if (info.file.status === 'done') {
            fileList.map((file) => {
                if (file.response) {
                    file.url = `https://${photoPrefix}/${file.response.key}`
                    file.key = file.response.key
                }
                return file
            })
            this.props.getFile && this.props.getFile(fileList)
            this.fileList = fileList
            this.props.form.validateFields(['path'], { force: true })
            this.setState({ fileList }, () => {
                this.setShowUploadIcon(fileList.length === 0)
            })
        }
    }
    handleRemove = (file) => {
        const { fileList } = this.state
        for (let [i, v] of fileList.entries()) {
            if (v.uid === file.uid) {
                fileList.splice(i, 1)
                this.props.getFile && this.props.getFile(fileList)
                this.fileList = fileList
                this.setState({ fileList, showUploadIcon: fileList.length === 0 }, () => {
                    this.props.form.validateFields(['path'], { force: true })
                })
                return
            }
        }
    }
    validatorByImg = (rule, value, callback) =>{
        if(value){
            this.props.getFile(value)
        }
        if(value && (this.fileList.length > 0 || this.props.fileList.length > 0)){
            callback('网络图片与上传的图片不能同时存在，请删除其中一个')
            return
        }else{
            this.props.getFile(value)
            callback()
        }
    }
    render() {
        const fileList = this.state.fileList
        const photoToken = this.props.shop_fitment.photoToken
        const { data } = this.props
        const uploadProps = {
            name: 'file',
            action: '//upload.qiniup.com/',
            accept: ".jpg,.jpeg,.png",
            headers: {},
            data: {
                token: photoToken,
            },
            listType: "picture-card",
            multiple: true,
            onPreview: () => this.handlePreview(fileList),
            beforeUpload: this.beforeUpload,
            onChange: this.handleChange,
            onRemove: this.handleRemove,
            fileList: fileList,
            className: "avatar-uploader"
        }
        const { getFieldDecorator } = this.props.form
        return <Fragment>
            <Form.Item label="添加图片：" {...formItemLayout}
                extra={<div style={{ fontSize: 12 }}>最多上传1张，图片大小请控制在1MB以内，支持png、jpeg、jpg格式</div>}
            >
                <Upload {...uploadProps}>
                    {
                        this.state.showUploadIcon ? <div>
                            <Icon type='plus' style={{ fontSize: 32, color: '#9EA8B1' }} />
                            <div className="ant-upload-text">上传图片</div>
                        </div> : null
                    }
                </Upload>
                <Modal visible={this.state.previewVisible}  footer={null} onCancel={this.handleCancel}>
                    <img src={this.state.previewImage} style={{ width: '100%',marginTop:'14px'}} alt=""/>
                </Modal>
            </Form.Item>
            <Form.Item label="图片链接：" {...formItemLayout}>
                {
                    getFieldDecorator('path',{
                        initialValue:data[0] && data[0].img_path,
                        validateTrigger: 'onBlur',
                        validateFirst: true,
                        rules:[
                            { pattern: /^http(s)?:\/\/.+/, message: '请以https://或http://开头的图片地址' },
                            { validator: this.validatorByImg }
                        ]
                    })(<Input placeholder='网络的图片路径' />)
                }
                
            </Form.Item>
            
            <div className={styles.spin_text}>若链接图片在小程序端无法显示，请将链接图片保存到本地后上传</div>
        </Fragment> 
    }
}

