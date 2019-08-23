/*
 * @Author: sunlzhi 
 * @Date: 2018-11-07 17:56:07 
 * @Last Modified by: sunlizhi
 * @Last Modified time: 2018-12-11 17:20:05
 */

import React, {Component} from 'react'
import {Button, Icon, Modal, Table, Form, Row, Col, Input, Pagination, DatePicker } from 'antd'
import styles from './index.less'
import Page from 'components/business/Page'
import InvoiceDetail from '../../model/InvoiceDetail'
import LogisticsInfo from '../../model/LogisticsInfo'
import BillSelectionTemplate from '../../model/billSelectionTemplate'
import InvoiceForm from '../../model/InvoiceForm'
import PDFpreview from '../../model/PDFpreview'
import moment from 'moment'
import { jine } from 'utils/display'

const confirm = Modal.confirm
const { RangePicker } = DatePicker

@Form.create()

export default class Index extends Component {
    constructor(props) {
        super(props)
        this.state = {
            visible: false,
            logisticsInfoVisible: false,
            PDFpreviewVisible: false,
            tabsValue: '1',
            modelTabsDisabled: {
                electronicInvoice: false,
                valueAddedTaxInvoice: false,
            },
            authInfoData: [],
            record: {},
            selectionTemplateVisible: false,
            invoiceFormId: '',
            invoiceFormVisible: false,
            condition: {},
            pager: {
                offset: 1,
                limit: 10,
            },
            templatePager: {
                offset: 1,
                limit: 20,
            },
        }
    }

    // 页面加载调用
    componentDidMount() {
        this.props.onRef(this)
        this.invoicesList()
    }

    // 获取发票列表
    invoicesList = () => {
        const {condition, pager} = this.state
        this.props.dispatch({
            type: 'invoice/invoicesList',
            payload: {
                offset: (pager.offset - 1) * pager.limit,
                limit: pager.limit,
                begin_at: condition.begin_at,
                end_at: condition.end_at,
                no: condition.no,
            },
            callback: () => {}
        })
    }

    // 限制可以选择的时间
    disabledDate = (current) => {
        // 不能选择今天以后的日期
        return current && current > moment().subtract(0, 'days')
    }

    // 模态弹窗取消（关闭）
    handleCancel = () => {
        this.setState({
            formVisible: false,
            payConfigureVisible: false,
        })
    }

