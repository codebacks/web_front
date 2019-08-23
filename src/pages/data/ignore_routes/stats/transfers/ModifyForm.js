'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 16/12/29
 */


import React from 'react'
import {InputNumber, Form, Modal, Button, notification} from 'antd'

const FormItem = Form.Item

class ModifyForm extends React.Component {
    constructor(props) {
        super()
        this.state = {
            amount: '',
            record: null
        }
    }

    handleOk = () => {
        let body = {
            amount: parseFloat(this.state.amount)
        }
        if (!body.amount) {
            notification.error({
                message: '错误提示',
                description: '金额输入错误!',
            })
        } else {
            let record = {...this.state.record}
            record.amount = body.amount
            this.props.dispatch({
                type: 'data_transfer/modify',
                payload: {body: body, id: this.state.record.id, record: record},
                callback: () => {
                    this.props.onSearch()
                    this.handleCancel()
                }
            })
        }
    }

    handleCancel = () => {
        this.props.onCancel()
    }

    componentDidMount() {
        this.setState({record: this.props.record, amount: this.props.record.amount})
    }

    handleChange = (key, val) => {
        this.setState({[key]: val})
    }

    render() {
        const formItemLayout = {
            labelCol: {span: 8},
            wrapperCol: {span: 16},
        }

        return (
            <div>
                <Modal title="修改红包金额"
                    visible={this.props.visible}
                    onCancel={this.handleCancel}
                    maskClosable={false}
                    footer={[
                        <Button key="cancel" type="ghost" onClick={this.handleCancel}>取消</Button>,
                        <Button key="submit"
                            type="primary"
                            loading={this.props.data_transfer.editLoading}
                            onClick={this.handleOk}>确认</Button>
                    ]}>
                    <Form layout="horizontal"
                        key="edit"
                        style={{width: 400}}
                        className="ant-advanced-search-form">
                        <FormItem {...formItemLayout} label={'金额'}>
                            <InputNumber placeholder="请输入金额" value={this.state.amount}
                                min={0.01}
                                max={1000}
                                style={{width: 90}}
                                onChange={(e)=>{this.handleChange('amount', e)}}/>
                            <p className="ipt-tip">红包金额0.01~1000元</p>
                        </FormItem>
                    </Form>
                </Modal>
            </div>
        )
    }
}

export default ModifyForm
