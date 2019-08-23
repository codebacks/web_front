import { Component } from 'react'
import {connect} from 'dva'
import router from 'umi/router'
import Page from 'components/business/Page'
import documentTitleDecorator from 'hoc/documentTitle'
import DocumentTitle from 'react-document-title'
import { Form, Input, Button, Upload, Icon, message, Modal  } from 'antd'
import styles from './index.less'
const { TextArea } = Input

@connect(({base, trends_management}) => ({
    base,
    trends_management,
}))
@documentTitleDecorator()
@Form.create()
export default class Index extends Component {
    state ={
        title: '发布短动态',
        imageNum: 9,
        previewVisible: false,
        previewImage: '',
        fileList: [],
        textArea: 0,
        loading: false,
    }
    componentDidMount(){
        this.props.dispatch({
            type: 'trends_management/getToken',
            payload: {
                type: 'image',
            }
        })
        this.checkShow()
    }
    checkShow = ()=> {
        let { photoPrefix } = this.props.trends_management
        photoPrefix = photoPrefix || 'image.51zan.com'
        const { id } = this.props.location.query
        if(id){
            this.setState({title:'编辑短动态',})
            this.props.dispatch({
                type: 'trends_management/getTrendDetail',
                payload:{
                    id: id
                },
                callback: (data)=>{
                    // console.log(data)
                    let list = []
                    data.images.forEach(item=>{
                        list.push({
                            uid: item.id,
                            status: 'done',
                            urlText: item.img_url,
                            url: `//${photoPrefix}/${item.img_url}`,
                        })
                    })
                    this.props.form.setFieldsValue({
                        content: data.content,
                        feed_images: list
                    })
                    this.setState({
                        fileList: list ,
                        textArea: data.content,
                    })
                }
            })
        }
    }
    textAreaChange = (e)=>{
        this.setState({
            textArea: e.target.value
        })
    }
    handleChange = ({ fileList }) => {
        this.setState({ fileList })
    }
    handleCancel = () => this.setState({ previewVisible: false })
    handlePreview = (file) => {
        // console.log(file)
        const { photoPrefix } = this.props.trends_management
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
    saveShortTrend = ()=> {
        this.props.form.validateFields((err, values) => {
            // console.log(values)
            if (!err) {
                this.setState({
                    loading: true
                })
                let list = []
                // console.log(values.feed_images)
                values.feed_images.length>0 && values.feed_images.forEach(item=>{
                    if(item.response){
                        list.push(item.response.key)
                    }else{
                        list.push(item.urlText)
                    }
                })
                const { id } = this.props.location.query
                if(id){
                    this.props.dispatch({
                        type: 'trends_management/updateTrend',
                        payload: {
                            content: values.content,
                            feed_images: list,
                            type: 1,
                            id: id,
                        },
                        callback: (data)=> {
                            this.setState({
                                loading: false
                            })
                            //如果保存成功则跳转
                            router.push('/mall/trends_management')
                        }
                    })
                }else{
                    this.props.dispatch({
                        type: 'trends_management/addShortTrend',
                        payload: {
                            content: values.content,
                            feed_images: list,
                            type: 1
                        },
                        callback: (data)=> {
                            this.setState({
                                loading: false
                            })
                            //如果保存成功则跳转
                            router.push('/mall/trends_management')
                        }
                    })
                }
            }
        })
    }
    onHandlerCancel = ()=> {
        router.push('/mall/trends_management')
    }
    render(){
        const { previewVisible, previewImage, fileList, imageNum, title, textArea, loading } = this.state
        const { getFieldDecorator } = this.props.form
        const formItemLayout = {
            labelCol: {
                span: 6,
                style: {
                    width: '80px',
                    textAlign: 'right',
                },
            },
            wrapperCol: {
                span: 16,
            },
        }
        const { photoToken } = this.props.trends_management
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
        const uploadButton = (
            <div>
                <Icon type={'plus'} style={{fontSize: 24}} />
                <div className="ant-upload-text">上传图片</div>
            </div>
        )
        return (
            <DocumentTitle title={title}>
                <Page>
                    <Page.ContentHeader
                        hasGutter={false}
                        breadcrumbData={[{
                            name: '动态管理',
                            path: '/mall/trends_management'
                        },{
                            name: title
                        }]}
                    /> 
                    <Form style={{marginTop: 16}}>
                        <Form.Item label="内容" {...formItemLayout}
                            extra={(<div  style={{textAlign: 'right'}}>{textArea.length || 0}/140</div>)}
                        >
                            {getFieldDecorator("content",{
                                rules: [
                                    { required: true, message: '请填写内容' },
                                    { max: 140, message: '不能超过140个字符' },
                                ],
                            })(
                                <TextArea rows={6} onChange={this.textAreaChange}></TextArea>
                            )}
                        </Form.Item>  
                        <Form.Item label="配图" {...formItemLayout} className={styles.uploadClass}>
                            {getFieldDecorator("feed_images",{
                                getValueFromEvent: this.normFileImg,
                                rules: [{ required: true, message: '请上传配图' }],
                            })(
                                <Upload
                                    {...uploadProps}
                                    onChange={this.handleChange}
                                    listType="picture-card"
                                    fileList={fileList}
                                    onPreview={this.handlePreview}
                                >
                                    {
                                        fileList.length >= imageNum ? null : uploadButton
                                    }
                                </Upload>
                            )}
                        </Form.Item>  
                        <Form.Item  {...formItemLayout}>
                            <Button type="primary" onClick={this.saveShortTrend} style={{ marginLeft: 80 }} loading={loading}>保存</Button>
                            <Button onClick={this.onHandlerCancel} style={{marginLeft: 16}}>取消</Button>
                        </Form.Item> 
                        <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel} wrapClassName={styles.modalCon}>
                            <img alt="example" style={{ width: '100%' }} src={previewImage} />
                        </Modal> 
                    </Form>
                </Page>
            </DocumentTitle>
        )
    }
}