'use strict'

import React, { Fragment } from 'react'
import { connect } from 'dva'
import { Table, Pagination, Button, Form, Row, DatePicker, Tabs, Col, Divider,Input, Icon, Popconfirm, message, Badge, Popover } from 'antd'
import documentTitleDecorator from 'hoc/documentTitle'
import numeral from 'numeral'
import Page, { DEFAULT_PAGER, DEFAULT_PAGER_FILTER } from '../../../../components/business/Page'
import styles from './index.scss'
import config from 'crm/common/config'
import router from 'umi/router'
import moment from 'moment'

const { RangePicker } = DatePicker
const TabPane = Tabs.TabPane

const { pageSizeOptions } = config

const DEFAULT_CONDITION = {
    keyword: ''
}

@connect(({ base, sms_managamnet }) => ({
    base,
    sms_managamnet
}))
@documentTitleDecorator({
    title: '模版管理'
})
@Form.create()
export default class extends Page.ListPureComponent {
    constructor(props) {
        super()
        this.state = {
            loading: false,
            tab: '',
            pager: {
                ...DEFAULT_PAGER
            },
            model: {
                visible: false,
                id: null
            },
            condition:{
                ...DEFAULT_CONDITION
            }
        }

    }


    initPage = (isSetHistory = false) => {
        const condition = this.getParamForObject(DEFAULT_CONDITION, this.props.location.query)
        const pager = this.getParamForObject(DEFAULT_PAGER, this.props.location.query, DEFAULT_PAGER_FILTER)
        const { keyword } = condition

        this.getPageData(condition, pager, isSetHistory)
        this.props.form.setFieldsValue({
            keyword
        })
    }
    
    ceateTemplate = (e) => {
        e.preventDefault()
        router.push('/crm/sms_management/create_management')
    }
    edit = (id) => {
        router.push(`/crm/sms_management/create_management?id=${id}`)
    }
    
    getPageData = (condition, pager, isSetHistory = true,callback) => {
        if( isSetHistory ){
            this.history(condition, pager)
        }
        this.setState({
            condition:{...condition} ,
            pager: pager,
            loading: true
        })

        this.props.dispatch({
            type: 'sms_managamnet/getMsmTemplateList',
            payload:{
                keyword:condition.keyword,
                offset: (pager.current - 1)*pager.pageSize,
                limit: pager.pageSize,
            },
            callback: (data) => {
                this.setState({
                    loading: false
                })
            }
        })
    }



    handleSearch = (e) => {
        // this.smsTemplateList()
        if(e){
            e.preventDefault()
        }
        this.props.form.validateFields((err, value) => {
            if(!err){
                const condition = {
                    ...this.state.condition,
                    ...{    
                        keyword:value.keyword
                    }
                }

                const pager = {
                    pageSize : this.state.pager.pageSize,
                    current : DEFAULT_PAGER.current
                }
                
                this.getPageData(condition, pager)
            }
        })   
    }
    confirm = (id) => {
        this.props.dispatch({
            type: 'sms_managamnet/deleteMsmTemplate',
            payload: id,
            callback: () => {
                message.success('删除短信模板成功')
                this.handleSearch()
            }
        })
    }

    render() {
        const { list, total } = this.props.sms_managamnet
        const formItemLayout = {
            labelCol: {
                span: 6,
                style: {
                    width: '60px',
                    textAlign: 'right',
                },
            },
            wrapperCol: {
                span: 16,
            },
        }
        const TYPE = {
            1:'营销',
            2:'加粉'
        }
        const columns = [
            {
                title: '模版名称',
                dataIndex: 'name',
                key: 'name'
            },
            {
                title: '短信类型',
                dataIndex: 'type',
                key: 'type',
                render: (data) => TYPE[data]
            },
            {
                title: '短信内容',
                width: 300,
                dataIndex: 'content',
                key: 'content',
                render: (content) =>
                    <Popover placement="top" content={
                        <p className={styles.table__content__popover}>
                            {content}
                        </p>
                    } trigger="hover">
                        <div className={styles.table__content}>{content}</div>
                    </Popover>

            },
            {
                title:'创建人',
                dataIndex:"creator",
                key:"creator"
            },
            {
                title: '发送短信数',
                dataIndex: 'send_count',
                key: 'send_count',
                render: (data) => data > 0 ? numeral(data).format('0,0') : '--'
            },
            {
                title: '发送人次',
                dataIndex: 'unique_mobile_count',
                key: 'unique_mobile_count',
                render: (data) => data > 0 ? numeral(data).format('0,0') : '--'
            },
            {
                title: '操作',
                dataIndex: 'id',
                key: 'id',
                render: (id) => <Fragment> 
                    <a onClick={e => this.edit(id)}>编辑</a>
                    <Divider type="vertical" />
                    <Popconfirm placement="bottomRight" title={"您是否确定删除此模板？"} onConfirm={e => this.confirm(id)} okText="删除" cancelText="取消">
                        <a onClick={e => e.preventDefault()}>删除</a>
                    </Popconfirm>
                </Fragment>
            }
        ]
        const { getFieldDecorator } = this.props.form
        const { current, pageSize } = this.state.pager
        return (
            <Page className={styles.formSearch}>
                <Page.ContentHeader
                    title="模板管理"
                    action={<Button type="primary" onClick={this.ceateTemplate}><Icon type="plus" /> 新建模版</Button>}
                    helpUrl="http://newhelp.51zan.cn/manual/content/%E5%AE%A2%E6%88%B7%E7%AE%A1%E7%90%86/%E7%9F%AD%E4%BF%A1%E7%AE%A1%E7%90%86.md"
                />
                <Page.ContentAdvSearch>
                    <Form layout="horizontal" className="hz-from-search"  onSubmit={this.handleSearch}>
                        <Row>
                            <Col span={8}>
                                <Form.Item style={{ marginBottom: 0 }} label="关键字：" {...formItemLayout}>
                                    {
                                        getFieldDecorator('keyword', {})(
                                            <Input placeholder="模板名称或内容" maxLength={30} />
                                        )
                                    }
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item style={{ marginBottom: 0 }}>
                                    <Button className="hz-btn-width-default" type="primary" htmlType="submit">
                                        <Icon type="search" />
                                        搜索
                                    </Button>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Page.ContentAdvSearch>
                <Table
                    columns={columns}
                    dataSource={list}
                    className="ant-table-pagination"
                    rowKey={(record, index) => index}
                    pagination={false}
                    loading={this.state.loading}
                />

                {list.length ? (<Pagination
                    className="ant-table-pagination"
                    total={total}
                    current={current}
                    showQuickJumper={true}
                    pageSizeOptions={pageSizeOptions}
                    showTotal={total => `共 ${total} 条`}
                    pageSize={pageSize}
                    showSizeChanger={true}
                    onShowSizeChange={this.handleListPageChangeSize}
                    onChange={this.handleListPageChange}
                />) : ('')}
            </Page>
        )
    }
}
