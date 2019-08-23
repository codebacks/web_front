'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: wuming
 * 创建日期:
 */
import React from 'react'
import {Form, Button, Row, Col, Tabs,DatePicker,Table,Input,Select,Pagination} from 'antd'
import {connect} from 'dva'
import documentTitleDecorator from 'hoc/documentTitle'
import 'moment/locale/zh-cn'
import moment from 'moment'
// import Page from 'components/business/Page'
import Page, { DEFAULT_PAGER , DEFAULT_PAGER_FILTER} from '../../../../../components/business/Page'

import {Link} from 'dva/router'
import styles from './index.less'
moment.locale('zh-cn')


const DEFAULT_CONDITION = {
    begin_at: '',
    end_at: '',
    no: '',
    status: '',
    type: '',
    id:'',
    status:''
}
@Form.create()

@connect(({mall_customer,base}) => ({
    base,
    mall_customer
}))
@documentTitleDecorator({
    title:'订单列表'
})
export default class extends Page.ListPureComponent {

    constructor(props) {
        super()
        this.state = {
            condition: {...DEFAULT_CONDITION},
            pager: {...DEFAULT_PAGER}
        }
    }

    initPage = (isSetHistory = false) => {
        const condition = this.getParamForObject(DEFAULT_CONDITION, this.props.location.query)
        const pager = this.getParamForObject(DEFAULT_PAGER, this.props.location.query, DEFAULT_PAGER_FILTER)

        const { no, type, begin_at, end_at } = condition

        this.getPageData(condition, pager, isSetHistory)
        this.props.form.setFieldsValue({
            'no': no,
            'type': type?type:undefined,
            'rangePicker': begin_at && end_at ? [moment(begin_at),moment(end_at)] : [],
        })
    }

    getPageData = (condition, pager, isSetHistory = true,callback) => {
        if( isSetHistory ){
            this.history(condition, pager)
        }

        this.setState({
            condition: condition,
            pager: pager,
        })
        this.props.dispatch({
            type: 'mall_customer/customerOrderList',
            payload: {
                page: pager.current - 1,
                per_page: pager.pageSize,
                id: this.props.location.query.id,
                begin_at: condition.begin_at,
                end_at:  condition.end_at,
                no:  condition.no,
                status: condition.status,
                type:  condition.type,
            },
            callback: (data) => {
            }
        })
    }

    searchData = () => {
        const { form } = this.props
        
        form.validateFields((error,value) => {

            let beginAt = '', endAt = ''
            
            if (value.rangePicker && value.rangePicker.length !== 0) {
                beginAt = value.rangePicker[0].format('YYYY-MM-DD')
                endAt = value.rangePicker[1].format('YYYY-MM-DD')
            }

            const condition = {
                ...this.state.condition,
                ...{
                    begin_at: beginAt,
                    end_at:  endAt,
                    no:  value.no,
                    type:  value.type,
                }
            }

            const pager = {
                pageSize : this.state.pager.pageSize,
                current : DEFAULT_PAGER.current
            }
            
            this.getPageData(condition, pager)
        })
    }

    //订单状态
    statusTypes = (record) => {
        switch (record.status) {
            case  405 :
                return <span className={styles.circleGray}>已完成</span>
            case  400:
                return <span className={styles.circleGreen}>已发货</span>
            case  200 :
                return <span className={styles.circleOrange}>待付款</span>
            case  205 :
                return <span className={styles.circleBlue}>待发货</span>
            case  255 :
                return <span className={styles.circleBlue}>待成团</span>
            case  207 :
                return <span className={styles.circleRed}>已取消</span>
            default:
                return null
        }
    }
    statusChange = (value) =>{
        let {condition, pager} = this.state
        condition.status = value
        pager.current = DEFAULT_PAGER.current
        this.getPageData(condition, pager)
    }

