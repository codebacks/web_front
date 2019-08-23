/**
 **@Description:
 **@author: leo
 */

import React, {Component} from 'react'
import {Input, Form, message} from 'antd'
import toggleModalWarp from 'hoc/toggleModalWarp'
import {hot} from 'react-hot-loader'

const FormItem = Form.Item

@hot(module)
@Form.create()
@toggleModalWarp({
    width: 520,
    destroyOnClose: true,
    maskClosable: false,
})
export default class Index extends Component {
    constructor(props) {
        super(props)
        props.setModalOkFn(this.handleOk)
    }

    componentWillUnmount() {
    }

    handleOk = (e) => {
        e.preventDefault()
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const {isCreate, record} = this.props
                if (isCreate) {
                    values.names = [...new Set(this.getNamesArr(values.names))]
                    this.props.dispatch({
                        type: 'risk_control_smsSensitiveWord/createMsgSensitiveWordsBatch',
                        payload: {
                            body: values,
                        },
                        callback: () => {
                            message.success('添加成功')
                            this.props.goPage()
                            this.handleCancel()
                        },
                    })
                }else {
                    this.props.dispatch({
                        type: 'risk_control_smsSensitiveWord/changeMsgSensitiveWords',
                        payload: {
                            id: record.id,
                            body: values,
                        },
                        callback: () => {
                            message.success('修改成功')
                            this.props.goPage()
                            this.handleCancel()
                        },
                    })
                }
            }
        })
    }

    getNamesArr = (names = '') => {
        return names.replace(/\r\n/g, '<br/>').replace(/\n/g, '<br/>').split(/<br\/>/g).map((name, i) => {
            return name.trim()
        })
    }

    checkNames = (rule, value, callback) => {
        const names = this.getNamesArr(value)
        let errorIndex
        if (!names.length) {
            callback('必填')
        }else if (names.length > 50) {
            callback(`敏感词不超过50个字`)
        }else if ((errorIndex = names.findIndex(name => name.length === 0)) > -1) {
            callback(`第${errorIndex + 1}个敏感词不能为空`)
        }else if ((errorIndex = names.findIndex(name => name.length > 20)) > -1) {
            callback(`第${errorIndex + 1}个敏感词不超过20个字`)
        }else {
            callback()
        }
    }

    handleCancel = () => {
        this.props.onModalCancel()
    }

    render() {
        const {
            form,
            record = {},
            isCreate,
        } = this.props
        const {getFieldDecorator} = form

        const formItemLayout = {
            labelCol: {span: 6},
            wrapperCol: {span: 14},
        }

        return (
            <Form layout={'horizontal'} {...formItemLayout}>
                {
                    isCreate ? (
                        <FormItem label="敏感词" required={true}>
                            {getFieldDecorator('names', {
                                initialValue: record.names,
                                rules: [
                                    {validator: this.checkNames},
                                ],
                            })(
                                <Input.TextArea
                                    placeholder={'一行为一个敏感词，支持同时添加多个敏感词；单个敏感词不超过20个字'}
                                    autosize={{minRows: 3, maxRows: 50}}
                                />,
                            )}
                        </FormItem>
                    ) : (
                        <FormItem label="敏感词" required={true}>
                            {getFieldDecorator('name', {
                                initialValue: record.name,
                                validateTrigger: ['onChange', 'onBlur'],
                                rules: [
                                    {
                                        required: true,
                                        message: '必填',
                                        whitespace: true,
                                    },
                                    {
                                        pattern: /^.{1,20}$/,
                                        message: '限1-20个字',
                                    },
                                ],
                            })(<Input placeholder={'20个字以内'}/>)}
                        </FormItem>
                    )
                }
            </Form>
        )
    }
}
