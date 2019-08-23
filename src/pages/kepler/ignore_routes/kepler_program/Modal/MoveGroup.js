import Input from '../../../../../components/HzInput'
import { PureComponent } from 'react'
import { Form, Modal, Button, Select } from 'antd'
import {connect} from 'dva'
import styles from './index.less'

const Option = Select.Option

@Form.create()
@connect(({kepler_program, base}) =>({
    kepler_program, base
}))
export default class extends PureComponent {
    state = {
    }

    componentDidMount () {
    }

    onSubmit = () => {
        const { onCancel, id } = this.props
        this.props.form.validateFields((error, value) => {
            if (error) return

            this.props.dispatch({
                type: 'kepler_program/moveCardGroup',
                payload: {
                    id: id,
                    category_id: value.select
                },
                callback: (data) => {
                    if (data.meta && data.meta.code === 200) {
                        onCancel('moveAlready')
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
        const { visible, onCancel, groupArray } = this.props
        const { getFieldDecorator } = this.props.form

        return (
            <Modal
                visible={visible}
                title={<span style={{fontWeight: 'bold'}}>移动分组</span>}
                onOk={this.onSubmit}
                onCancel={onCancel}
                cancelText='取消'
                okText='保存'
                destroyOnClose={true}
            >
                <div className={styles.moveGroup}>
                    <Form.Item label='选择分组' {...formItemLayout}>
                        {getFieldDecorator('select', {
                            rules: [
                                {
                                    required: true,
                                    message: '请选择卡片分组'
                                },
                            ]
                        })(
                            <Select placeholder='选择卡片分组'>
                                {groupArray.map((item, index) => {
                                    return <Option key={index} value={item.id}>{item.name}</Option>
                                })}
                            </Select>
                        )}
                    </Form.Item>
                </div>
            </Modal>
        )
    }
}