    // 点击搜索
    handleSubmit = (e) => {
        e.preventDefault()
        this.props.form.validateFields(['invoiceSerialNumber', 'applicationTime'], (err, values) => {
            // console.log(values)
            if (!err) {
                const {condition, pager} = this.state
                pager.offset = 1
                condition.no = values.invoiceSerialNumber

                this.setState({
                    pager,
                    condition
                },()=>{
                    this.invoicesList()
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
            this.invoicesList()
        })
    }

    // 换页
    goToPage = (page) => {
        const { pager } = this.state
        pager.offset = page
        
        this.setState({
            pager
        },()=>{
            this.invoicesList()
        })
    }

    // 撤销此发票申请
    onRevokeConfirm = (record) => {
        confirm({
            title: `是否确认撤销？`,
            content: `撤回后已提交的数据不再保留，需重新开具发票。`,
            maskClosable: true,
            centered: true,
            onOk: () => {
                this.props.dispatch({
                    type: 'invoice/withdrawInvoices',
                    payload: {
                        id: record.id,
                        status: 5,
                    },
                    callback: () => {
                        this.invoicesList()
                    }
                })
            },
            onCancel() {
            },
        })
    }
    
    // 发票明细
    onInvoiceDetail = (record) => {
        this.setState({
            record,
            visible: true,
        })
    }

    // 跳到新增模板
    jumpAddTemplate = (obj) => {
        this.props.jumpAddTemplate()
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
                selectionTemplateVisible: false,
                invoiceFormVisible: false,
            })
            this.invoicesList()
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

    // 关闭物流信息弹窗
    logisticsInfoHandleCancel = () => {
        this.setState({
            logisticsInfoVisible: false,
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
        // console.log(date, dateString)
        const {condition} = this.state
        condition.begin_at = dateString[0]
        condition.end_at = dateString[1]
    }

    // 修改发票信息
    onInvoiceModify = (record) => {
        this.getTaxpayers()
        this.setState({
            record,
            selectionTemplateVisible: true,
            tabsValue: '1',
        })
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

    // 关闭开发票弹窗
    selectionTemplateHandleCancel = () => {
        this.setState({
            selectionTemplateVisible: false,
        })
    }

    // 点击物流信息打开物流信息弹窗
    onLogisticsInfo = (record) => {
        this.setState({
            record,
            logisticsInfoVisible: true,
        })
    }

    // 预览
    preview = (record) => {
        const invoice_url_arr = record.invoice_url_arr
        if (invoice_url_arr && invoice_url_arr.length > 0) {
            if (invoice_url_arr.length === 1) {
                window.open('https://document.51zan.com/'+invoice_url_arr[0])
            } else {
                this.setState({
                    record,
                    PDFpreviewVisible: true
                })
            }
        }
    }

    // 关闭预览弹窗
    handlePDFpreviewCancel = () => {
        this.setState({
            PDFpreviewVisible: false
        })
    }

    render() {
        const {selectionTemplateVisible, visible, tabsValue, record, invoiceFormId, invoiceFormVisible, logisticsInfoVisible, templatePager, PDFpreviewVisible} = this.state
        const { invoicesDataPagination, invoicesData } = this.props.invoice
        const { getFieldDecorator } = this.props.form
        
        // 发票记录列表table
        // 商品列表table
        const columns = [
            {
                title: '发票流水号',
                dataIndex: 'no',
                key: 'no',
            }, {
                title: '申请时间',
                dataIndex: 'applied_at',
                key: 'applied_at',
            }, {
                title: '发票类型',
                dataIndex: 'type',
                key: 'type',
                render: (text, record) => {
                    return (
                        <div>{text===1?'电子普通发票':'增值税专用发票'}</div>
                    )
                },
            }, {
                title: '发票金额',
                dataIndex: 'amount',
                key: 'amount',
                render: (text, record) => {
                    return (
                        <div>{jine(text, '0,0.00', 'Fen')}</div>
                    )
                },
            }, {
                title: '发票抬头',
                dataIndex: 'company_name',
                key: 'company_name',
            }, {
                title: '发票状态',
                width: '106px',
                dataIndex: 'status',
                key: 'status',
                render: (text, record) => {
                    let invoiceStatus = null
                    if (text===1) {
                        invoiceStatus = <div className={styles.blue}>审核中</div>
                    } else if (text===2) {
                        invoiceStatus = <div className={styles.red}>审核失败</div>
                    } else if (text===3) {
                        invoiceStatus = <div className={styles.blue}>开票中</div>
                    } else if (text===4) {
                        invoiceStatus = <div className={styles.gray}>已完成</div>
                    }

                    return (
                        <div className={styles.invoiceStatus}>{invoiceStatus}</div>
                    )
                },
            }, {
                title: '审核备注',
                dataIndex: 'reason',
                key: 'reason',
                render: (text, record) => {
                    return (
                        <div style={{maxWidth: 300}}>{text?text:'- -'}</div>
                    )
                },
            }, {
                title: '操作',
                dataIndex: 'operation',
                key: 'operation',
                render: (text, record) => {
                    let operation = null
                    if (record.status === 1) {
                        operation = <div>
                            <a href="javascript:;" onClick={() => this.onRevokeConfirm(record)}>撤销</a>
                            <span className={styles.vertical}>|</span>
                            <a href="javascript:;" onClick={() => this.onInvoiceDetail(record)}>明细</a>
                        </div>
                    } else if (record.status === 2) {
                        operation = <div>
                            <a href="javascript:;" onClick={() => this.onInvoiceModify(record)}>修改</a>
                        </div>
                    } else if (record.status === 3) {
                        operation = <div>
                            <a href="javascript:;" onClick={() => this.onInvoiceDetail(record)}>明细</a>
                        </div>
                    } else if (record.status === 4) {
                        operation = <div>
                            <a href="javascript:;" onClick={() => this.onInvoiceDetail(record)}>明细</a>
                            {record.type === 1 ?
                                (record.invoice_url &&
                                    <span>
                                        <span className={styles.vertical}>|</span>
                                        <a href="javascript:;" onClick={()=>this.preview(record)}>预览</a>
                                    </span>)
                                : 
                                (record.express_no &&
                                    <span>
                                        <span className={styles.vertical}>|</span>
                                        <a href="javascript:;" onClick={() => this.onLogisticsInfo(record)}>物流信息</a>
                                    </span>)
                            }
                        </div>
                    }

                    return (
                        <div className={styles.operationBtn}>
                            {operation}
                        </div>
                    )
                },
            }
        ]
        
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

        return <div>
            <Page.ContentAdvSearch multiple={false}>
                <Form layout="horizontal" className="hz-from-search">
                    <Row>
                        <Col span={10}>
                            <Form.Item label="发票流水号"  {...formItemLayout}>
                                {getFieldDecorator('invoiceSerialNumber', {
                                    rules: [{ whitespace: true,message: '不能只输入空格' },],
                                })(
                                    <Input placeholder="请输入发票流水号"  maxLength={50}/>
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={10} style={{maxWidth: 438}}>
                            <Form.Item label="申请时间"  {...formItemLayout}>
                                {getFieldDecorator('applicationTime', {
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
            <Table 
                columns={columns}
                dataSource={invoicesData}
                pagination={false} 
                rowKey="id"
            />
            {invoicesDataPagination.rows_found>0 &&
                <Pagination
                    className="ant-table-pagination"
                    current={invoicesDataPagination.offset}
                    total={invoicesDataPagination.rows_found}
                    showTotal={(total) => `共 ${total} 条`} 
                    showQuickJumper={true} 
                    showSizeChanger={true}  
                    pageSize={invoicesDataPagination.limit} 
                    pageSizeOptions={['10', '20', '50', '100']}
                    onShowSizeChange={this.handleChangeSize}
                    onChange={this.goToPage} />
            }
            {/* 发票明细 */}
            <InvoiceDetail 
                visible={visible} 
                key={'InvoiceDetail'+record.id}
                id={record.id}
                handleCancel={this.handleCancel} 
                {...this.props}/>
            
            {/* 发票物流信息 */}
            {
                logisticsInfoVisible ? 
                    <LogisticsInfo 
                        visible={logisticsInfoVisible} 
                        key={'LogisticsInfo'+record.id}
                        id={record.id}
                        handleCancel={this.logisticsInfoHandleCancel} 
                        {...this.props}/>
                    :
                    ''
            }
            {/* 发票修改 */}
            <BillSelectionTemplate 
                visible={selectionTemplateVisible} 
                handleCancel={this.selectionTemplateHandleCancel} 
                tabsValue={tabsValue}
                pager={templatePager}
                goTemplatePage={this.goTemplatePage}
                jumpAddTemplate={this.jumpAddTemplate}
                handleModelTabs={this.handleModelTabs}
                addTemplateForm={this.addTemplateForm}
                {...this.props}/>
            <InvoiceForm
                key={'InvoiceForm'+invoiceFormId+record.id}
                id={invoiceFormId}
                record={record}
                visible={invoiceFormVisible} 
                handleCancel={this.handleInvoiceFormCancel} 
                tabsValue={tabsValue}
                {...this.props}
            />
            <PDFpreview
                key={'PDFpreview'+record.id}
                record={record}
                visible={PDFpreviewVisible} 
                handleCancel={this.handlePDFpreviewCancel} 
                {...this.props}
            />
        </div>
    }
}
