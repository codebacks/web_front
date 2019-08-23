/**
 **@author:吴明
 */

import React ,{Fragment}from 'react'
import { connect } from 'dva'
import Page, { DEFAULT_PAGER, DEFAULT_PAGER_FILTER } from '../../../../components/business/Page'
import DocumentTitle from 'react-document-title'
import { Form, Select, Input, Button, Row, Col, Icon, Table, Divider, Modal, Pagination, Badge } from 'antd'
import Detail from './Detail'
import AfterSale from './AfterSale'
import {datetime} from '@/utils/display'
import styles from './index.less'

const DEFAULT_CONDITION = {
    type: '',
    status: '',
    no:''
}

const PAY_TYPE={
    1:"未付款",
    3:'已完成',
    4:'待发货',
    5:'已发货',
    6:'已关闭'
}

const ORDER_TYPE={
    1:"社交零售软件购买",
    2:'社交零售手机购买',
    3:'社交零售短信充值' 
}

const PAID_CHHANNEL={
    'wx_pub_qr':'微信',
    'alipay_pc_direct':'支付宝',
    "native_b2b":'对公转账'
}
@Form.create({})
@connect(({ base, setting_service_log }) => ({
    base, setting_service_log
}))
export default class extends Page.ListPureComponent {
    constructor(props){
        super()
        this.state = {
            condition: { ...DEFAULT_CONDITION },
            pager: { ...DEFAULT_PAGER },
            index:0,
            visible:false,
            afterSaleVisible:false,
            afterSaleTip:false
        }
    }
    

    initPage = (isSetHistory = false) => {
        const condition = this.getParamForObject(DEFAULT_CONDITION, this.props.location.query)
        const pager = this.getParamForObject(DEFAULT_PAGER, this.props.location.query, DEFAULT_PAGER_FILTER)

        this.getPageData(condition, pager, isSetHistory)

        const { no,type,status } = condition

        this.props.form.setFieldsValue({
            no: no,
            status: status || undefined,
            type: type || undefined
        })
    }

    getPageData = (condition, pager, isSetHistory = true, callback) => {
        if (isSetHistory) {
            this.history(condition, pager)
        }

        this.setState({
            condition: condition,
            pager: pager,
            loading: true,
            index:0
        })

        this.props.dispatch({
            type: 'setting_service_log/getTableList',
            payload: {
                offset: (pager.current - 1) * pager.pageSize,
                limit: pager.pageSize,
                type: condition.type,
                status: condition.status,
                no:condition.no
            },
            callback: (data) => {
                this.setState({
                    loading: false
                })
                callback && callback(data)
            }
        })
    }

    // 搜索
    searchData = () => {
        this.props.form.validateFields((err, values) => {
            const condition = {
                ...this.state.condition,
                ...{
                    type: values['type'],
                    status: values['status'],
                    no:values['no']
                },
            }

            const pager = {
                pageSize: this.state.pager.pageSize,
                current: DEFAULT_PAGER.current
            }

            this.getPageData(condition, pager)
        })
    }

    searchSubmitHandle = () => {
        this.searchData()
    }

    resetSearchHandler = () => {
        this.props.form.resetFields()
        this.searchData()
    }

    handleOrderDetail = (index)=>{
        this.setState({
            visible:true,
            index:index
        })
    }
    hideOrderDetail = ()=>{
        this.setState({
            visible:false
        })
    }
    hideAfterSale= (value)=>{
        this.setState({
            afterSaleVisible:false
        })
        if(value){
            this.setState({
                afterSaleTip:true,
            })
        }
    }
    handleAfterSale = (index)=>{
        this.setState({
            afterSaleVisible:true,
            index:index
        })
    }
    HideAfterSaleTip = ()=>{
        this.setState({
            afterSaleTip:false,
        })
    }

