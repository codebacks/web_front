import { Component, Fragment } from 'react'
import {connect} from 'dva'
import { Modal, Input, Button, Form, Upload, message } from 'antd'
import styles from './index.less'
const FormItem = Form.Item

@connect(({ base, goods_management}) => ({
    base,
    goods_management,
}))
@Form.create()
export default class AddModal extends Component {
    state = {
        isUpload: false,
        imgUrl: '',
        fileList: [],
    }
    componentDidMount(){
        const { selectItem } = this.props.state
        const { photoPrefix } = this.props.goods_management 
        if(selectItem){        
            this.props.form.setFieldsValue({
                name: selectItem.name,
                icon_url: selectItem.icon_url,
            })
            this.setState({
                imgUrl: `//${photoPrefix}/${selectItem.icon_url}`
            })
        } 
    }
    onCancel = ()=> {
        this.props.onClose()
    }
    onOk = ()=> {
        //保存类目
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const { selectItem } = this.props.state
                let changedItem = {
                    ...selectItem,
                    ...values
                }
                this.props.onClose(changedItem)
            }
        })
    }
    handleChange = (info) => {
        const { photoPrefix } = this.props.goods_management
        const Protocol = window.location.protocol
        if(info.file.status === 'done'){
            this.setState({
                imgUrl: `${Protocol}//${photoPrefix}/${info.file.response.key}`
            })
        }
    }
    normFileImage = (e)=> {
        if(e.fileList){
            const temp = e.fileList[e.fileList.length - 1]
            return temp.response && temp.response.key
        }
    }
    render(){
        const { imgUrl } = this.state
        const { visible } = this.props.state
        const { getFieldDecorator } = this.props.form
        const { photoToken } = this.props.goods_management
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
            <Modal
                title='编辑类目'
                visible={visible}
                onCancel={this.onCancel}
                width={600} 
                footer={
                    <div>
                        <Button onClick={this.onCancel}>取消</Button>
                        <Button type='primary' onClick={this.onOk}>保存</Button>
                    </div>
                }
            >
                <Form>
                    <FormItem label="类目名称" required= {true} {...formItemLayout}>
                        {getFieldDecorator('name',{
                            rules: [{ required: true, message: '请输入类目名称' }],
                        })(
                            <Input  className={styles.modalItem}/>
                        )}
                    </FormItem>   
                    <FormItem label="类目图片" required= {true} {...formItemLayout}
                        extra={(<div className={styles.font12}> 图片请控制在1MB以内，支持jpg、jpeg、png格式的图片</div>)}
                    >
                        {getFieldDecorator('icon_url',{
                            getValueFromEvent: this.normFileImage,
                            rules: [{ required: true, message: '请上传类目图片' }],
                        })(
                            <Upload
                                showUploadList={false}
                                {...uploadProps}
                                onChange={this.handleChange}
                            >
                                {
                                    imgUrl.length > 0 &&
                                        (
                                            <Fragment>
                                                <img src={imgUrl} alt="avatar"  className={styles.uploadImage}/>
                                                <div className={styles.iconWarp}>
                                                    <div className={styles.addIcon}>
                                                        <img src={require(`mall/assets/images/edite.svg`)} alt="" />
                                                        <div style={{minWidth: 80}}>编辑图片</div>
                                                    </div>
                                                </div>
                                            </Fragment>
                                        )
                                }
                            </Upload>
                        )}
                    </FormItem>   
                </Form>
            </Modal>
        )
    }
}