    amount = (value) =>{
        let counts = 0
        value.forEach(v=>{
            counts += v.count
        })
        return counts
    }
    orderTypes = (type) =>{
        switch (type)
        {
            case 1:
                return <span className={styles.group}>拼团</span>
            case 2:
                return <span className={styles.special}>特价</span>
            case 3:
                return <span className={styles.recommend}>推荐</span>
            default:
                return <span className={styles.general}>普通</span>
        }
    }
    render() {
        const TabPane = Tabs.TabPane
        const Option = Select.Option
        const {  RangePicker } = DatePicker
        const { getFieldDecorator } = this.props.form
        const statusList = [
            {
                tab: '全部',
                key: ''
            },
            {
                tab: '待付款',
                key: 200
            },
            {
                tab: '待发货',
                key: 205
            },
            {
                tab: '已发货',
                key: 400
            },
            {
                tab: '已完成',
                key: 405
            },
            {
                tab: '已取消',
                key: 207
            }
        ]
        const formItemLayout = {
            labelCol: {
                span: 6,
                style: {
                    width: '80px',
                    textAlign: 'right'
                },
            },
            wrapperCol: {
                span: 16,
            },
        }
        const columns = [{
            title: '订单编号',
            dataIndex: 'no',
            width:350,
            key: 'no'
        },{
            title: '商品数量',
            render: (text, record) => (
                this.amount(record.items)
            )
        },{
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (text,record)=>(
                this.statusTypes(record)
            )
        },{
            title: '收货人手机',
            dataIndex: 'mobile',
            key: 'mobile'
        },{
            title: '下单时间',
            dataIndex: 'created_at',
            key: 'created_at'
        },{
            title: '类型',
            dataIndex: 'type',
            key: 'type',
            render: (text, record) => (
                this.orderTypes(text)
            )
        },{
            title: '操作',
            render:(text,record) => {
                return (
                    record.status == 200 || record.status == 205? <Link to={{pathname:'/mall/order_list/order_detail',query:{id:record.id }}}>编辑</Link>: <Link to={{pathname:'/mall/order_list/order_detail',query:{id:record.id }}}>详情</Link>
                )
            }
        }]
        const { orderList , count, loading , params } = this.props.mall_customer
        const { current, pageSize } = this.state.pager
        return (
            <Page>
                <Page.ContentHeader
                    // hasGutter={false}
                    breadcrumbData={[{
                        name: '商城用户',
                        path: '/mall/customer'
                    },{
                        name: '订单列表'
                    }]}
                />
                <Page.ContentAdvSearch>
                    <Form layout="horizontal" className="hz-from-search" >
                        <Row>
                            <Col span={8}>
                                <Form.Item {...formItemLayout} label="订单编号：" colon={false}>
                                    {getFieldDecorator('no')(
                                        <Input placeholder="请输入订单编号" />
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item {...formItemLayout} label="订单类型："  colon={false}>
                                    {getFieldDecorator('type')(
                                        <Select placeholder='请选择订单类型'  allowClear >
                                            <Option value="4">普通订单</Option>
                                            <Option value="1">拼团订单</Option>
                                            <Option value="2">特价订单</Option>
                                            <Option value="3">推荐订单</Option>
                                        </Select>
                                    )}
                                    
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item {...formItemLayout} label="下单时间：" colon={false}>
                                    {getFieldDecorator('rangePicker')(
                                        <RangePicker style={{width:'100%'}}/>
                                    )}
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={3} style={{width: '80px'}}></Col>
                            <Col span={8}>
                                <Button type="primary" icon="search" onClick={this.searchData}>搜索</Button>
                            </Col>
                        </Row>
                    </Form>
                </Page.ContentAdvSearch>
                <Tabs activeKey={params.status} className={styles.customerTabs} onChange={(key)=>{this.statusChange(key)}}>
                    {
                        statusList.map(item =>
                            <TabPane tab={item.tab} key={item.key}>
                                <Table
                                    pagination={false}
                                    columns={columns}
                                    loading= {loading}
                                    rowKey={record => record.id}
                                    dataSource={ orderList }/>
                                { orderList.length? (
                                    <Pagination
                                        className="ant-table-pagination"
                                        total={count}
                                        current={current}
                                        showQuickJumper={true}
                                        showTotal={total => `共${count}条记录`}
                                        pageSize={pageSize }
                                        pageSizeOptions= {['10','20','50','100']}
                                        showSizeChanger={true}
                                        onShowSizeChange={this.handleListPageChangeSize}
                                        onChange={this.handleListPageChange}
                                    />
                                ) : (
                                    ''
                                )}
                            </TabPane>)
                    }
                </Tabs>

            </Page>
        )
    }
}
