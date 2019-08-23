/*
* maxNum 最多上传图片个数
* maxSize 最大图片，单位M
* imgs 传入的图片，数组
* types 图片类型，数组
* defaultStyle 是否使用默认样式
* 
* onChange，改变的时候，更新，数组
* beforeUpload, 自定义上传验证
*/

//  实例页面 /demo/components/ImgUpload


// 示例1
//<ImgUpload/>

// 示例2
//<ImgUpload defaultStyle={false}>自定义内容</ImgUpload>

// 示例3
// <ImgUpload
//     maxNum={5}
//     maxSize={1}
//     imgs={['2018/11/02/FvYGJ0Q9rN-qYOo45lqCOaR9bV1h.jpg', '2018/11/21/Fn5nvKhWT7XBuUzu75ZLRespqP3C.jpg']}
//     types=['jpg','png','gif']
//     onChange={this.onChange}
//     beforeUpload={this.beforeUpload}
// />

// 示例4
// 编辑场景
// <ImgUpload
//     maxNum={5}
//     imgs={['2018/11/02/FvYGJ0Q9rN-qYOo45lqCOaR9bV1h.jpg', '2018/11/21/Fn5nvKhWT7XBuUzu75ZLRespqP3C.jpg']}
// />



import { Component, Fragment } from "react"
import { connect } from 'dva'
import PropTypes from 'prop-types'
import { Modal, Icon, Form, Upload, message } from 'antd'


@connect(({base, image_uplad}) => ({
    base,
    image_uplad,
}))
@Form.create()
export default class Index extends Component {
    static defaultProps = {
        defaultStyle: true
    }
    static propTypes = {
        defaultStyle: PropTypes.bool,
        maxNum: PropTypes.number,
        maxSize: PropTypes.number,
        imgs: PropTypes.array,
        onChange: PropTypes.func,
        beforeUpload: PropTypes.func,
    }
    state = {
        fileList: [],
        visible: false,
        preImage: '',
        hostName: 'image.51zan.com',
        token: '',
    }
    componentDidMount () {
        const { imgs } = this.props
        const { hostName } = this.state
        if (imgs && imgs.length > 0) {
            let list = []
            imgs.forEach((item, index) => {
                list.push({
                    uid: index,
                    status: 'done',
                    urlText: item,
                    url: `//${hostName}/${item}`,
                })
            })
            this.props.form.setFieldsValue({
                url: list
            })
            this.setState({
                fileList: list,
            })
        }
        this.qiniuAuth()
    }
    // 获取授权token
    qiniuAuth = () => { 
        this.props.dispatch({
            type: 'image_uplad/getToken',
            payload: {
                type: 'image',
            },
            callback:(data) => {
                this.setState({
                    token: data.data.token,
                })
            }
        })
    }
    onChange = ({ fileList }) => {
        this.setState({ fileList }, () => {
            let data = []
            const { fileList } = this.state
            fileList.forEach(item => {
                if (item.response) {
                    data.push(item.response.key)
                } else {
                    data.push(item.urlText)
                }
            })
            this.props.onChange && this.props.onChange(data)
        })
    }
    normFile = (e) => {
        if (e.fileList && e.fileList.status !== 'removed') {
            return e.fileList
        }
    }
    onPreview = (file) => {
        const { hostName }  = this.state
        if(file.url){
            this.setState({
                preImage: file.url,
                visible: true,
            })
        }else{
            this.setState({
                preImage: `//${hostName}/${file.response.key}`,
                visible: true,
            })
        }
    }
    onCancel = () => this.setState({ 
        visible: false,
    })
    render () { 
        const { fileList, visible, preImage } = this.state
        // 默认值，
        const  maxNum  = this.props.maxNum || 1 
        const  maxSize  = this.props.maxSize || 2
        const types = this.props.types || ['jpg', 'jpeg', 'gif', 'png']
        const defaultStyle = this.props.defaultStyle
        const { getFieldDecorator } = this.props.form
        const uploadButton = (
            <div>
                <Icon type={'plus'} style={{fontSize: 24}} />
                <div className="ant-upload-text">上传图片</div>
            </div>
        ) 
        const uploadProps = {
            name: 'file',
            accept:'image/*',
            action: '//up.qbox.me/',
            headers: {
                authorization: 'authorization-text',
            },
            data: {
                token: '',
            },
            beforeUpload: async (file, fileList) => {
                const { beforeUpload } = this.props
                if (beforeUpload) {
                    let res
                    res = await beforeUpload(file, fileList)
                    if(res === false) {
                        throw new Error('beforeUpload error!')
                    } 
                    return res
                } else { 
                    let isJPG = true
                    let temp = types && types.length > 0
                    if (temp && types.indexOf(`${file.type.split('/')[1]}`)===-1) { 
                        isJPG = false
                    }
                    let str = temp ? types.join(',') : 'jpg,jpeg,png,gif'
                    if (!isJPG) {
                        message.error(`文件限制${str}!`)
                        fileList.pop()
                    }
                    const isLt1M = file.size / 1024 / 1024 < maxSize    
                    if (!isLt1M) {
                        message.error(`大小限制${maxSize}MB!`)
                        fileList.pop() 
                    }
                    return isJPG && isLt1M
                }
            },
        }
        return (
            <Fragment>
                <div>
                    七牛新域名上传测试
                </div>
                <Form.Item>
                    {getFieldDecorator("url", {
                        getValueFromEvent: this.normFile,
                    })(
                        <Upload
                            {...{ ...uploadProps, data: { token: this.state.token },...this.props }}
                            listType={defaultStyle&&'picture-card'}
                            fileList={fileList}
                            onChange={this.onChange}
                            onPreview={this.onPreview}
                        >
                            {
                                fileList.length >= maxNum ? null : defaultStyle&&uploadButton
                            }
                            {
                                fileList.length >= maxNum ? null : !defaultStyle&&this.props.children
                            }
                        </Upload>
                    )}
                </Form.Item>
                <Modal visible={visible} footer={null} onCancel={this.onCancel}>
                    <img alt="图片预览" style={{ width: '100%' }} src={preImage} />
                </Modal>
            </Fragment>
        )
    }
}