/*
 * @Author: sunlzhi 
 * @Date: 2018-11-05 17:58:20 
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-03-07 16:42:38
 */

import React, {Component} from 'react'
import {Button, Icon, Table, Form, Row, Col, Pagination, Popover, DatePicker } from 'antd'
import styles from './index.less'
import Page from 'components/business/Page'
import BillSelectionTemplate from '../../model/billSelectionTemplate'
import InvoiceForm from '../../model/InvoiceForm'
import moment from 'moment'
import { jine } from 'utils/display'

const { RangePicker } = DatePicker

@Form.create()

export default class Index extends Component {
    constructor(props) {
        super(props)
        this.state = {
            visible: false,
            tabsValue: '1',
            invoiceFormVisible: false,
            invoiceFormId: '',
            selectedRowKeys: [],
            condition: {},
            pager: {
                offset: 1,
                limit: 10,
            },
            templatePager: {
                offset: 1,
                limit: 20,
            },
            // 批量操作是否可用
            disabledFunc: {
                delete: true,
            },
            amount: 0,
        }
    }

    // 页面加载调用
    componentDidMount() {
        this.props.onRef(this)
        this.payOrdersList()
    }

    // 获取发票模板列表
    getTaxpayers = () => {
        const {templatePager} = this.state
        this.props.dispatch({
            type: 'invoice/taxpayers',
            payload: {
                offset: (templatePager.offset - 1) * templatePager.limit,
                limit: templatePager.limit,
            },
            callback: () => {
            }
        })
    }

    // 清除状态
    clearState = () => {
        // 清空选中的商品
        this.setState({
            selectedRowKeys: [],
            disabledFunc: {
                delete: true,
            },
            amount: 0,
        })
    }

    // 获取未开发票付款列表
    payOrdersList = (data) => {
        const {condition, pager} = this.state
        this.props.dispatch({
            type: 'invoice/payOrders',
            payload: {
                offset: (pager.offset - 1) * pager.limit,
                limit: pager.limit,
                begin_at: condition.begin_at,
                end_at: condition.end_at,
            },
            callback: () => {
                this.clearState()
            }
        })
    }

    // 限制可以选择的时间
    disabledDate = (current) => {
        // 不能选择今天以后的日期
        return current && current > moment().subtract(0, 'days')
    }

    // 点击搜索
    handleSubmit = (e) => {
        e.preventDefault()
        this.props.form.validateFields(['time'], (err, values) => {
            if (!err) {
                const {pager} = this.state
                pager.offset = 1

                this.setState({
                    pager
                },()=>{
                    this.payOrdersList()
                })
            }
        })
    }

    // 选择每页的条数
    handleChangeSize = (value, pageSize) => {
        const { pager } = this.state
        pager.offset = 1
        pager.limit = pageSize

        this.setState({
            pager
        },()=>{
            this.payOrdersList()
        })
    }

    // 换页
    goToPage = (page) => {
        const { pager } = this.state
        pager.offset = page
        
        this.setState({
            pager
        },()=>{
            this.payOrdersList()
        })
    }
    
    // table选中状态
    onSelectChange = (selectedRowKeys) => {
        this.setState({selectedRowKeys})
        if (selectedRowKeys && selectedRowKeys.length > 0) {
            let num = 0
            const {payOrdersData} = this.props.invoice
            for (let v of payOrdersData) {
                for (let w of selectedRowKeys) {
                    if (v.id === w) {
                        num += v.amount
                    }
                }
            }
            
            this.setState({
                disabledFunc: {delete: false},
                amount: num
            })
        } else {
            this.setState({
                disabledFunc: {delete: true},
                amount: 0
            })
        }
    }

    // 点击开具发票
    addTemplate = () => {
        this.getTaxpayers()
        this.setState({
            visible: true,
            tabsValue: '1',
        })
    }

    // 打开开具发票form表单
    addTemplateForm = (e) => {
        this.setState({
            invoiceFormVisible: true,
            invoiceFormId: e,
        })
    }
    
    // 关闭开发票表单弹窗
    handleInvoiceFormCancel = (val) => {
        if (val === 2) {
            this.setState({
                visible: false,
                invoiceFormVisible: false,
            })
            this.payOrdersList()
        } else {
            this.setState({
                invoiceFormVisible: false,
            })
        }
    }

    // 关闭弹窗
    handleCancel = () => {
        this.setState({
            visible: false,
        })
    }

    // 选择电子发票和增值税发票
    handleModelTabs = (e) =>{
        this.setState({
            tabsValue: e,
        })
    }

    // 选择付款时间
    onRangePickerChange = (date, dateString) => {
        const {condition} = this.state
        condition.begin_at = dateString[0]
        condition.end_at = dateString[1]
    }

    // 跳到新增模板
    jumpAddTemplate = () => {
        this.props.jumpAddTemplate()
        // this.setState({
        //     templateVisible: true,
        // })
    }

    // 关闭新增发票模板弹窗
    templateHandleCancel = () => {
        this.setState({
            templateVisible: false,
        })
    }

