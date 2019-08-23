/**
 * 文件说明: 表单DEMO
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期 18/08/01
 *
 */

import React from 'react'
import { Table, Icon,  Modal, Row, Col, Button } from 'antd'
import { Form, Input, Radio, Switch } from 'antd'
import {connect} from 'dva'
import Page from 'components/business/Page'
import DocumentTitle from 'react-document-title'

const RadioGroup = Radio.Group

@connect(({demo_menu}) => ({
    demo_menu,
}))
@Form.create()
export default class CreateUser extends React.PureComponent {
    handleSubmit = (e) => {
        e.preventDefault()
        this.props.form.validateFields((err, values) => {
            if(!err) {
                console.log('Received values of form: ', values)
            }
        })
    }

    handleSelectChange = (value) => {
        console.log(value)
    }

    deleteHandler = () => {
        Modal.confirm({
            title: '系统提示',
            content: '解除后，与公众号相关的功能将无法使用是否确定解除？',
            onOk() {
                console.log('OK')
            },
            onCancel() {

                console.log('Cancel')
            },
        })
    }

    renderWeChatTable = () => {
        const columns = [{
            title: '微信昵称',
            dataIndex: 'weChatName',
            key: 'weChatName',
            width: 190
        },
        {
            title: '微信号',
            dataIndex: 'account',
            key: 'account',
        },
        {
            title: '备注',
            dataIndex: 'remark',
            key: 'remark',
        },
        {
            title: '操作',
            key: 'action',
            align: 'center',
            width: 80,
            render: (text, record) => (
                <span>
                    <a href="javascript:void(0);" onClick={this.deleteHandler}>删除</a>
                </span>
            ),
        }]
        const dataItem = {
            key: 1,
            sendTime: '2018-07-21 13:29',
            amount: 1.00,
            remark: '返现',
            status: 2,
            sendName: '李毛毛',
            weChatName: '来自星星的你',
            account: '112309826',
            address: 'New York No. 1 Lake Park',
        }

        var data = []

        for(var i = 0; i< 8; i++) {
            data.push({...dataItem, key: i})
        }



        return (
            <Table pagination={false} columns={columns} dataSource={data} />
        )
    }


    render() {

        const {getFieldDecorator} = this.props.form

        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 3 },
                style : { width: '70px'}
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 16 },
            },
        }

        return (
            <DocumentTitle title="Demo-表单页">
                <Page>
                    <Page.ContentHeader title="创建新码" titleDescription="(以下均为必填)" />

                    <Row type="flex">
                        <Col style={{flexGrow: '1'}}>
                            <Form onSubmit={this.handleSubmit} className="hz-from-edit hz-from-label-left">
                                <Form.Item label="新码名称"  {...formItemLayout}>
                                    {getFieldDecorator('name', {
                                        rules: [{required: true, message: '请输入名称'}],
                                    })(
                                        <Input placeholder="例：旗舰店售后客服（30个字以内）" />
                                    )}
                                </Form.Item>
                                <Form.Item label="推广模式"  {...formItemLayout}>
                                    <RadioGroup>
                                        <Radio value={1}>使用模板</Radio>
                                        <Radio value={2}>自定义</Radio>
                                    </RadioGroup>
                                </Form.Item>
                                <Form.Item label="当前状态"  {...formItemLayout}>
                                    <Switch defaultChecked />
                                </Form.Item>
                                <Form.Item label="选择微信"  {...formItemLayout}>
                                    <Button type="primary" ghost><Icon type="plus" />添加</Button>
                                </Form.Item>

                                {this.renderWeChatTable()}

                                <div className="hz-margin-base-top-bottom">
                                    <Button type="primary" htmlType="submit">保存</Button>
                                    <Button className="hz-margin-base-left" htmlType="reset">取消</Button>
                                </div>
                            </Form>
                        </Col>
                        <Col style={{ width: '300px' }}>
                            预览效果图
                        </Col>
                    </Row>
                </Page>
            </DocumentTitle>
        )
    }
}

