/**
 **@Description:
 **@author: 吴明
 */

import React, {Component} from 'react'
import { Select,Form, Row, Col, DatePicker , Button, Table, Pagination, Icon, Popover } from 'antd'
import {connect} from 'dva'
import Page, { DEFAULT_PAGER, DEFAULT_PAGER_FILTER } from '../../../../../components/business/Page'
import styles from './index.less'
import {jine} from '../../../../../utils/display'
import {Link} from 'dva/router'
import documentTitleDecorator from 'hoc/documentTitle'
import moment from 'moment'
const DEFAULT_CONDITION = {
    begin_at:'',
    end_at:'',
    status:undefined
}
const FormItem = Form.Item
const {  RangePicker } = DatePicker
@connect(({base,platform_voicepacket}) => ({
    base,platform_voicepacket
}))
@Form.create()
@documentTitleDecorator({
    title:'充值记录'
})
export default class  extends  Page.ListPureComponent {
    constructor ( props) {
        super(props)
        this.state = {
            condition: {...DEFAULT_CONDITION},
            pager: {...DEFAULT_PAGER}
        }
    }

    initPage = (isSetHistory = false) => {
        const condition = this.getParamForObject(DEFAULT_CONDITION, this.props.location.query)
        const pager = this.getParamForObject(DEFAULT_PAGER, this.props.location.query, DEFAULT_PAGER_FILTER)

        const { begin_at,
            end_at,
            status
        } = condition

        this.getPageData(condition, pager, isSetHistory)
        this.props.form.setFieldsValue({
            'tradeType':status,
            'rangePicker': begin_at && end_at ? [moment(begin_at),moment(end_at)] : [],
        })
    }
    handleSearch = (e) => {
        if(e){
            e.preventDefault()
        }
        
        this.props.form.validateFields((err, value) => {
            if(!err){
                let begin_at = '', end_at = ''
                if (value.rangePicker && value.rangePicker.length !== 0) {
                    begin_at = value.rangePicker[0].format('YYYY-MM-DD')
                    end_at = value.rangePicker[1].format('YYYY-MM-DD')
                }
                const condition = {
                    ...this.state.condition,
                    ...{    
                        begin_at: begin_at,
                        status: value.status,
                        end_at: end_at   
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
    resetSearch = () =>{
        this.props.form.resetFields()
        this.handleSearch()
    }
    handleOpenPayment = (no)=>{
        window.open(`/platform/voice_packets/wechatPay?no=${no}`,'_blank')
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
            type: 'platform_voicepacket/rechargeList',
            payload: {
                offset: (pager.current - 1)*pager.pageSize,
                limit: pager.pageSize,
                status: condition.status,
                begin_at: condition.begin_at,
                end_at: condition.end_at ,
            },
            callback:()=>{
                
            }
        })
    }
    render() {
        const Option = Select.Option
        const columns = [{
            title: '充值时间',
            dataIndex: 'created_at',
            key: 'created_at'
        },{
            title: '交易状态',
            dataIndex: 'status',
            key: 'status',
            render:(text,record,index) =>{
                switch(text){
                    case 1:
                        return <span>等待付款</span>
                    case 2:
                        return <span>付款成功</span>
                    case 3:
                        return <span>支付异常</span>
                    case 4:
                        return <span>支付过期</span>
                }
            }
        },{
            title: '充值金额（元）',
            dataIndex: 'paid_amount',
            key: 'paid_amount',
            render: (text, record) => (
                <span>{jine(text,'','Fen')}</span>    
            ),
        },{
            title: '到账金额（元）',
            dataIndex: 'charge_amount',
            key: 'charge_amount',
            render: (text, record) => (
                <span>{jine(text,'','Fen')}</span>    
            ),
        },{
            title: '到账时间',
            dataIndex: 'paid_at',
            key: 'paid_at',
            render: (text, record) => (
                <span>{text?text:'--'}</span>    
            ),
        },{
            title: '订单编号',
            dataIndex: 'no',
            key: 'no'
        },{
            title: '账户余额（元）',
            dataIndex: 'balance_amount',
            key: 'balance_amount',
            render: (text, record) => (
                <span>{text?jine(text,'','Fen'):'--'}</span>    
            ),
        },{
            title: '操作',
            render: (text, record) => (
                record.status === 1? <a onClick={()=>{this.handleOpenPayment(record.no)}}>立即付款</a>:'--'    
            )
        }]
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
        const { getFieldDecorator } = this.props.form
        const { current, pageSize } = this.state.pager
        const {loading,rechargeList,count} = this.props.platform_voicepacket
        return (
            <Page>
                <Page.ContentHeader
                    title="充值记录"
                    helpUrl='http://newhelp.51zan.cn/manual/content/%E8%90%A5%E9%94%80%E5%B9%B3%E5%8F%B0/%E8%AF%AD%E9%9F%B3%E7%BA%A2%E5%8C%85.md'
                />
                <Page.ContentAdvSearch>
                    <Form layout="horizontal" className="hz-from-search" onSubmit={this.handleSearch}>
                        <Row>
                            <Col span={8}>
                                <FormItem label="充值日期" {...formItemLayout}>
                                    {getFieldDecorator('rangePicker')(
                                        <RangePicker style={{width:'100%'}}  />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem label="交易状态" {...formItemLayout}>
                                    {getFieldDecorator('status')(
                                        <Select  placeholder='选择交易状态' allowClear>
                                            <Option  value='1'>等待付款</Option>
                                            <Option  value='2'>付款成功</Option>
                                            <Option  value='3'>支付异常</Option>
                                            <Option  value='4'>支付过期</Option>
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <Button style={{'marginTop':'3px'}} type="primary" htmlType="submit" >
                                    <Icon type="search"/>
                                    搜索
                                </Button>
                                <Button style={{'marginTop':'3px','width':'82px',marginLeft:16}}  onClick={this.resetSearch}>
                                    重置
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Page.ContentAdvSearch>
                <Table
                    pagination={false}
                    columns={columns}
                    loading= {loading}
                    rowKey={(record,index) => index}
                    dataSource={rechargeList}/>
                {rechargeList.length? (
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
            </Page>
        )
    }
}
