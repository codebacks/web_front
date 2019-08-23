/**
 **@Description:
 **@author: leo
 */

import React, {Component} from 'react'
import {Input, Form, message} from 'antd'
import hooksModalDecorator from 'hoc/hooksModal'
import {hot} from 'react-hot-loader'

const FormItem = Form.Item

@hot(module)
@Form.create()
@hooksModalDecorator({
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
                let isReturn = false
                Object.keys(values).forEach((key) => {
                    if(!values[key]) {
                        message.warning('请输入内容')
                        isReturn = true
                    }
                })
                if(!isReturn) {
                    const {record, dispatch} = this.props
                    this.props.dispatch({
                        type: 'risk_control_deviceManagement/updateDevices',
                        payload: {
                            id: record.id,
                            body: values,
                        },
                        callback: () => {
                            message.success('修改成功')
                            dispatch({
                                type: 'risk_control_deviceManagement/clearSelectedRowKeys',
                            })
                            this.props.goPage()
                            this.handleCancel()
                        },
                    })
                }
            }
        })
    }

    handleCancel = () => {
        this.props.onModalCancel()
    }

    render() {
        const {
            form,
            formKey,
            label,
        } = this.props
        const {getFieldDecorator} = form

        const formItemLayout = {
            labelCol: {span: 6},
            wrapperCol: {span: 14},
        }

        return (
            <Form layout={'horizontal'} {...formItemLayout}>
                <FormItem label={label} required={false}>
                    {getFieldDecorator(formKey, {
                        rules: [
                            {
                                pattern: /^.{1,200}$/,
                                message: '限1-200个字',
                            },
                        ],
                    })(
                        <Input.TextArea
                            placeholder={'最多200个字'}
                            autosize={{minRows: 2, maxRows: 6}}
                        />,
                    )}
                </FormItem>
            </Form>
        )
    }
}