    belongToOrderNo =(record)=>{
        let bugPhone= record.order_item.length>1?record.order_item.filter(item=>item.type === 2):[]
        if(bugPhone.length>0){
            return bugPhone[0].no
        }
        return '--'
    }
    render() {
        const FormItem = Form.Item
        const Option = Select.Option
        const { getFieldDecorator } = this.props.form
        const { current, pageSize } = this.state.pager
        const { data , total} = this.props.setting_service_log 
        const {index,visible,afterSaleTip,loading} = this.state
        const formItemLayout = {
            labelCol: {
                span: 6,
                style: {
                    width: '69px',
                    textAlign: 'right',
                },
            },
            wrapperCol: {
                span: 16,
            },
        }
        const columns = [{
            title: '商品名称',
            dataIndex: 'type',
            key:'type',
            render:(text,record)=>ORDER_TYPE[text]
        },{
            title: '订单编号',
            dataIndex: 'no',
            key:'no'
        },
        // {
        //     title: '从属子订单号',
        //     render:(text,record)=>this.belongToOrderNo(record)
        // },
        {
            title: '下单时间',
            dataIndex: 'created_at',
            key:'created_at',
            render:(text,record)=>{
                return text?text:'--'
            }
        },{
            title: '付款时间',
            dataIndex: 'paid_at',
            key:'paid_at',
            render:(text,record)=>{
                return text?text:'--'
            }
        },{
            title: '发货时间',
            dataIndex: 'delivery_at',
            key:'delivery_at',
            render:(text,record)=>{
                return text?text:'--'
            }
        },{
            title: '付款方式',
            dataIndex: 'paid_channel',
            key:'paid_channel',
            render:(text,record)=>PAID_CHHANNEL[text]
        },{
            title: '订单状态',
            dataIndex: 'status',
            key:'status',
            render:(text,record)=>{
                switch(text){
                    case 1:
                        return <span>  <Badge status="warning" /> {PAY_TYPE[text]}</span>
                    case 4:
                        return <span>  <Badge status="processing" /> {PAY_TYPE[text]}</span>
                    case 3:
                        return <span>  <Badge status="Success" /> {PAY_TYPE[text]}</span>
                    case 5:
                        return <span>  <Badge status="default" /> {PAY_TYPE[text]}</span>
                    case 6:
                        return <span>  <Badge status="default" /> {PAY_TYPE[text]}</span>    
                }
            }
        },{
            title: '操作',
            dataIndex:'id',
            render:(text,record,index)=>{
                return  record.status === 5? 
                    <Fragment>
                        <a onClick={()=>{this.handleOrderDetail(index,record)}}>详情</a>
                        <Divider type="vertical" />
                        <a onClick={()=>{this.handleAfterSale(index,record)}}>申请售后</a>
                    </Fragment>  
                    :<a onClick={()=>{this.handleOrderDetail(index,record)}}>详情</a>
            }
        }]
        return (
            <DocumentTitle title="服务记录">
                <Page>
                    <Page.ContentHeader
                        title="服务记录"
                    />
                    <Page.ContentAdvSearch>
                        <Form layout="horizontal" className="hz-from-search">
                            <Row>
                                <Col span={8}>
                                    <FormItem label="商品名称" {...formItemLayout}>
                                        {getFieldDecorator('type', {})(
                                            <Select placeholder='请选择商品名称' allowClear>
                                                <Option value= '1'>	社交零售软件购买</Option>
                                                <Option value= '2'> 社交零售手机购买</Option>
                                                <Option value= '3'>社交零售短信充值</Option>
                                            </Select>
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={8}>
                                    <FormItem label="订单状态" {...formItemLayout}>
                                        {getFieldDecorator('status', {})(
                                            <Select placeholder='请选择订单状态' allowClear>
                                                <Option value= '1'>未付款</Option>
                                                <Option value= '4'>待发货</Option>
                                                <Option value= '3'>已完成</Option>
                                                <Option value= '5'>已发货 </Option>
                                                <Option value= '6'>已关闭 </Option>
                                            </Select>    
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={8}>
                                    <FormItem label="订单编号" {...formItemLayout}>
                                        {getFieldDecorator('no', {})(
                                            <Input placeholder='请输入订单编号' />
                                        )}
                                    </FormItem>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={8}>
                                    <Col span={3} style={{ width: '69px' }}></Col>
                                    <Col span={16}>
                                        <Button className="hz-btn-width-default" type="primary" htmlType="submit" onClick={this.searchSubmitHandle}>
                                            <Icon type="search" />
                                            搜索
                                        </Button>
                                        <Button className="hz-btn-width-default hz-margin-base-left" onClick={this.resetSearchHandler}>
                                            重置
                                        </Button>
                                    </Col>
                                </Col>
                            </Row>
                        </Form>
                    </Page.ContentAdvSearch>
                    <Table
                        pagination={false}
                        columns={columns}
                        className = {styles.service_log}
                        dataSource={data}
                        loading={loading}
                        rowKey="id"
                    />
                    {
                        total>0?
                            <Pagination
                                className="ant-table-pagination"
                                total={total}
                                current={current}
                                showQuickJumper={true}
                                showTotal={total => `共${total}条记录`}
                                pageSize={ pageSize }
                                pageSizeOptions= {['10','20','50','100']}
                                showSizeChanger={true}
                                onShowSizeChange={this.handleListPageChangeSize}
                                onChange={this.handleListPageChange}
                            /> : ''
                    }
                    <Detail
                        index={index}
                        visible={visible}
                        key={'type='+this.state.visible}
                        onClose={this.hideOrderDetail}
                    />
                    <AfterSale
                        onClose={this.hideAfterSale}
                        index={index}
                        key={this.state.afterSaleVisible}
                        visible={this.state.afterSaleVisible}
                    />
                    <Modal
                        visible={afterSaleTip}
                        className={styles.afterSaleDesc}
                        centered={true}
                        width={480}
                        footer={null}
                        closable={false}
                        maskClosable={false}
                    >
                        <p><img src={require('../../assets/images/icon_attention@2x.png')} /><span className={styles.payTip}>提示</span></p>
                        <p style={{paddingLeft:'28px'}}>申请成功！稍后虎赞客服人员会联系您处理，谢谢！</p>
                        <Button type="primary" style={{float:'right'}}  onClick={()=>{this.HideAfterSaleTip()}}>
                            确定
                        </Button>
                    </Modal>
                </Page>
            </DocumentTitle>
        )
    }
}
