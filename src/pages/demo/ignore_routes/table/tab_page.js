import React, {Component} from 'react'
import {Table, Icon, Divider, Tooltip, Popover, Row, Col, Button} from 'antd'
import {Form, DatePicker, Select, Input} from 'antd'
import {connect} from 'dva'
import router from 'umi/router'
import Page from 'components/business/Page'
import DocumentTitle from 'react-document-title'

const RangePicker = DatePicker.RangePicker
const Option = Select.Option

@connect(({demo_menu}) => ({
    demo_menu,
}))
export default class Index extends Component {

    createXinMaHandler = () => {
        router.push('/demo/form/create')
    }

    render() {
        const columns = [{
            title: '发送时间',
            dataIndex: 'sendTime',
            key: 'sendTime',
            width: 190,
        },
        {
            title: '红包金额',
            dataIndex: 'amount',
            key: 'amount',
        },
        {
            title: '红包备注',
            dataIndex: 'remark',
            key: 'remark',
        },
        {
            title: '红包状态',
            dataIndex: 'status',
            key: 'status',
        },
        {
            title: '发送人',
            dataIndex: 'sendName',
            key: 'sendName',
        },
        {
            title: (<span>发送人微信号 <Popover content="提示文字提示文字提示文字">
                <Icon className="hz-text-primary" type="question-circle-o"></Icon></Popover></span>),
            dataIndex: 'sendWeChatName',
            key: 'sendWeChatName',
        },
        {
            title: '相关订单号',
            dataIndex: 'orderNumber',
            key: 'orderNumber',
        },
        {
            title: '操作',
            key: 'action',
            align: 'center',
            width: 210,
            render: (text, record) => (
                <span>
                    <Tooltip title="编辑此信息">
                        <a href="javascript:void(0);">编辑</a>
                    </Tooltip>
                    <Divider type="vertical"/>
                    <a href="javascript:void(0);" onClick={this.deleteHandler}>删除</a>
                    <Divider type="vertical"/>
                    <a href="javascript:void(0);" className="ant-dropdown-link">
                    更多 <Icon type="down"/>
                    </a>
                </span>
            ),
        }
        ]

        const formItemLayout = {
            labelCol: {
                span: 6,
                style: {
                    width: '80px',
                },
            },
            wrapperCol: {
                span: 16,
            },
        }

        const dataItem = {
            key: 1,
            sendTime: '2018-07-21 13:29',
            amount: 1.00,
            remark: '返现',
            status: 2,
            sendName: '李毛毛',
            sendWeChatName: '来自星星的你',
            orderNumber: '112309826',
            address: 'New York No. 1 Lake Park',
        }

        var data = []

        for(var i = 0; i < 40; i++) {
            data.push({...dataItem, key: i})
        }

        const action = (<div>
            <Button type="primary">授权公众号</Button>
            <span className="hz-page-content-action-description">
                <Popover placement="bottomLeft" content={<div><p>为保证所有功能正常,</p><p>授权时请保持默认选择，把权限统一授权给51赞</p></div>}>
                    <Icon className="hz-text-primary hz-icon-size-default" type="question-circle"/> 使用教程
                </Popover>
            </span>
            <Button type="primary" onClick={this.createXinMaHandler}><Icon type="plus"/>创建新码</Button>
        </div>)

        return (
            <DocumentTitle title="Demo-列表页">
                <Page>
                    <Page.ContentHeader
                        tabs={<Page.ContentHeader.Tabs 
                            onChange={this.onChange} 
                            defaultActive='import' 
                            options={[{label:'店铺订单', value: 'dianpu'}, {label: '导入订单', value: 'import'}]}
                        />}
                        help={<a href='http://www.baidu.com' target='_blank' rel="nofollow me noopener noreferrer"><Icon type="book"></Icon> 帮助</a>}
                        subTitle="支付宝：种草莓的毛毛"
                        description="绑定已开通企业支付到零钱功能的微信服务号，即可开通小红包功能，登录云聊给客户发红包，请务必保障公众号商户平台余额充足！"
                        action={action}
                    />

                    <Page.ContentAdvSearch>
                        <Form layout="horizontal" className="hz-from-search">
                            <Row>
                                <Col span={8}>
                                    <Form.Item label="起止时间" {...formItemLayout}>
                                        <RangePicker/>
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
                                        <Input placeholder="输入订单号"/>
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item label="相关订单号"  {...formItemLayout}>
                                        <Input placeholder="输入订单号"/>
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={8}>
                                    <Col span={3} style={{width: '80px'}}></Col>
                                    <Col span={16}>
                                        <Button className="hz-btn-width-default" type="primary" htmlType="submit">
                                            <Icon type="search"/>
                                            搜索
                                        </Button>
                                        <Button className="hz-btn-width-default hz-margin-base-left">
                                            重置
                                        </Button>
                                    </Col>
                                </Col>
                            </Row>
                        </Form>
                    </Page.ContentAdvSearch>

                    <Table columns={columns} dataSource={data}/>
                </Page>
            </DocumentTitle>
        )
    }
}
