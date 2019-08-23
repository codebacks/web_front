import { Component, Fragment } from 'react'
import {connect} from 'dva'
import { Modal, Input, Button, Form, Upload, Icon, message } from 'antd'
import styles from './index.less'
const FormItem = Form.Item

@connect(({ base, category_management}) => ({
    base,
    category_management,
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
        // console.log(selectItem)
        const { photoPrefix } = this.props.category_management 
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
            // console.log(values)
            if (!err) {
                const { type, currentItem, selectItem } = this.props.state
                // console.log(type)
                // console.log(currentItem)
                // console.log(selectItem)
                //如果是修改
                if(selectItem){
                    if(selectItem.parent_id === 0 || selectItem.parent_id === null){
                        this.props.dispatch({
                            type: 'category_management/updateCategory',
                            payload: {
                                icon_url: values.icon_url,
                                name: values.name,
                                parent_id: 0,
                                id: selectItem.id,
                            },
                            callback: (data)=> {
                                //如果保存成功则跳转
                                this.props.onClose()
                                //刷新类目列表
                                this.props.dispatch({
                                    type: 'category_management/getCategory',
                                    payload: {}
                                })
                            }
                        })  
                    }else{
                        this.props.dispatch({
                            type: 'category_management/updateCategory',
                            payload: {
                                icon_url: values.icon_url,
                                name: values.name,
                                parent_id: selectItem.parent_id,
                                id: selectItem.id,
                            },
                            callback: (data)=> {
                                //如果保存成功则跳转
                                this.props.onClose()
                                //刷新类目列表
                                this.props.dispatch({
                                    type: 'category_management/getCategory',
                                    payload: {}
                                })
                            }
                        })
                    }
                }else{
                    if(type === 'one'){
                        this.props.dispatch({
                            type: 'category_management/addCategory',
                            payload: {
                                icon_url: values.icon_url,
                                name: values.name,
                                parent_id: 0,
                            },
                            callback: (data)=> {
                                //如果保存成功则跳转
                                this.props.onClose()
                                //刷新类目列表
                                this.props.dispatch({
                                    type: 'category_management/getCategory',
                                    payload: {}
                                })
                            }
                        })
                    }else{
                        this.props.dispatch({
                            type: 'category_management/addCategory',
                            payload: {
                                icon_url: values.icon_url,
                                name: values.name,
                                parent_id: currentItem.id,
                            },
                            callback: (data)=> {
                                //如果保存成功则跳转
                                this.props.onClose()
                                //刷新类目列表
                                this.props.dispatch({
                                    type: 'category_management/getCategory',
                                    payload: {}
                                })
                            }
                        })
                    } 
                }
            }
        })
    }
    handleChange = (info) => {
        const { photoPrefix } = this.props.category_management
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
        // console.log(this.props.state)
        const { imgUrl } = this.state
        const { visible, title } = this.props.state
        const { getFieldDecorator } = this.props.form
        const { photoToken } = this.props.category_management
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
                title={title}
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
                                    imgUrl.length > 0?
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
                                        :(
                                            <div className={styles.iconWarp}>
                                                <div className={styles.addIcon}>
                                                    <Icon type={'plus'}  style={{fontSize: 24}}/>
                                                    <div style={{minWidth: 80}}>上传图片</div>
                                                </div>
                                            </div>
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