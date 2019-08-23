/**
 **@Description:
 **@author: leo
 */

import React, {Component} from 'react'
import {
    Modal,
    Input,
    Form,
} from 'antd'
// import _ from 'lodash'
// import styles from './index.less'
const FormItem = Form.Item

@Form.create()
export default class Index extends Component {
    constructor(props) {
        super(props)
        this.state = {
            confirmDirty: false,
            autoCompleteResult: [],
        }
    }

    componentDidMount() {

    }

    handleSubmit = (e) => {
        e.preventDefault()
        this.props.form.validateFields((err, values) => {
            if(!err) {
                this.props.dispatch({
                    type: 'setting_companyInformation/update',
                    payload: values,
                    callback: () => {
                        this.props.dispatch({
                            type: 'base/getInitData',
                        })
                        this.onCancel()
                    },
                })
            }
        })
    }

    onCancel = ()=>{
        this.props.onCancel()
        this.props.form.resetFields()
    }

    render() {
        const {visible, contact_name, contact_mobile} = this.props
        const {getFieldDecorator} = this.props.form

        const formItemLayout = {
            labelCol: {span: 6},
            wrapperCol: {span: 14},
        }

        return (
            <Modal
                visible={visible}
                title={'修改联系人'}
                okText="保存"
                cancelText="取消"
                onCancel={this.onCancel}
                onOk={this.handleSubmit}
                width={520}
            >
                <Form layout={'horizontal'}>
                    <FormItem
                        {...formItemLayout}
                        label="联系人"
                    >
                        {getFieldDecorator('contact_name', {
                            initialValue: contact_name,
                            rules: [
                                {required: true, message: '必填'},
                                {pattern: /^[a-zA-Z0-9\u4E00-\u9FA5\uF900-\uFA2D]{2,20}$/, message: '中文、英文、数字, 2-20'},
                            ],
                        })(
                            <Input placeholder={'请输入联系人姓名'}/>,
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="手机号"
                    >
                        {getFieldDecorator('contact_mobile', {
                            initialValue: contact_mobile,
                            rules: [
                                {
                                    required: true, message: '必填',
                                },
                                {
                                    pattern: /^[0-9]{11}$/, message: '11位数字',
                                },
                            ],
                        })(
                            <Input placeholder={'请输入联系人电话'}/>,
                        )}
                    </FormItem>
                </Form>
            </Modal>
        )
    }
}
