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
                const {record} = this.props
                if(record){
                    this.props.dispatch({
                        type: 'risk_control_devicesGroups/changeGroups',
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
                }else{
                    this.props.dispatch({
                        type: 'risk_control_devicesGroups/createGroups',
                        payload: {
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

    handleCancel = () => {
        this.props.onModalCancel()
    }

    render() {
        const {
            form,
            record = {}
        } = this.props
        const {getFieldDecorator} = form

        const formItemLayout = {
            labelCol: {span: 6},
            wrapperCol: {span: 14},
        }

        return (
            <Form layout={'horizontal'} {...formItemLayout}>
                <FormItem label="分组名称" required={true}>
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
                                pattern: /^.{1,10}$/,
                                message: '限1-10个字',
                            },
                        ],
                    })(<Input placeholder={'10个字以内'}/>)}
                </FormItem>
                <FormItem label="分组备注" required={false}>
                    {getFieldDecorator('remark', {
                        initialValue: record.remark,
                        rules: [
                            {
                                pattern: /^.{1,40}$/,
                                message: '限1-40个字',
                            },
                        ],
                    })(
                        <Input.TextArea
                            placeholder={'40个字以内'}
                            autosize={{ minRows: 2, maxRows: 6 }}
                        />,
                    )}
                </FormItem>
            </Form>
        )
    }
}