    //开具发票模板列表分页跳转
    goTemplatePage = (val) => {
        const {templatePager} = this.state
        templatePager.offset = val
        this.setState({
            templatePager
        },()=>{
            this.getTaxpayers()
        })
    }

    render() {
        const {selectedRowKeys, disabledFunc, pager, visible, tabsValue, invoiceFormVisible, invoiceFormId, templatePager, amount,} = this.state
        const { payOrdersData, payOrdersPagination } = this.props.invoice
        const { getFieldDecorator } = this.props.form
        
        // 商品列表table
        const columns = [
            {
                title: '付款时间',
                dataIndex: 'paid_at',
                key: 'paid_at',
            }, {
                title: '付款内容',
                dataIndex: 'ext_info',
                key: 'ext_info',
            }, {
                title: '付款方式',
                dataIndex: 'pay_way',
                key: 'pay_way',
                render: (text, record) => {
                    let payWay = null
                    
                    switch (text) {
                        case 1:
                            payWay = '未知'
                            break
                        case 2:
                            payWay = '线下'
                            break
                        case 3:
                            payWay = '支付宝'
                            break
                        case 4:
                            payWay = '微信'
                            break
                        case 5:
                            payWay = '银联云闪付'
                            break
                        case 6:
                            payWay = '对公转账'
                            break
                        default:
                            payWay = null
                    }

                    return (
                        <div>{payWay}</div>
                    )
                },
            }, {
                title: '付款金额',
                dataIndex: 'amount',
                key: 'amount',
                render: (text, record) => {
                    return (
                        <div>{jine(text, '0,0.00', 'Fen')}</div>
                    )
                },
            },
        ]

        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
        }
        
        const formItemLayout = {
            labelCol: {
                span: 6,
                style: {
                    width: '80px',
                    textAlign: 'right',
                },
            },
            wrapperCol: {
                span: 16,
            },
        }

        const popoverContent = (
            <div>
                <p>1、发票内容为以下二选一：</p>
                <p style={{paddingLeft:10}}> ● 软件*51赞CRM客户管理系统V1.0</p>
                <p style={{paddingLeft:10}}> ● 信息技术服务*信息技术服务费</p>
                <p>2、勾选多条购买记录申请开票时，发票将合并为一张，如需单张发票，请分开申请</p>
                <p></p>
            </div>
        )

        return <div>
            <Page.ContentAdvSearch multiple={false}>
                <Form layout="horizontal" className="hz-from-search">
                    <Row>
                        <Col span={10} style={{maxWidth: 438}}>
                            <Form.Item label="付款时间" {...formItemLayout}>
                                {getFieldDecorator('time', {
                                    rules: [],
                                })(
                                    <RangePicker showTime format="YYYY-MM-DD HH:mm:ss" onChange={this.onRangePickerChange} disabledDate={this.disabledDate}/>
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={4}>
                            <Form.Item style={{marginBottom: 0}}>
                                <Button className="hz-btn-width-default" type="primary" onClick={this.handleSubmit}>
                                    <Icon type="search"/>
                                    搜索
                                </Button>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Page.ContentAdvSearch>
            <div className={styles.operationButtons}>
                <Button className={styles.button} disabled={disabledFunc.delete} onClick={this.addTemplate} type='primary' ghost>开具发票</Button>
                <Popover placement="bottomLeft" title="开具发票说明" content={popoverContent}>
                    <Icon type='question-circle' style={{color: '#4391FF'}} />
                </Popover>
                <span style={{marginLeft: 16}}>已选 {selectedRowKeys.length} 条发票记录，共计 {jine(amount, '0,0.00', 'Fen')} 元</span>
            </div>
            <Table 
                rowSelection={rowSelection}
                columns={columns}
                dataSource={payOrdersData}
                pagination={false} 
                rowKey="id"
            />
            {payOrdersPagination.rows_found > 0 &&
                <Pagination
                    className="ant-table-pagination"
                    current={pager.offset}
                    total={payOrdersPagination.rows_found}
                    showTotal={(total) => `共 ${total} 条`} 
                    showQuickJumper={true} 
                    showSizeChanger={true}
                    pageSize={pager.limit} 
                    pageSizeOptions={['10', '20', '50', '100']}
                    onShowSizeChange={this.handleChangeSize}
                    onChange={this.goToPage} />
            }
            <BillSelectionTemplate 
                visible={visible} 
                handleCancel={this.handleCancel} 
                tabsValue={tabsValue}
                pager={templatePager}
                handleModelTabs={this.handleModelTabs}
                goTemplatePage={this.goTemplatePage}
                jumpAddTemplate={this.jumpAddTemplate}
                addTemplateForm={this.addTemplateForm}
                {...this.props}/>
            <InvoiceForm
                key={'InvoiceForm'+invoiceFormId+JSON.stringify(selectedRowKeys)}
                id={invoiceFormId}
                visible={invoiceFormVisible} 
                handleCancel={this.handleInvoiceFormCancel} 
                tabsValue={tabsValue}
                selectedRowKeys={selectedRowKeys}
                amount={amount}
                jumpTabs={this.jumpTabs}
                {...this.props}
            />
        </div>
    }
}
