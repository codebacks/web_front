/**
 **@Description: 晒图对账
 **@author: wangchunting
 */

import React from 'react'
import { connect } from 'dva'
import { Button, Icon, Form, Select, Row, Col, DatePicker, Radio, Popover, Table, Pagination, message,Modal,Divider,Badge } from 'antd'
import documentTitleDecorator from 'hoc/documentTitle'
import Page, { DEFAULT_PAGER, DEFAULT_PAGER_FILTER } from '../../../../../components/business/Page'
import styles from './index.less'
import redPackstyle from '../packet_accounts/index.less'
import moment from 'moment'
import { jine, amount, number } from '../../../../../utils/display'
import { SUBJECT_TYPE } from '../../../services/bluerint'
import DownloadSvg from '../../../../../assets/font_icons/download.svg'
const Option = Select.Option
const { RangePicker } = DatePicker
const RadioButton = Radio.Button
const RadioGroup = Radio.Group
const DEFAULT_CONDITION = {
    begin_at: '',
    end_at: '',
    mch_no: '',
    subject_type: ''
}

@Form.create()
@connect(({ base, data_blueprint,data_packet_accounts }) => ({
    base, data_blueprint,data_packet_accounts
}))
@documentTitleDecorator()

export default class extends Page.ListPureComponent {
    state = {
        condition: { ...DEFAULT_CONDITION },
        pager: { ...DEFAULT_PAGER },
        merchant: "",
        loading: true,
        createReportDetail:false,
        recordsVisible:false,
        modalLoading:false,
        page:1
    }

    initPage = (isSetHistory = false) => {
        const condition = this.getParamForObject(DEFAULT_CONDITION, this.props.location.query)
        const pager = this.getParamForObject(DEFAULT_PAGER, this.props.location.query, DEFAULT_PAGER_FILTER)

        const { begin_at, end_at, mch_no } = condition

        this.getPageData(condition, pager, isSetHistory)

        this.props.dispatch({
            type: 'data_blueprint/getMchNo'
        })

        this.props.form.setFieldsValue({
            'mch_no': mch_no,
            'rangePicker': begin_at && end_at ? [moment(begin_at), moment(end_at)] : [],
        })
    }

    /* 上周、上月开始结束时间等方法 */
    getLastWeekDays = () => {
        let date = []
        let weekOfday = parseInt(moment().format('d'), 10)
        let start = moment().subtract(weekOfday + 6, 'days').format('YYYY-MM-DD')
        let end = moment().subtract(weekOfday, 'days').format('YYYY-MM-DD')
        date.push(moment(start))
        date.push(moment(end))
        return date
    }

    getLastMonthDays = () => {
        let date = []
        let start = moment().subtract(1, 'month').format('YYYY-MM') + '-01'
        let end = moment(start).add(1, 'month').subtract(1, 'days').format('YYYY-MM-DD')
        date.push(moment(start))
        date.push(moment(end))
        return date
    }

    rangeDisabledTime = (current) => {
        let nowAday = moment()
        if (current <= nowAday) return false
        else return true
    }

