/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/10/15
 */

import React from 'react'
import {
    Form,
    Radio,
    message,
} from 'antd'
import modalWarp from 'hoc/modalWarp'
import styles from './index.less'
import Editor from 'components/Face/components/Editor'
import SingleUpload from 'business/SingleUpload'
import _ from "lodash"

const FormItem = Form.Item
const RadioGroup = Radio.Group

@modalWarp()
@Form.create()
export default class Index extends React.PureComponent {
    static defaultProps = {
        record: {
            content: '',
            msg_type: 1,
        },
    }

    constructor(props) {
        super(props)
        props.setModalOkFn(this.handleOk)
    }

    handleOk = (e) => {
        this.props.form.validateFields({force: true}, (err, values) => {
            if(!err) {
                const {id} = this.props.record
                const msg_type = values.msg_type
                const formData = {
                    msg_type,
                    content: '',
                }
                if(msg_type === 1) {
                    formData.content = Editor.htmlToMsg(values.editorContent)
                }else if(msg_type === 3) {
                    formData.content = this.getUploadUrl(values)
                }
                if(id) {
                    formData.id = id
                    this.props.dispatch({
                        type: 'wx_newFriends/updateContent',
                        payload: formData,
                        callback: () => {
                            this.props.getConfig()
                            message.success('更新成功！')
                            this.handleCancel()
                        },
                    })
                }else {
                    this.props.dispatch({
                        type: 'wx_newFriends/createContent',
                        payload: formData,
                        callback: () => {
                            this.props.getConfig()
                            message.success('创建成功！')
                            this.handleCancel()
                        },
                    })
                }
            }
        })
    }

    getUploadUrl = (values) => {
        return _.get(values, 'upload[0].response.url', '')
    }

    handleCancel = () => {
        this.props.onModalCancel()
    }

    checkUpload = (rule, value, callback) => {
        const {getFieldValue} = this.props.form
        if(getFieldValue('msg_type') !== 3) {
            callback()
            return
        }

        if(_.get(value, '_file.status', '') !== 'done') {
            callback('必填')
        }else {
            callback()
        }
    }

    checkEditor = (rule, value, callback) => {
        const {getFieldValue} = this.props.form
        if(getFieldValue('msg_type') !== 1) {
            callback()
            return
        }

        const len = Editor.computeMsgLength(value)

        if(len === 0) {
            callback('必填')
        }else if(len > 300) {
            callback('限制300字')
        }else {
            callback()
        }
    }

    render() {
        const {record, form} = this.props
        const {getFieldDecorator, getFieldValue} = form
        const formItemLayout = {
            labelCol: {span: 4},
            wrapperCol: {span: 18},
        }

        return (
            <Form
                className={styles.newFriendForm}
            >
                <FormItem
                    {...formItemLayout}
                    label="类型"
                >
                    {
                        getFieldDecorator(`msg_type`, {
                            initialValue: record.msg_type,
                        })(
                            <RadioGroup
                            >
                                <Radio value={1}>文本</Radio>
                                <Radio value={3}>图片</Radio>
                            </RadioGroup>,
                        )
                    }
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    style={{
                        display: getFieldValue('msg_type') === 1 ? 'block' : 'none',
                    }}
                    label="内容"
                >
                    {
                        getFieldDecorator(`editorContent`, {
                            initialValue: record.msg_type === 1 ? Editor.msgToHtml(record.content) : '',
                            validate: [
                                {
                                    trigger: 'onChange',
                                    rules: [
                                        {validator: this.checkEditor},
                                    ],
                                },
                            ],
                        })(
                            <Editor
                                className={styles.editor}
                                placeholder="限制300字"
                                extend={<span/>}
                                disableKeyDown={true}
                            />,
                        )
                    }
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    style={{
                        display: getFieldValue('msg_type') === 3 ? 'block' : 'none',
                    }}
                    extra={SingleUpload.extra}
                    label="上传图片"
                >
                    {
                        getFieldDecorator(`upload`, {
                            valuePropName: 'fileList',
                            getValueFromEvent: ({fileList, file}) => {
                                fileList._file = file
                                return fileList
                            },
                            initialValue: record.msg_type === 3 ? [
                                {
                                    url: record.content,
                                    uid: '-1',
                                },
                            ] : [],
                            validate: [
                                {
                                    trigger: 'onChange',
                                    rules: [
                                        {validator: this.checkUpload},
                                    ],
                                },
                            ],
                        })(
                            <SingleUpload/>,
                        )
                    }
                </FormItem>
            </Form>
        )
    }
}

