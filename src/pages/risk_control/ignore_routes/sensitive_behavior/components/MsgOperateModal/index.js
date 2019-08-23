/**
 **@Description:
 **@author: leo
 */

import React, {Component} from 'react'
import {Input, Form, message, Checkbox} from 'antd'
import toggleModalWarp from 'hoc/toggleModalWarp'
import {hot} from 'react-hot-loader'

const FormItem = Form.Item

@hot(module)
@Form.create()
@toggleModalWarp({
    title: '处理',
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
                const {ids, dispatch} = this.props
                values.status = Number(values.status)
                values.records_ids = ids
                this.props.dispatch({
                    type: 'risk_control_sensitiveBehavior/changeWxSensitiveOperationRecords',
                    payload: {
                        body: values,
                    },
                    callback: () => {
                        message.success('修改成功')
                        dispatch({
                            type: 'risk_control_sensitiveBehavior/clearSelectedRowKeys',
                            payload: ids,
                        })
                        this.props.goPage()
                        this.handleCancel()
                    },
                })
            }
        })
    }

    handleCancel = () => {
        this.props.onModalCancel()
    }

    render() {
        const {
            form,
        } = this.props
        const {getFieldDecorator} = form

        const formItemLayout = {
            labelCol: {span: 6},
            wrapperCol: {span: 14},
        }

        return (
            <Form layout={'horizontal'} {...formItemLayout}>
                <FormItem label="异常/正常">
                    {getFieldDecorator('status', {
                        initialValue: '0',
                    })(
                        <Checkbox>
                            正常行为
                        </Checkbox>,
                    )}
                </FormItem>
                <FormItem label="备注" required={false}>
                    {getFieldDecorator('handle_remark', {
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