    /* 页面事件处理 */
    getPageData = (condition, pager, isSetHistory = true, callback) => {
        if (isSetHistory) {
            this.history(condition, pager)
        }

        this.setState({
            condition: condition,
            pager: pager,
            loading: true
        })

        this.props.dispatch({
            type: 'data_blueprint/getTableList',
            payload: {
                offset: (pager.current - 1) * pager.pageSize,
                limit: pager.pageSize,
                begin_at: condition.begin_at,
                end_at: condition.end_at,
                mch_no: condition.mch_no,
                subject_type: SUBJECT_TYPE.blueprint
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
        const { form } = this.props

        form.validateFields((error, value) => {
            let begin_at = '', end_at = ''
            if (value.rangePicker && value.rangePicker.length !== 0) {
                begin_at = value.rangePicker[0].format('YYYY-MM-DD')
                end_at = value.rangePicker[1].format('YYYY-MM-DD')
            }

            const condition = {
                ...this.state.condition,
                ...{
                    end_at: end_at,
                    begin_at: begin_at,
                    mch_no: value.mch_no || ''
                }
            }

            const pager = {
                pageSize: this.state.pager.pageSize,
                current: DEFAULT_PAGER.current
            }
            this.getPageData(condition, pager)
        })
    }

    onSearch = () => {
        this.searchData()
    }

    onReset = () => {
        this.props.form.resetFields()

        this.searchData()
    }

    onChangeSelect = (value, item) => {
        this.setState({
            merchant: value ? item.props.children : ''
        })
    }

    handleChangeTimeRange = (e) => {
        let value = e.target.value
        switch (value) {
            case 'LastWeek':
                this.props.form.setFieldsValue({ rangePicker: this.getLastWeekDays() })
                break
            case 'LastMonth':
                this.props.form.setFieldsValue({ rangePicker: this.getLastMonthDays() })
                break
            default:
                break
        }
    }

    downDetail = (id,url,type) => {
        let dateRange = this.props.form.getFieldValue('rangePicker')
        if (type !== 'anew' && (!dateRange || !dateRange.length)) {
            message.error('请选择时间范围')
        } else {
           
            if(type === 'detail' || 'anew'){
                this.setState({
                    createReportDetail:false
                })
            }
            let beginTime = '',endTime = ''
            if(type !== 'anew'){
                beginTime = dateRange[0].format('YYYY-MM-DD')
                endTime = dateRange[1].format('YYYY-MM-DD')
            }
            this.props.dispatch({
                type: url,
                payload:type === 'anew' ? id : {
                    begin_at: beginTime,
                    end_at: endTime,
                    mch_no: this.state.merchant,
                    subject_type: SUBJECT_TYPE.blueprint,
                },
                callback: (data) => {
                    if(type === 'bill'){
                        if(data){
                            window.location.href = data
                        }
                    }else{
                        this.setState({
                            createReportDetail:false
                        })
                        if(data.meta && data.meta.code === 200){
                            if(type === 'detail'){
                                message.success('报表数据已在队列中，请在生成记录中查看下载')
                            }else{
                                message.success('重新生成数据已在队列中，请在生成记录中查看下载')
                                this.getDetailRecords(this.state.page)
                            }
                            
                        }
                    }
                }
            })
        }
    }
    // 下载账单
    downLoadAccounts = () => {
        this.downDetail({},'data_blueprint/accountsDownLoad','bill')
    }
    // 下载明细
    downLoadDetail = () => {
        this.downDetail({},'data_packet_accounts/downLoadDetail','detail')
    }

    // 列表(下载明细)
    // tableDownLoadDetail = (value) => {
    //     let { mch_no } = value
    //     if (mch_no === '--') {
    //         mch_no = ''
    //     }
    //     this.props.dispatch({
    //         type: 'data_blueprint/accountsDetailDownLoad',
    //         payload: {
    //             begin_at: value.begin_at,
    //             end_at: value.end_at,
    //             mch_no: mch_no,
    //             subject_type: SUBJECT_TYPE.blueprint
    //         },
    //         callback: (data) => {
    //             if (data) {
    //                 window.location.href = data
    //             }
    //         }
    //     })
    // }
    handleCancel = () =>{
        this.setState({
            recordsVisible:false
        })
    }
    createDetailRecords = () =>{
        this.setState({
            recordsVisible:true,
            page:1
        })
        this.getDetailRecords(1)
    }
    handleChangePage =(value)=>{
        this.setState({
            page:value
        })
        this.getDetailRecords(value)
    }
    getDetailRecords = (page) =>{
        this.setState({
            modalLoading:true,
        })
        this.props.dispatch({
            type:'data_packet_accounts/createDetailRecords',
            payload:{
                offset: (page -1)* 10,
                limit: 10,
                type:2,
            },
            callback:()=>{
                this.setState({
                    modalLoading:false,
                })
            }
        })
    }
    // 重新生成
    createAnewReport = (data,e) =>{
        e.stopPropagation()
        this.downDetail({id:data.id,subject_type: SUBJECT_TYPE.blueprint},'data_packet_accounts/downLoadDetail','anew')
    }
    render() {
        const columns = [
            {
                title: '日期',
                dataIndex: 'date'
            },
            {
                title: '支出金额(元)',
                dataIndex: 'amount',
                align: 'right',
            },
            {
                title: '支付笔数',
                dataIndex: 'total_count',
                align: 'center'
            },
            {
                title: '支付商户号',
                dataIndex: 'mch_no'
            },
            // {
            //     title: '操作',
            //     dataIndex: 'action',
            //     width: 150,
            //     render: (value, item, index) => {
            //         return <div style={{ color: '#4492FF', cursor: 'pointer' }} onClick={() => { this.tableDownLoadDetail(item) }}>下载明细</div>
            //     }
            // }
        ]
        const column =[
            {
                title: '生成时间',
                dataIndex: 'created_at'
            },
            {
                title: '完成时间',
                dataIndex: 'complete_at'
            },
            {
                title: '状态',
                dataIndex: 'status',
                render : (text,record,index) =>{
                    switch (text) {
                        case 1 :
                            return <Badge status="default" text="生成中" />
                        case 2 :
                            return <Badge status="success" text="已完成" />
                        case 3 :
                            return <Badge status="error" text="生成失败" />
                        default:
                            return ''
                    }

                }
            },
            {
                title: '备注',
                render : (text,record,index)=>{
                    return <span>{record.begin_at.substr(0,10)}~{record.end_at.substr(0,10)}</span>
                }   
            },
            {
                title: '操作',
                dataIndex: 'path',
                render: (text,item,index) => {
                    if(item.status === 1){
                        //生成中
                        return <span>--</span>
                    }else if(item.status === 2){
                        // 已生成
                        return <div>
                            <a href={'http://document.51zan.com/'+text}>下载</a>
                            <Divider type="vertical" />
                            <a href="javascript:;" onClick={(e)=>this.createAnewReport(item,e)}>重新生成</a>
                        </div>
                    }else{
                        // 生成失败
                        return <a href="javascript:;" onClick={(e)=>this.createAnewReport(item,e)}>重新生成</a>
                    }
                }
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

        const { list, totalPage, totalAmount, totalCount, mchList } = this.props.data_blueprint
        const { createDetailRecord, total} = this.props.data_packet_accounts
        const { getFieldDecorator } = this.props.form
        const { current, pageSize } = this.state.pager
        const { loading ,createReportDetail,recordsVisible,modalLoading,page} = this.state
        return (
            <Page>
                <Page.ContentHeader
                    title={this.props.documentTitle}
                    helpUrl="http://newhelp.51zan.cn/manual/content/%E6%95%B0%E6%8D%AE%E4%B8%AD%E5%BF%83/%E8%B4%A2%E5%8A%A1%E7%BB%9F%E8%AE%A1.md"
                />
                <div className={styles.packetAccounts}>
                    <Page.ContentAdvSearch multiple={false} className="hz-padding-large-left">
                        <Form layout="horizontal" className="hz-from-search">
                            <Row>
                                <Col span={7}>
                                    <Form.Item label='支付商户号' {...formItemLayout}>
                                        {getFieldDecorator('mch_no', {})(
                                            <Select placeholder='选择商户号' onChange={this.onChangeSelect}>
                                                <Option value="">全部商户号</Option>
                                                {mchList && mchList.length && mchList.map((value, index) => {
                                                    return <Option value={value.wxMerchantId} key={index}>{value.wxMerchantId}</Option>
                                                })}
                                            </Select>
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col span={7}>
                                    <Form.Item label='起止时间' {...formItemLayout} style={{marginLeft: 29}}>
                                        {getFieldDecorator("rangePicker", {})(
                                            <RangePicker allowClear={false} disabledDate={(current) => this.rangeDisabledTime(current)} onChange={() => { this.props.form.setFieldsValue({ radioGroup: '' }) }} />
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col span={7} style={{ width: 162 }}>
                                    {getFieldDecorator('radioGroup', {})(
                                        <RadioGroup className={styles.range}
                                            onChange={this.handleChangeTimeRange}>
                                            <RadioButton value='LastWeek'>上一周</RadioButton>
                                            <RadioButton value='LastMonth'>上一月</RadioButton>
                                        </RadioGroup>
                                    )}
                                </Col>
                                <Col>
                                    <Form.Item {...formItemLayout} style={{marginLeft: 40}}>
                                        <Button className='hz-btn-width-default' type="primary" htmlType="submit" onClick={this.onSearch}>
                                            <Icon type="search" />
                                            搜索
                                        </Button>
                                        <Button className='hz-btn-width-default' type="default" htmlType="submit" onClick={this.onReset} style={{ marginLeft: '16px' }}>
                                            重置
                                        </Button>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                    </Page.ContentAdvSearch>
                    <div className={styles.packetStatistics}>
                        <Row>
                            <Col span={12}>
                                <div className={styles.spanTop}>
                                    <span style={{ marginRight: '16px' }}>累计支出金额：
                                        <span className={styles.money} >{jine(totalAmount, '0.00', amount.unit.Fen)}</span> 元</span>
                                    <span>累计支出笔数：
                                        <span className={styles.money}>{number(totalCount)}</span> 笔</span>
                                </div>
                            </Col>
                            <Col span={12} style={{ textAlign: 'right' }}>
                                <Button className=' hz-margin-base-right' onClick={this.downLoadAccounts}>
                                    <Icon component={DownloadSvg} style={{ fontSize: '16px' }} />
                                    下载账单
                                </Button>
                                <Button className=' hz-margin-base-right' onClick={this.downLoadDetail} loading={createReportDetail} disabled={createReportDetail}>
                                    <Icon component={DownloadSvg} style={{ fontSize: '16px' }} />
                                    生成明细
                                </Button>
                                <Button  className={redPackstyle.downLoadButton + ' hz-margin-base-right' } onClick={this.createDetailRecords}>
                                    生成记录
                                </Button>
                                <Popover placement="bottomLeft" arrowPointAtCenter={true} content={<div>当前仅支持下载90天内的数据</div>}>
                                    <span className={styles.explain}><Icon className="hz-text-primary hz-icon-size-default" type="question-circle-o" /></span>
                                </Popover>
                            </Col>
                        </Row>
                    </div>
                    <Table columns={columns} dataSource={list} pagination={false} rowKey='id' loading={loading} />
                    {
                        list && list.length > 0 && !loading ?
                            <Pagination
                                className="ant-table-pagination"
                                current={current}
                                total={totalPage}
                                showTotal={(total) => `共 ${total} 条`}
                                showQuickJumper={true}
                                showSizeChanger={true}
                                pageSize={pageSize}
                                pageSizeOptions={['10', '20', '50', '100']}
                                onShowSizeChange={this.handleListPageChangeSize}
                                onChange={this.handleListPageChange}
                            />
                            : ''
                    }
                </div>
                <Modal
                    title="生成记录"
                    visible={recordsVisible}
                    width={880}
                    className={redPackstyle.modelStyle}
                    footer={null}
                    onCancel={this.handleCancel}
                    maskClosable={false}
                >
                    <Table columns={column} dataSource={createDetailRecord} pagination={false} rowKey='id' loading={modalLoading}/>
                    {
                        createDetailRecord && createDetailRecord.length > 0?
                            <Pagination
                                className="ant-table-pagination"
                                current={page}
                                total={total}
                                size='small'
                                showTotal={(total) => `共 ${total} 条`} 
                                showQuickJumper={true} 
                                onChange={this.handleChangePage} />
                            : ''
                    }
                </Modal>
            </Page>
        )
    }
}
