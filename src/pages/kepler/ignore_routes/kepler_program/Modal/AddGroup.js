import Input from '../../../../../components/HzInput'
import { PureComponent } from 'react'
import { Form, Modal, Button } from 'antd'
import {connect} from 'dva'

@Form.create()
@connect(({kepler_program, base}) =>({
    kepler_program, base
}))
export default class extends PureComponent {
    state = {
    }

    componentDidMount () {
    }

    spaceValidate = (rules, value, callback) => {
        if (value && /^[\s　]|[ ]$/.test(value)) {
            callback('请勿以空格开头或结束')
        }
        callback()
    }

    onSubmit = () => {
        const { onCancel } = this.props
        this.props.form.validateFields((error, value) => {
            if (error) return

            this.props.dispatch({
                type: 'kepler_program/addGroup',
                payload: {
                    name: value.input
                },
                callback: (data) => {
                    if (data.meta && data.meta.code === 200) {
                        onCancel('addAlready')
                    }
                }
            })
        })
    }

    render () {
        const formItemLayout = {
            labelCol: {
                span: 6,
                style: {
                    width: '80px',
                    textAlign: 'right',
                },
            },
            wrapperCol: {
                span: 18,
            },
        }
        const { visible, onCancel } = this.props
        const { getFieldDecorator } = this.props.form

        return (
            <Modal
                visible={visible}
                title={<span style={{fontWeight: 'bold'}}>新增分组</span>}
                footer={<Button type='primary' onClick={this.onSubmit}>确定</Button>}
                onCancel={onCancel}
                destroyOnClose={true}
            >
                <Form.Item label='分组名称' {...formItemLayout}>
                    {getFieldDecorator('input', {
                        rules: [
                            {
                                required: true,
                                message: '请输入分组名称'
                            },
                            {
                                validator: this.spaceValidate
                            }
                        ]
                    })(
                        <Input placeholder='请输入分组名称' maxLength={8}/>
                    )}
                </Form.Item>
            </Modal>
        )
    }
}