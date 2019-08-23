import { Component } from 'react'
import {connect} from 'dva'
import router from 'umi/router'
import Page from 'components/business/Page'
import documentTitleDecorator from 'hoc/documentTitle'
import DocumentTitle from 'react-document-title'
import { Form, Input, Button, Upload, Icon, Modal, message  } from 'antd'
import styles from './index.less'
import EditorCon from 'components/EditorCon'
const { TextArea } = Input

@connect(({base, trends_management}) => ({
    base,
    trends_management,
}))
@documentTitleDecorator()
@Form.create()
export default class Index extends Component {
    state = {
        title: '发布长动态',
        fileList: [],
        textArea: 0,
        imageNum: 1,
        previewVisible: false,
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
        const { id } = this.props.location.query
        if(id){
            this.setState({title:'编辑长动态',})
            this.props.dispatch({
                type: 'trends_management/getTrendDetail',
                payload:{
                    id: id
                },
                callback: (data)=>{
                    // console.log(data)
                    const { photoPrefix } = this.props.trends_management
                    let list = []
                    list.push({
                        uid: 1,
                        status: 'done',
                        urlText: data.cover_url,
                        url: data.cover_url?`//${photoPrefix}/${data.cover_url}`:'',
                    })

                    this.props.form.setFieldsValue({
                        title: data.title,
                        description: data.description,
                        cover_url: list,
                        content: data.content,
                    })
                    // 存在值才设置，处理显示为破图的问题
                    this.setState({
                        fileList: data.cover_url?list:'',
                        textArea: data.content,
                    })
                    // console.log(this.textRefs)
                    this.textRefs.onChange(data.content)
                }
            })
        }
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
    changeQuill = (html)=> {
        let str
        // 当输入内容为空的时候
        const temp = html.replace(/<[^>]*>|/g, "")
        //当去除标签后为空或者不包含img标签的时候
        if(temp === '' && html.indexOf('<img')===-1){
            str = ''
        }else{
            str = html
        }
        // console.log(html)
        this.props.form.setFieldsValue({
            content: str,
        })
    }
    saveLongTrend = ()=> {
        this.props.form.validateFields((err, values) => {
            // console.log(values)
            if (!err) {
                this.setState({
                    loading: true
                })
                let list = ''
                values.cover_url && values.cover_url.length>0 && values.cover_url.forEach(item=>{
                    if(item.response){
                        list = item.response.key
                    }else{
                        list = item.urlText
                    }
                })
                const { id } = this.props.location.query
                if(id){
                    this.props.dispatch({
                        type: 'trends_management/updateTrend',
                        payload: {
                            content: values.content || '',
                            cover_url: list,
                            description: values.description || '',
                            title: values.title || '',
                            type: 2,
                            id: id,
                        },
                        callback: (data) => {
                            this.setState({
                                loading: false
                            })
                            //如果保存成功则跳转
                            router.push('/mall/trends_management')
                        }
                    })
                }else{
                    this.props.dispatch({
                        type: 'trends_management/addLongTrend',
                        payload: {
                            content: values.content || '',
                            cover_url: list,
                            description: values.description || '',
                            title: values.title || '',
                            type: 2,
                        },
                        callback: (data) => {
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
    textAreaChange = (e) => {
        this.setState({
            textArea: e.target.value
        })
    }
    render(){
        const { previewVisible, previewImage, title, fileList, imageNum, loading } = this.state
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
        const { photoToken, photoPrefix } = this.props.trends_management
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
                            name:  title
                        }]}
                    /> 
                    <Form style={{marginTop: 16}}>
                        <Form.Item label="标题" {...formItemLayout}>
                            {getFieldDecorator("title",{
                                rules: [{ required: true, message: '请填写标题' }],
                            })(
                                <Input/>
                            )}
                        </Form.Item>  
                        <Form.Item label="简述" {...formItemLayout}>
                            {getFieldDecorator("description", {})(
                                <TextArea rows={6} onChange={this.textAreaChange}></TextArea>
                            )}
                        </Form.Item>  
                        <Form.Item label="配图" {...formItemLayout} className={styles.uploadClass}>
                            {getFieldDecorator("cover_url",{
                                getValueFromEvent: this.normFileImg,
                            })(
                                <Upload
                                    {...uploadProps}
                                    listType="picture-card"
                                    fileList={fileList}
                                    onChange={this.handleChange}
                                    onPreview={this.handlePreview}
                                >
                                    {
                                        fileList.length >= imageNum ? null : uploadButton
                                    }
                                </Upload>
                            )}
                        </Form.Item>
                        <Form.Item label="内容" {...formItemLayout}>
                            {getFieldDecorator("content",{
                                rules: [{ required: true, message: '请添加内容' }],
                            })(
                                <EditorCon 
                                    ref={node => this.textRefs = node} 
                                    changeQuill={this.changeQuill} 
                                    placeholder='输入内容...'
                                    photoToken={photoToken}
                                    photoPrefix={photoPrefix}
                                ></EditorCon>
                            )}
                        </Form.Item> 
                        <Form.Item  {...formItemLayout}>
                            <Button type="primary" onClick={this.saveLongTrend} style={{ marginLeft: 80 }} loading={loading}>保存</Button>
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