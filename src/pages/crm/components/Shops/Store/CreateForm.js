'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 16/12/29
 */


import React from 'react'
import {Icon, Form, Input, Modal, Row, Col, Radio, Button, Select} from 'antd'
import {connect} from 'dva'

const FormItem = Form.Item
const Option = Select.Option

class CreateForm extends React.Component {
    constructor(props) {
        super()
        this.state = {}
    }


    handleCreate(e) {
        e.preventDefault()
        this.props.form.validateFields((err, values) => {
            if (!err) {
                values.type = parseInt(values.type)
                this.props.dispatch({
                    type: 'crm_stores/create',
                    payload: {body: values},
                    callback: () => {
                        this.props.reload()
                        this.handleCancel()
                    }
                })

            }
        })
    }

    handleCancel = () => {
        this.props.dispatch({
            type: 'crm_stores/setAttribute',
            payload: {createModal: false}
        })
    };

    render() {
        const {getFieldDecorator} = this.props.form
        const {initData: config} = this.props.base
        const {createLoading, createModal} = this.props.crm_stores
        const storeTypes = config.store_types || []
        const formItemLayout = {
            labelCol: {span: 8},
            wrapperCol: {span: 16},
        }
        const getStoreTypeOptions = () => {
            let options = []

            storeTypes.map((d) => {
                options.push(<Option key={d.id + ''} value={d.id + ''} label={d.name}>{d.name}</Option>)
            })
            return options
        }
        return (
            <div>
                <Modal title="创建店铺" visible={createModal}
                    onCancel={this.handleCancel}
                    maskClosable={false}
                    footer={[
                        <Button key="cancel" type="ghost" onClick={this.handleCancel.bind(this)}>取消</Button>,
                        <Button key="submit" type="primary" loading={createLoading}
                            onClick={this.handleCreate.bind(this)}>确认</Button>
                    ]}>
                    <Form layout="horizontal"
                        className="ant-advanced-search-form"
                        key="create"
                        onSubmit={this.handleCreate.bind(this)}>
                        <div className="strong textCenter" style={{padding: '10px 0'}}>店铺创建后将不可删除！</div>
                        <FormItem {...formItemLayout} label={'电商平台'}>
                            {getFieldDecorator('type', {
                                rules: [
                                    {
                                        required: true,
                                        message: '请选择电商平台!',
                                    }
                                ],
                                initialValue: storeTypes.length > 1 ? storeTypes[1].id + '' : ''
                            })(
                                <Select placeholder="请选择电商平台" style={{width: 180}}>
                                    {getStoreTypeOptions()}
                                </Select>
                            )}
                        </FormItem>
                        <FormItem {...formItemLayout} label={'店铺名称'}>
                            {getFieldDecorator('name', {
                                rules: [{required: true, message: '请填写店铺名称'}],
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

export default connect(mapStateToProps)(Form.create()(CreateForm))