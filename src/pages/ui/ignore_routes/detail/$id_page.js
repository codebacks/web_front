import React from 'react'
import Page from '../../../../components/business/Page'
import { Row, Col, Form, Input, Radio, Switch,Button, Icon } from 'antd'

export default class Detail extends React.PureComponent {
    render() {
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 3 },
                style : { width: '75px'}
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 16 },
            },
        }

        return (
            <Page>
                <Page.ContentHeader 
                    hasGutter={false}
                    breadcrumbData={[{
                        name: 'UI',
                        path: '/ui'
                    },{
                        name: '详情'
                    }]}
                />
                
                <Page.ContentBlock title='基础设置' hasDivider={true}>
                    <Row type="flex">
                        <Col style={{flexGrow: '1'}}>
                            <Form className="hz-from-edit">
                                <Form.Item label="新码名称"  {...formItemLayout}>
                                    <Input placeholder="例：旗舰店售后客服（30个字以内）" />
                                </Form.Item>
                                <Form.Item label="推广模式"  {...formItemLayout}>
                                    <Radio.Group>
                                        <Radio value={1}>使用模板</Radio>
                                        <Radio value={2}>自定义</Radio>
                                    </Radio.Group>
                                </Form.Item>
                                <Form.Item label="当前状态"  {...formItemLayout}>
                                    <Switch defaultChecked />
                                </Form.Item>
                                <Form.Item label="选择微信"  {...formItemLayout}>
                                    <Button type="primary" ghost><Icon type="plus" />添加</Button>
                                </Form.Item>

                                
                            </Form>
                        </Col>
                        <Col style={{ width: '300px' }}>
                            预览效果图
                        </Col>
                    </Row>
                </Page.ContentBlock>

                <Page.ContentBlock title='基础设置'>
                    <Row type="flex">
                        <Col style={{flexGrow: '1'}}>
                            <Form className="hz-from-edit">
                                <Form.Item label="新码名称"  {...formItemLayout}>
                                    <Input placeholder="例：旗舰店售后客服（30个字以内）" />
                                </Form.Item>
                                <Form.Item label="推广模式"  {...formItemLayout}>
                                    <Radio.Group>
                                        <Radio value={1}>使用模板</Radio>
                                        <Radio value={2}>自定义</Radio>
                                    </Radio.Group>
                                </Form.Item>
                                <Form.Item label="当前状态"  {...formItemLayout}>
                                    <Switch defaultChecked />
                                </Form.Item>
                                <Form.Item label="选择微信"  {...formItemLayout}>
                                    <Button type="primary" ghost><Icon type="plus" />添加</Button>
                                </Form.Item>

                                
                            </Form>
                        </Col>
                        <Col style={{ width: '300px' }}>
                            预览效果图
                        </Col>
                    </Row>
                </Page.ContentBlock>
            </Page>
        )
    }
}