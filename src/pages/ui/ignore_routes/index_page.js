import React from 'react'
import { Form, Row, Col, Button, Icon, Popover  } from 'antd'
import {  DatePicker, Select, Input } from 'antd'
import Page from '../../../components/business/Page'
import List from '../components/list'
import router from 'umi/router'

const RangePicker = DatePicker.RangePicker
const Option = Select.Option

@Form.create()
export default class Index extends React.PureComponent {

    createXinMaHandler = () => {
        router.push('/ui/add')
    }

    render(){

        const formItemLayout = {
            labelCol: {
                span: 6,
                style: {
                    width: '85px'
                }
            },
            wrapperCol: {
                span: 16
            },
        }

        const action = (<div>
            <Button type="primary">授权公众号</Button>
            <span className="hz-page-content-action-description">
                <Popover placement="bottomLeft" content={<div><p>为保证所有功能正常,</p><p>授权时请保持默认选择，把权限统一授权给51赞</p></div>}>
                    <Icon className="hz-text-primary hz-icon-size-default" type="question-circle" /> 使用教程
                </Popover>
            </span>
            <Button type="primary" onClick={this.createXinMaHandler}><Icon type="plus"/>创建新码</Button>
        </div>)

        return (
            <Page>
                <Page.ContentHeader 
                    title="红包" 
                    help={<a href='http://www.baidu.com' target='_blank' rel="nofollow me noopener noreferrer"><Icon type="book"></Icon> 帮助</a>}
                    subTitle="支付宝：种草莓的毛毛" 
                    description="绑定已开通企业支付到零钱功能的微信服务号，即可开通小红包功能，登录云聊给客户发红包，请务必保障公众号商户平台余额充足！" 
                    action={action}  />

                <Page.ContentAdvSearch>
                    <Form layout="horizontal" className="hz-from-search">
                        <Row >
                            <Col span={8}>
                                <Form.Item label="起止时间" {...formItemLayout}>
                                    <RangePicker />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="红包状态" {...formItemLayout}>
                                    <Select
                                        placeholder="请选择"
                                        optionFilterProp="children"
                                    >
                                        <Option value="0">已领取</Option>
                                        <Option value="1">未领取</Option>
                                        <Option value="2">待领取</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="发送人"  {...formItemLayout}>
                                    <Select
                                        placeholder="请选择"
                                        optionFilterProp="children"
                                    >
                                        <Option value="0">已领取</Option>
                                        <Option value="1">未领取</Option>
                                        <Option value="2">待领取</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={8}>
                                <Form.Item label="发送人微信" {...formItemLayout}>
                                    <Select
                                        placeholder="请选择发送人微信好"
                                        optionFilterProp="children"
                                    >
                                        <Option value="0">已领取</Option>
                                        <Option value="1">未领取</Option>
                                        <Option value="2">待领取</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="相关订单号"  {...formItemLayout}>
                                    <Input placeholder="输入订单号" />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="相关订单号"  {...formItemLayout}>
                                    <Input placeholder="输入订单号" />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={8}>
                                <Col span={3} style={{width: '80px'}}></Col>
                                <Col span={16}>
                                    <Button className="hz-btn-width-default" type="primary" htmlType="submit">
                                        <Icon type="search" />
                                        搜索
                                    </Button>
                                    <Button className="hz-btn-width-default hz-margin-base-left" >
                                        重置
                                    </Button>
                                </Col>
                            </Col>
                        </Row>
                    </Form>
                </Page.ContentAdvSearch>

                <List />
            </Page>
        )
    }
}