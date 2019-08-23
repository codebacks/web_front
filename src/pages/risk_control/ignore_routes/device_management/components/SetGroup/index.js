/**
 **@Description:
 **@author: leo
 */

import React, {Component} from 'react'
import {Form, message, Select} from 'antd'
import hooksModalDecorator from 'hoc/hooksModal'
import {hot} from 'react-hot-loader'
import styles from './index.less'

const FormItem = Form.Item
const Option = Select.Option

@hot(module)
@Form.create()
@hooksModalDecorator({
    title: '设置分组',
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
                const {selectedRowKeys = [], dispatch} = this.props
                values.ids = selectedRowKeys.slice()
                this.props.dispatch({
                    type: 'risk_control_deviceManagement/batchGroup',
                    payload: {
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
        })
    }

    handleCancel = () => {
        this.props.onModalCancel()
    }

    getOptions = (optionsMap) => {
        const options = []
        Object.keys(optionsMap).forEach((key) => {
            const item = optionsMap[key]
            options.push(
                <Option
                    key={String(key)}
                >
                    {item}
                </Option>,
            )
        })

        return options
    }

    render() {
        const {
            form,
            groupsAllLoading,
            risk_control_deviceManagement,
            selectedRowKeys = [],
        } = this.props

        const {getFieldDecorator} = form
        const {
            groupsAllOptionsMap = {},
        } = risk_control_deviceManagement

        const formItemLayout = {
            labelCol: {span: 6},
            wrapperCol: {span: 14},
        }

        return (
            <div className={styles.main} id='setGroupMain'>
                <div className={styles.title}>{`已选择${selectedRowKeys.length}台设置`}</div>
                <Form layout={'horizontal'} {...formItemLayout}>
                    <FormItem label={'设备分组'} required={false}>
                        {getFieldDecorator('group_id', {
                            rules: [
                                {
                                    required: true,
                                    message: '必填',
                                },
                            ],
                        })(
                            <Select
                                placeholder={'全部'}
                                allowClear={true}
                                loading={groupsAllLoading}
                                showSearch={true}
                                optionFilterProp={'children'}
                                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                getPopupContainer={() => document.getElementById('setGroupMain')}
                            >
                                {this.getOptions(groupsAllOptionsMap)}
                            </Select>,
                        )}
                    </FormItem>
                </Form>
            </div>
        )
    }
}
