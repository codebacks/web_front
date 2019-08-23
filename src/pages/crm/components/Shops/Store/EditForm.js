'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 16/12/29
 */


import React from 'react'
import  {Icon, Form, Input, Modal, Button, Radio, Select} from 'antd'
import {connect} from 'dva'
const FormItem = Form.Item

class EditForm extends React.Component {
    constructor(props) {
        super()
        this.state = {
            defaultRole: '0',
            collapse: false,
            value: ''
        }
    }

    handleOk = () => {
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const {record} = this.props.crm_stores
                values.type = parseInt(values.type)
                values.id = record.id
                this.props.dispatch({
                    type: 'crm_stores/modify',
                    payload: values,
                    callback: () => {
                        this.props.reload()
                        this.handleCancel()
                    }
                })
            }
        })
    };

    handleCancel = () => {
        this.props.dispatch({
            type: 'crm_stores/setAttribute',
            payload: {editModal: false}
        })
    };

    render() {
        const {getFieldDecorator} = this.props.form
        const {initData: config} = this.props.base
        const {editLoading, editModal, record} = this.props.crm_stores
        const storeTypes = config.store_types || []
        const formItemLayout = {
            labelCol: {span: 8},
            wrapperCol: {span: 16},
        }
        const _type = storeTypes.filter((item) => {
            return item.id === record.type
        })
        return (
            <div>
                <Modal title="修改店铺" visible={editModal}
                    onCancel={this.handleCancel}
                    maskClosable={false}
                    footer={[
                        <Button key="cancel" type="ghost" onClick={this.handleCancel}>取消</Button>,
                        <Button key="submit" type="primary" loading={editLoading}
                            onClick={this.handleOk}>确认</Button>
                    ]}>
                    <Form layout="horizontal"
                        key="edit"
                        style={{width: 400}}
                        className="ant-advanced-search-form">
                        <FormItem {...formItemLayout} label={'电商平台'}>
                            {_type[0].name}
                        </FormItem>
                        <FormItem {...formItemLayout} label={'店铺名称'}>
                            {getFieldDecorator('name', {
                                rules: [{required: true, message: '请填写店铺名称'}],
                                initialValue: record.name
                            })(
                                <Input placeholder="请输入店铺名称" style={{width: 180}}/>
                            )}
                        </FormItem>
                    </Form>
                </Modal>
            </div>
        )
    }
}

function mapStateToProps({base, crm_stores}) {
    return {base, crm_stores}
}

export default connect(mapStateToProps)(Form.create()(EditForm))