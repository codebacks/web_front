import React from 'react'
import { Form, Input, Modal, Button, message, Radio, notification, Icon, Upload, } from 'antd'
import styles from './ReplyForm.scss'
import SingleUpload from 'components/business/SingleUpload'

const FormItem = Form.Item
const RadioGroup = Radio.Group
const {TextArea} = Input
const _state = {
    content: '',
    loading: false,
    category_id: 0,
    priority: 0,
    content_type: 0,
    url: '',
    fileList: [],

}

const photoMaxSize = 20
const photoTypeLimit = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']

@Form.create()
class CreateForm extends React.PureComponent {
    constructor (props) {
        super(props)
        const data = {..._state}
        if (props.record.id) {
            data.id = props.record.id
            data.content_type = props.record.content_type
            if (data.content_type === 1) {
                data.url = window.JSON.parse(props.record.content)[0].url
            } else {
                data.content = props.record.content
            }
        }
        this.state = {...data}
    }

    handleOk = (e) => {
        e.preventDefault()

        this.props.form.validateFields((err, values) => {
            if (!err) {
                const data = {...this.state}
                const {activeId} = this.props.wx_replyCategories
                if (data.content_type === 1 || data.content_type === 2) {
                    let _photo = []
                    _photo.push({
                        url: data.url
                    })
                    data.content = _photo.length ? window.JSON.stringify(_photo) : ''
                } else {
                    data.content = values.content.trim()
                }
                if (!data.content) {
                    notification.error({
                        message: '错误提示',
                        description: '快捷回复内容不能为空!'
                    })
                    return false
                }
                if (data.content_type === 0 && data.content.length > 200) {
                    notification.error({
                        message: '错误提示',
                        description: '快捷回复内容不能超过200个字!'
                    })
                    return false
                }
                if (!activeId) {
                    notification.error({
                        message: '错误提示',
                        description: '请选择分组!'
                    })
                    return false
                }
                const formData = {
                    content: data.content,
                    category_id: +activeId,
                    type: 1,
                    content_type: +data.content_type,
                }
                if (this.state.id) {
                    formData.id = this.state.id
                    this.props.dispatch({
                        type: 'wx_replies/modify',
                        payload: formData,
                        callback: () => {
                            this.props.reload()
                            message.success('修改成功！')
                        }
                    })
                } else {
                    this.props.dispatch({
                        type: 'wx_replies/create',
                        payload: formData,
                        callback: () => {
                            this.props.reload()
                            message.success('创建成功！')
                        }
                    })
                }
                this.handleCancel()
            }
        })
    }

    handleCancel = () => {
        this.props.onCancel()
    }

    handleChange = (e) => {
        this.setState({content: e.target.value})
    }

    handleChangeContentType = (e) => {
        this.setState({content_type: e.target.value})
    }

    handleRemoveImage = () => {
        this.setState({
            fileList: [],
            url: ''
        })
    }

    handleUploaded = (url) => {
        this.setState({url})
    }
    handleChangeUpload = (info) => {
        if (info.file.status === 'done') {
            this.setState({url: info.file.response.url, fileList: info.fileList})
        } else {
            this.setState({fileList: info.fileList})

        }
    }

    render () {
        const {id} = this.state
        const {getFieldDecorator, getFieldValue} = this.props.form
        const formItemLayout = {
            labelCol: {span: 6},
            wrapperCol: {span: 18}
        }

        let enabled = true
        if (this.state.content_type === 1) {
            enabled = !this.state.url
        } else {
            enabled = !getFieldValue('content')
        }
        const photoUploadProps = {
            accept: photoTypeLimit.join(','),
            beforeUpload: (file) => {
                return new Promise((resolve, reject) => {
                    if (!photoTypeLimit.includes(file.type)) {
                        notification.error({
                            message: '图片格式错误',
                            description: `仅能上传${photoTypeLimit.join(',')}文件!`,
                        })
                        reject(file)
                    }
                    const sizeOk = file.size <= 1024 * 1024 * photoMaxSize // 视频大小限制
                    if (!sizeOk) {
                        notification.error({
                            message: '图片大小超出限制',
                            description: `图片大小不能超过${photoMaxSize}M`,
                        })
                        reject(file)
                    }
                    resolve(file)
                })
            }
        }
        return (
            <div id="reply">
                <Modal
                    title={id ? '编辑快捷回复' : '新增快捷回复'}
                    visible={this.props.visible}
                    onCancel={this.handleCancel}
                    maskClosable={false}
                    width={640}
                    footer={[
                        <Button key="cancel" type="ghost" onClick={this.handleCancel}>取消</Button>,
                        <Button
                            key="submit"
                            type="primary"
                            loading={this.state.loading}
                            disabled={enabled}
                            onClick={(e) => this.handleOk(e)}
                        >
                            确认
                        </Button>
                    ]}
                >
                    <Form
                        layout="horizontal"
                        key="edit"
                        className="ant-advanced-search-form"
                    >
                        <FormItem {...formItemLayout} label="类型">
                            <RadioGroup onChange={this.handleChangeContentType} value={this.state.content_type}>
                                <Radio value={0}>文本</Radio>
                                <Radio value={1}>图片</Radio>
                            </RadioGroup>
                        </FormItem>
                        {this.state.content_type === 0
                            ? (
                                <FormItem {...formItemLayout} label="内容">
                                    {getFieldDecorator('content', {
                                        initialValue: this.state.content,
                                        rules: [{
                                            max: 200,
                                            required: true,
                                            message: '请输入内容，200字以内',
                                        }],
                                    })(
                                        <TextArea
                                            placeholder="请输入内容，200字以内"
                                            // value={this.state.content}
                                            autosize={{minRows: 4, maxRows: 10}}
                                        />
                                    )}
                                </FormItem>
                            )
                            : ''}
                        {this.state.content_type === 1
                            ? (
                                <FormItem
                                    {...formItemLayout}
                                    label="上传图片"
                                    help={`支持${photoTypeLimit.join(',')}，图片大小不超过${photoMaxSize}M`}
                                >
                                    <SingleUpload {...photoUploadProps} fileList={this.state.fileList}
                                                  onChange={this.handleChangeUpload} />
                                </FormItem>
                            ) : ''
                        }
                        {this.state.content_type === 2
                            ? (
                                <FormItem {...formItemLayout} label="回复视频">
                                    <div />
                                </FormItem>
                            ) : ''
                        }

                    </Form>

                </Modal>

            </div>
        )
    }
}

export default CreateForm
