import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import {Modal, Form, Input} from 'antd'

const FormItem = Form.Item

@Form.create()
export default class ModalForm extends PureComponent {
    static propTypes = {
        label: PropTypes.string,
        title: PropTypes.string,
        extra: PropTypes.func,
        visible: PropTypes.bool,
        onCancel: PropTypes.func,
        onOk: PropTypes.func,
        confirmLoading: PropTypes.bool,
        validateRe: PropTypes.object,
        validateOnly: PropTypes.object,
        placeholder: PropTypes.string,
        initialValue: PropTypes.string,
        data: PropTypes.object,
    }

    static defaultProps = {
        label: '',
        title: '',
        validate: {},
        validateOnly: {},
        placeholder: '',
        initialValue: '',
        data: {},
    }

    constructor(props) {
        super(props)
        this.state = {
            validateStatus: '',
        }
    }

    validateName = (rule, value, callback) => {
        const filterValue = value.replace(/\s/g, '')
        if (!filterValue) {
            callback('请输入分组名称')
            return
        }
        callback()
    }

    render() {
        const {
            visible,
            onCancel,
            onOk,
            confirmLoading,
            form,
            label,
            title,
            extra,
            validateRe,
            placeholder,
            initialValue,
        } = this.props
        const {getFieldDecorator} = form
        const {validateStatus} = this.state

        const formItemLayout = {
            labelCol: {span: 4},
            wrapperCol: {span: 20},
        }

        return (
            <Modal
                visible={visible}
                title={title}
                okText="保存"
                onCancel={onCancel}
                onOk={onOk}
                confirmLoading={confirmLoading}
            >
                <Form>
                    <FormItem
                        label={label}
                        extra={extra && extra()}
                        {...formItemLayout}
                    >
                        {
                            getFieldDecorator('name', {
                                initialValue,
                                validateFirst: true,
                                validate: [
                                    {
                                        trigger: 'onChange',
                                        rules: [
                                            {
                                                required: true,
                                                message: '请输入分组名称',
                                            },
                                        ],
                                    },
                                    {
                                        trigger: 'onChange',
                                        rules: validateRe,
                                    },
                                ],
                                rules: [
                                    {
                                        validator: this.validateName
                                    }
                                ],
                            })(
                                <Input disabled={validateStatus === 'validating'}
                                    placeholder={placeholder}
                                    onPressEnter={onOk}
                                    autoComplete="off"
                                />,
                            )
                        }
                    </FormItem>
                </Form>
            </Modal>
        )
    }
}