/**
 **@Description:
 **@author: 吴明
 */

import React, {Component} from 'react'
import { Select,Form, Row, Col, Input, Button, Icon, Divider , Table, Pagination} from 'antd'
import {connect} from 'dva'
import documentTitleDecorator from 'hoc/documentTitle'
import Page, { DEFAULT_PAGER , DEFAULT_PAGER_FILTER} from '../../../../components/business/Page'
import {Link} from 'dva/router'
import ErrorModal from './editName'
import styles from './index.less'

const DEFAULT_CONDITION = {
    mobile:'',
    order_count:''
}

@connect(({base,mall_customer}) => ({
    base,
    mall_customer
}))


@Form.create()
@documentTitleDecorator({
    title:'商城用户'
})
export default class extends Page.ListPureComponent {

    constructor ( props) {
        super(props)
        this.state = {

            visible: false,
            name:'',
            id:'',
            index:'',
            condition: {...DEFAULT_CONDITION},
            pager: {...DEFAULT_PAGER}
        }
    }

    initPage = (isSetHistory = false) => {
        const condition = this.getParamForObject(DEFAULT_CONDITION, this.props.location.query)
        const pager = this.getParamForObject(DEFAULT_PAGER, this.props.location.query, DEFAULT_PAGER_FILTER)

        const { mobile, order_count} = condition

        this.getPageData(condition, pager, isSetHistory)
        
        this.props.form.setFieldsValue({
            'order_count': order_count,
            'mobile': mobile,
        })
    }

    getPageData = (condition, pager, isSetHistory = true,callback) => {
        if( isSetHistory ){
            this.history(condition, pager)
        }

        this.setState({
            condition: condition,
            pager: pager
        })
        
        this.props.dispatch({
            type: 'mall_customer/customerList',
            payload: {
                page: pager.current - 1,
                per_page: pager.pageSize,
                order_count:condition.order_count,
                mobile:condition.mobile
            },
            callback: (data) => {

            }
        })
    }
    handleSearch = (e) => {
        e.preventDefault()
        const { form } = this.props
        form.validateFields((error,value) => {
            if(!error){
                const condition = {
                    ...this.state.condition,
                    ...{
                        order_count:value.order_count,
                        mobile:value.mobile
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

    edit = (record,index) =>{
        this.setState({
            visible:true,
            index:index,
            name:record.name,
            id:record.id
        })
    }
    checkMoble = (rule, value, callback) => {
        if(value && !(/^1[3-9]\d{9}$/.test(value))){
            callback('请输入正确的手机号')
        }else{
            callback()
        }
    }

    cancelEdit = () =>[
        this.setState({
            visible:false
        })
    ]
    render() {
        const Option = Select.Option
        const FormItem = Form.Item
        const { getFieldDecorator } = this.props.form
        const columns = [{
            title: '姓名',
            dataIndex: 'name',
            key: 'name'
        },{
            title: '手机号码',
            dataIndex: 'mobile',
            key: 'mobile',
        },{
            title: '微信昵称',
            dataIndex: 'nick_name',
            key: 'nick_name'
        },{
            title: '拥有订单数',
            dataIndex: 'order_count',
            key: 'order_count'
        },{
            title: '操作',
            dataIndex: 'order_no',
            key: 'order_no',
            render:(text, record, index) => {
                return (
                    <div>
                        <span className={styles.edit} onClick={()=>{this.edit(record,index)}}>编辑</span>
                        <Divider type="vertical" />
                        <Link to={{pathname:'/mall/customer/customer_order',query:{id:record.id}}}>详情</Link>
                    </div>
                )
            }
        }]
        const formItemLayout = {
            labelCol: {
                span: 6,
                style: {
                    width: '76px',
                    textAlign: 'right'
                },
            },
            wrapperCol: {
                span: 16,
            },
        }
        const { current, pageSize } = this.state.pager
        const { data,count, loading } = this.props.mall_customer
        return (
            <Page className={styles.formSearch}>
                <Page.ContentHeader
                    title="商城用户"
                    helpUrl="http://newhelp.51zan.cn/manual/content/%E8%99%8E%E8%B5%9E%E5%B0%8F%E5%BA%97/%E5%95%86%E5%9F%8E%E7%94%A8%E6%88%B7.md"
                />
                <Page.ContentAdvSearch multiple={false}>
                    <Form layout="horizontal" className="hz-from-search" >
                        <Row>
                            <Col span={8}>
                                <FormItem label="手机号码："  {...formItemLayout}>
                                    {getFieldDecorator('mobile', {
                                        rules: [{
                                            validator: this.checkMoble,
                                        }]
                                    })(
                                        <Input placeholder="请输入手机号码" />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="购买次数：" {...formItemLayout}>
                                    {getFieldDecorator('order_count')(
                                        <Select>
                                            <Option value="">不限</Option>
                                            <Option value="1">1+</Option>
                                            <Option value="5">5+</Option>
                                            <Option value="10">10+</Option>
                                            <Option value="20">20+</Option>
                                            <Option value="50">50+</Option>
                                            <Option value="100">100+</Option>
                                        </Select>
                                    )}
                                   
                                </Form.Item>
                            </Col>
                            <Col span={4}>
                                <Form.Item {...formItemLayout}>
                                    <Button className="hz-btn-width-default" type="primary" htmlType="submit" onClick={this.handleSearch}>
                                        <Icon type="search"/>
                                        搜索
                                    </Button>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Page.ContentAdvSearch>
                <Table
                    pagination={false}
                    columns={columns}
                    loading= {loading}
                    rowKey={record => record.id}
                    dataSource={data}/>
                {data.length? (
                    <Pagination
                        className="ant-table-pagination"
                        total={count}
                        current={current}
                        showQuickJumper={true}
                        showTotal={total => `共${count}条记录`}
                        pageSize={ pageSize }
                        pageSizeOptions= {['10','20','50','100']}
                        showSizeChanger={true}
                        onShowSizeChange={this.handleListPageChangeSize}
                        onChange={this.handleListPageChange}
                    />
                ) : (
                    ''
                )}
                {/*编辑弹窗*/}
                <ErrorModal visible={this.state.visible} onCancel={this.cancelEdit}   id={this.state.id} key={this.state.id} name={this.state.name} index={this.state.index}/>
            </Page>
            
        )
    }
}
