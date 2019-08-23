/**
 **@time: 2018/8/6
 **@Description: 小红包对账
 **@author: zhousong
 */

import React from 'react'
import { connect } from 'dva'
import { Button, Icon, Form, Select, Row, Col, DatePicker, Radio, Popover, Table, Pagination, Modal ,message ,Divider,Badge} from 'antd'
import documentTitleDecorator from 'hoc/documentTitle'
import Page, {ContentAdvSearch as PageContentAdvSearch} from  '@/components/business/Page'
import styles from './index.less'
import numeral from 'numeral'
import moment from 'moment'
import DownLoadSvg from '../../../../../assets/font_icons/download.svg'

const Option = Select.Option
const { RangePicker } = DatePicker
const RadioButton = Radio.Button
const RadioGroup = Radio.Group

@Form.create()
@connect(({ base, data_packet_accounts }) => ({
    base, data_packet_accounts
}))
@documentTitleDecorator()
export default class extends React.PureComponent {
    state = {
        current: 1,
        pageSize: 10,
        loading: true,
        merchant: '',
        beginAt: '',
        endAt: '',
        recordsVisible:false,
        page:1,
        modalLoading:false,
        createDetailReportLoading:false
    }

    componentDidMount() {
        this.getData()

        // 获取商户号数据
        this.props.dispatch({
            type: 'data_packet_accounts/getMchNo'
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

    // 获取列表数据公共方法
    getData = (payload = {}, callback = () => {this.setState({loading: false})}) => {
        this.setState({
            loading: true
        })
        this.props.dispatch({
            type: 'data_packet_accounts/getTableList',
            payload: payload,
            callback: callback
        })
    }

    searchList = () => {
        let date = this.props.form.getFieldValue('rangePicker')
        if (date) {
            this.setState({
                limit: this.state.pageSize,
                beginAt: date[0].format('YYYY-MM-DD'),
                endAt: date[1].format('YYYY-MM-DD')
            })
            this.getData({
                limit: this.state.pageSize,
                begin_at: date[0].format('YYYY-MM-DD'),
                end_at: date[1].format('YYYY-MM-DD'),
                mch_no: this.state.merchant
            })
        } else {
            this.getData({
                limit: this.state.pageSize,
                mch_no: this.state.merchant
            })
        }
        
    }

    reset = () => {
        this.setState({
            merchant: '',
            beginAt: '',
            endAt: ''
        })
        this.props.form.resetFields()
        this.getData({
            limit: this.state.pageSize
        }, () => {this.setState({loading: false,current: 1})})
    }

    onChangeSelect = (value) => {
        this.setState({
            merchant: value
        })
    }

    handleChangeTimeRange = (e) => {
        let value = e.target.value
        switch(value) {
            case 'LastWeek':
                this.props.form.setFieldsValue({rangePicker:this.getLastWeekDays()})
                break
            case 'LastMonth':
                this.props.form.setFieldsValue({rangePicker:this.getLastMonthDays()})
                break
            default:
        }
    }

    
    downLoadAccounts = () => {
        let dateRange = this.props.form.getFieldValue('rangePicker')
        if (!dateRange) {
            message.error('请选择时间范围')
        } else{
            let beginTime = dateRange[0].format('YYYY-MM-DD'), endTime = dateRange[1].format('YYYY-MM-DD')
            this.props.dispatch({
                type: 'data_packet_accounts/accountsDownLoad',
                payload: {
                    begin_at: beginTime,
                    end_at: endTime,
                    mch_no: this.state.merchant
                },
                callback: (data) => {
                    if (data) {
                        window.location.href = data
                    }
                }
            })
        }
    }

    downLoadDetail = () => {
        let dateRange = this.props.form.getFieldValue('rangePicker')
        if (!dateRange) {
            message.error('生成新的报表数据，请先设置搜索条件')
        } else{
            let beginTime = dateRange[0].format('YYYY-MM-DD'), endTime = dateRange[1].format('YYYY-MM-DD')
            let postData = {
                begin_at: beginTime,
                end_at: endTime,
                mch_no: this.state.merchant
            }
            this.createDetailReport(postData,'create')
        }
    }
    // 重新生成
    createAnewReport = (data,e) =>{
        e.stopPropagation()
        this.createDetailReport({id:data.id},'anew')
    }
    createDetailReport = (data,type) =>{
        this.setState({
            createDetailReportLoading:true
        })
        this.props.dispatch({
            type: 'data_packet_accounts/downLoadDetail',
            payload: data,
            callback: (res) => {
                this.setState({
                    createDetailReportLoading:false
                })
                console.log(res)
                if(res.meta && res.meta.code === 200){
                    if(type === 'create'){
                        message.success('报表数据已在队列中，请在生成记录中查看下载')
                    }else{
                        message.success('重新生成数据已在队列中，请在生成记录中查看下载')
                        this.getDetailRecords(this.state.page)
                    }
                }
                  
            }
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
                type:1,
            },
            callback:()=>{
                this.setState({
                    modalLoading:false,
                })
            }
        })
    }
    // tableDownLoadDetail = (value) => {
    //     let {mch_no} = value
    //     if (mch_no === '--') {
    //         mch_no = ''
    //     }
    //     this.props.dispatch({
    //         type: 'data_packet_accounts/accountsDetailDownLoad',
    //         payload: {
    //             begin_at: value.begin_at,
    //             end_at: value.end_at,
    //             mch_no: mch_no
    //         },
    //         callback: (data) => {
    //             if (data) {
    //                 window.location.href = data
    //             }
    //         }
    //     })
    // }

    goToPage = (page, pageSize) => {
        this.setState({
            current: page
        })
        this.getData({
            offset: (page - 1) * this.state.pageSize,
            limit: this.state.pageSize,
            mch_no: this.state.merchant,
            begin_at: this.state.beginAt,
            end_at: this.state.endAt
        })
    }

    handleChangeSize = (value,pageSize) => {
        this.setState({
            pageSize: pageSize,
            current: value
        })
        this.getData({
            limit: pageSize,
            offset: (value - 1) * pageSize,
            mch_no: this.state.merchant,
            begin_at: this.state.beginAt,
            end_at: this.state.endAt
        })
    }

   
    handleCancel = () =>{
        this.setState({
            recordsVisible:false
        })
    }
    render() {
        const columns =[
            {
                title: '日期',
                dataIndex: 'date'
            },
            {
                title: '支出金额(元)',
                dataIndex: 'amount'
            },
            {
                title: '支付笔数',
                dataIndex: 'total_count'
            },
            {
                title: '支付商户号',
                dataIndex: 'mch_no'
            },
            // {
            //     title: '操作',
            //     dataIndex: 'action',
            //     width: 150,
            //     render: (value,item,index) => {
            //         return <div style={{color: '#4492FF',cursor: 'pointer'}} onClick={()=>{this.tableDownLoadDetail(item)}}>下载明细</div>
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

        const { list, totalPage, totalAmount, totalCount, mchList,createDetailRecord, total} = this.props.data_packet_accounts
        const { getFieldDecorator } = this.props.form
        const { pageSize, current, loading , recordsVisible,page ,modalLoading,createDetailReportLoading} = this.state

        return (
            <Page>
                <Page.ContentHeader 
                    title={this.props.documentTitle} 
                    helpUrl="http://newhelp.51zan.cn/manual/content/%E6%95%B0%E6%8D%AE%E4%B8%AD%E5%BF%83/%E8%B4%A2%E5%8A%A1%E7%BB%9F%E8%AE%A1.md"
                />
                <div className={styles.packetAccounts}>
                    <PageContentAdvSearch  multiple={false} className="hz-padding-large-left">
                        <Form layout="horizontal" className="hz-from-search">
                            <Row>
                                <Col span={7}>
                                    <Form.Item label='支付商户号' {...formItemLayout}>
                                        {getFieldDecorator('select',{})(
                                            <Select placeholder='选择商户号' onChange={this.onChangeSelect}>
                                                <Option value=''>全部</Option>
                                                {mchList && mchList.length && mchList.map((value, index) => {
                                                    return <Option value={value.wxMerchantId} key={index}>{value.wxMerchantId}</Option>
                                                })}
                                            </Select>
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col span={7}>
                                    <Form.Item label='起止时间' {...formItemLayout}>
                                        {getFieldDecorator("rangePicker",{})(
                                            <RangePicker allowClear={false} disabledDate={(current) =>this.rangeDisabledTime(current)} onChange={() => {this.props.form.setFieldsValue({radioGroup: ''})}}/>
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col span={7} style={{width: 162}}>
                                    {getFieldDecorator('radioGroup',{})(
                                        <RadioGroup className={styles.range}
                                            onChange={this.handleChangeTimeRange}>
                                            <RadioButton value='LastWeek'>上一周</RadioButton>
                                            <RadioButton value='LastMonth'>上一月</RadioButton>
                                        </RadioGroup>
                                    )}
                                </Col>
                                <Col>
                                    <Form.Item {...formItemLayout}>
                                        <Button className='hz-btn-width-default' type="primary" htmlType="submit" onClick={this.searchList} >
                                            <Icon type="search"/>
                                            搜索
                                        </Button>
                                        <Button className='hz-btn-width-default' type="default" htmlType="submit" onClick={this.reset} style={{marginLeft: '16px'}}>
                                            重置
                                        </Button>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                    </PageContentAdvSearch>
                    <div className={styles.packetStatistics}>
                        <Row>
                            <Col span={12}>
                                <div className={styles.spanTop}>
                                    <span>累计支出金额：</span><span className={styles.money} style={{marginRight: '16px'}}>{numeral(totalAmount/100).format('0,0.00')}</span>
                                    <span>累计支出笔数：</span><span className={styles.money}>{numeral(totalCount).format('0,0')}</span>
                                </div>
                            </Col>
                            <Col span={12} style={{textAlign: 'right'}}>
                                <Button  className={styles.downLoadButton + ' hz-margin-base-right' } onClick={this.downLoadAccounts}>
                                    <Icon component={DownLoadSvg} style={{fontSize: '16px'}} />
                                    下载账单
                                </Button>
                                <Button  className={styles.downLoadButton + ' hz-margin-base-right' } loading={createDetailReportLoading} disabled={createDetailReportLoading} onClick={this.downLoadDetail}>
                                    <Icon component={DownLoadSvg} style={{fontSize: '16px'}} />
                                    生成明细
                                </Button>
                                <Button  className={styles.downLoadButton + ' hz-margin-base-right' } onClick={this.createDetailRecords}>
                                    生成记录
                                </Button>
                                <Popover placement="bottomLeft" arrowPointAtCenter={true} content={<div>当前仅支持下载90天内的数据</div>}>
                                    <span className={styles.explain}><Icon className="hz-text-primary hz-icon-size-default" type="question-circle-o" /></span>
                                </Popover>
                            </Col>
                        </Row>
                    </div>
                    <Table columns={columns} dataSource={list} pagination={false} rowKey='id' loading={loading}/>
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
                                pageSizeOptions= {['10', '20', '50', '100']}
                                onShowSizeChange={this.handleChangeSize}
                                onChange={this.goToPage} />
                            : ''
                    }
                </div>
                <Modal
                    title="生成记录"
                    visible={recordsVisible}
                    width={880}
                    className={styles.modelStyle}
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
