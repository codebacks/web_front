/**
 **@Description:
 **@author: leo
 */

import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import {Modal, Form, Input} from 'antd'

const FormItem = Form.Item

@Form.create()
export default class Header extends PureComponent {
    static propTypes = {
        label: PropTypes.string,
        title: PropTypes.string,
        extra: PropTypes.func,
        visible: PropTypes.bool,
        onCancel: PropTypes.func,
        onCreate: PropTypes.func,
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

    setValidateStatus = (validateStatus) => {
        this.setState({
            validateStatus,
        })
    }

    render() {
        const {
            visible,
            onCancel,
            onCreate,
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
            labelCol: {span: 6},
            wrapperCol: {span: 16},
        }

        return (
            <Modal
                visible={visible}
                title={title}
                okText="保存"
                cancelText="取消"
                onCancel={onCancel}
                onOk={onCreate}
            >
                <Form layout={'horizontal'}>
                    <FormItem
                        label={label}
                        extra={extra && extra()}
                        // validateStatus={validateStatus}
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
                                                message: '必填',
                                            },
                                        ],
                                    },
                                    {
                                        trigger: 'onChange',
                                        rules: validateRe,
                                    },
                                ],
                            })(
                                <Input disabled={validateStatus === 'validating'} placeholder={placeholder}/>,
                            )
                        }
                    </FormItem>
                </Form>
            </Modal>
        )
    }
}