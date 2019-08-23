/**
 **@Description:
 **@author: 吴明
 */

import React, {Component} from 'react'
import { Select,Form, Row, Col, DatePicker , Button,Radio, Table, Pagination, Icon,message, Popover } from 'antd'
import {connect} from 'dva'
import Page, { DEFAULT_PAGER, DEFAULT_PAGER_FILTER } from '../../../../../components/business/Page'
import styles from './index.less'
import {jine} from '../../../../../utils/display'
import documentTitleDecorator from 'hoc/documentTitle'
import moment from 'moment'

const FormItem = Form.Item
const {  RangePicker } = DatePicker
@connect(({base,platform_voicepacket}) => ({
    base,platform_voicepacket
}))
@Form.create()
@documentTitleDecorator({
    title:'对账中心'
})
export default class  extends  Component{
    constructor ( props) {
        super(props)
        this.state = {
            range:'',
            // begin_at: moment().subtract(1, `weeks`).startOf('week').format('YYYY-MM-DD') + ' 00:00:00',
            // end_at: moment().subtract(1, 'weeks').endOf('week').format('YYYY-MM-DD') + ' 23:59:59',
            begin_at: '',
            end_at: '',
            offset:1,
            limit:10
        }
    }

    getData = () => {
        const {begin_at , end_at,offset,limit} = this.state
        this.props.dispatch({
            type:"platform_voicepacket/settlementsList",
            payload:{
                begin_at:begin_at,
                end_at:end_at,
                offset:(offset-1)*limit,
                subject_type:1,
                limit:limit
            },
            callback:()=>{

            }
        })
    }
    handleSearch = () =>{
        this.setState({
            offset:1,
            limit:10,
        },()=>{
            this.getData()
            this.handleSettlement()
        })
    }
    componentDidMount () {
        this.handleSearch()
        this.handleSettlement()
    }

    handleSettlement= ()=>{
        const {begin_at , end_at} = this.state
        this.props.dispatch({
            type:"platform_voicepacket/settlements",
            payload:{
                begin_at:begin_at,
                end_at:end_at,
                subject_type:1
            },
            callback:()=>{
            }
        })
    }

    resetSearch = () =>{
        this.setState({
            begin_at:'',
            end_at:'',
            range:'',
            offset:1,
            limit:10,
        },()=>{
            this.getData()
            this.handleSettlement()
        })
       
    }
    handleChangeTime =(value,time)=>{
        if(value.length>0){
            this.setState({
                begin_at:time[0]+' 00:00:00',
                end_at:time[1]+' 23:59:59'
            })
            this.setTimeRange(value)
        }else{
            this.setState({
                begin_at:'',
                end_at:'',
                range:''
            })
        }
        
    }
    handleChangePageSize = (value) =>{
        this.setState({
            limit:value,
            offset:1
        },()=>{
            this.getData()
        })
    }
    handlePageChange =(value) =>{
        this.setState({
            offset:value
        },()=>{
            this.getData()
        })
    }

    setTimeRange = (value) => {
        let range = ''
        if(moment().subtract(1, 'weeks').startOf('week').isSame(value[0], 'day')
            && moment().subtract(1, 'weeks').endOf('week').isSame(value[1], 'day')){
            range = 'week'
        }else if(moment().subtract(1, 'months').startOf('month').isSame(value[0], 'day')
        && moment().subtract(1, 'months').endOf('month').isSame(value[1], 'day')){
            range = 'month'
        }
        this.setState({
            range: range
        })
    }
    downLoadAccounts = ()=>{
        const { begin_at ,end_at } = this.state
        if(begin_at && end_at){
            this.props.dispatch({
                type:'platform_voicepacket/downloadBill',
                payload:{
                    subject_type:1,
                    begin_at:begin_at,
                    end_at:end_at
                },
                callback:(data)=>{
                    window.open(data.down_path,'_blank')
                }
            })
        }else{
            message.error('请选择时间范围')
        }
    }
    downLoadDetail =() =>{
        const { begin_at ,end_at } = this.state
        if(begin_at && end_at){
            this.props.dispatch({
                type:'platform_voicepacket/downloadDetail',
                payload:{
                    subject_type:1,
                    begin_at:begin_at,
                    end_at:end_at
                },
                callback:(data)=>{
                    window.open(data.down_path,'_blank')
                }
            })
        }else{
            message.error('请选择时间范围')
        }
        
    }
    editLimit = (record,index) =>{
        this.props.dispatch({
            type:'platform_voicepacket/downloadDetail',
            payload:{
                subject_type:1,
                begin_at:record.begin_at,
                end_at:record.end_at
            },
            callback:(data)=>{
                window.open(data.down_path,'_blank')
            }
        })
    }
    handleChangeTimeRange = (e) => {
        const value = e.target.value
        switch(value) {
            case 'week':
                this.setTimeParams('week')
                break 
            case 'month':
                this.setTimeParams('month')
                break
            default:
        }

        this.setState({
            range:e.target.value
        })
    }
    setTimeParams = (days) => {
        const begin_time = moment().subtract(1, `${days}s`).startOf(days).format('YYYY-MM-DD') + ' 00:00:00'
        const end_time = moment().subtract(1, `${days}s`).endOf(days).format('YYYY-MM-DD') + ' 23:59:59'
        this.setState({
            begin_at:begin_time,
            end_at:end_time
        })
    }
   
    render() {
        const columns = [{
            title: '日期',
            dataIndex: 'begin_at',
            key: 'begin_at',
            render:(text,record,index)=>{
                return <span>{moment(text).format('YYYY-MM-DD')}</span>
            }
        },{
            title: '支出金额',
            dataIndex: 'amount',
            key: 'amount',
            render: (text, record) => (
                <span>{jine(text,'','Fen')}</span>    
            ),
        },{
            title: '支付笔数',
            dataIndex: 'total_count',
            key: 'total_count'
        },{
            title: '操作',
            render:(text,record,index)=>{
                return <a onClick={()=>{this.editLimit(record,index)}}>下载明细</a>
            }
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
        const {range ,begin_at,end_at,offset,limit} = this.state
        const {total,loading,reconciliationData,expendMoney,expendCount } = this.props.platform_voicepacket
        return (
            <Page>
                <Page.ContentHeader
                    title="对账中心"
                    helpUrl='http://newhelp.51zan.cn/manual/content/%E8%90%A5%E9%94%80%E5%B9%B3%E5%8F%B0/%E8%AF%AD%E9%9F%B3%E7%BA%A2%E5%8C%85.md'
                />
                <Page.ContentAdvSearch>
                    <Form layout="horizontal" className="hz-from-search" >
                        <Row>
                            <Col span={8}>
                                <FormItem label="选择日期" {...formItemLayout}>
                                    <RangePicker  
                                        onChange={(value,time)=>{this.handleChangeTime(value,time)}} 
                                        style={{width:'100%'}} 
                                        value={begin_at&&end_at?[moment(begin_at),moment(end_at)]:''} 
                                        disabledDate={(current)=>current>moment().endOf('day')}
                                    />
                                </FormItem> 
                            </Col>
                            <Col span={10}>
                                <Radio.Group
                                    value={range}
                                    onChange={this.handleChangeTimeRange}
                                >
                                    <Radio.Button value="week" className={styles.item}>上一周</Radio.Button>
                                    <Radio.Button value="month" className={styles.item}>上一月</Radio.Button>
                                </Radio.Group>
                                <Button style={{'marginTop':'3px',marginLeft:16}} type="primary" onClick={this.handleSearch} >
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
                <div className={styles.packetStatistics}>
                    <Row>
                        <Col span={12}>
                            <div className={styles.spanTop}>
                                <span>累计支出金额：</span><span className={styles.money} style={{marginRight: '16px'}}>{jine(expendMoney,'','Fen')}</span>
                                <span>累计支出笔数：</span><span className={styles.money}>{expendCount}</span>
                            </div>
                        </Col>
                        <Col span={12} style={{textAlign: 'right'}}>
                            <Button  className={styles.downLoadButton + ' hz-margin-base-right' } onClick={this.downLoadAccounts}>
                                <Icon type="download"/>
                                下载账单
                            </Button>
                            <Button  className={styles.downLoadButton + ' hz-margin-base-right' } onClick={this.downLoadDetail}>
                                <Icon type="download"/>
                                下载明细
                            </Button>
                            <Popover placement="bottomLeft" arrowPointAtCenter={true} content={<div>当前仅支持下载90天内的数据</div>}>
                                <span className={styles.explain}><Icon className="hz-text-primary hz-icon-size-default" type="question-circle-o" /></span>
                            </Popover>
                        </Col>
                    </Row>
                </div>
                <Table
                    pagination={false}
                    columns={columns}
                    loading= {loading}
                    rowKey={(record,index) => index}
                    dataSource={reconciliationData}/>
                {reconciliationData.length? (
                    <Pagination
                        className="ant-table-pagination"
                        total={total}
                        current={offset}
                        showQuickJumper={true}
                        showTotal={total => `共${total}条记录`}
                        pageSize={ limit }
                        pageSizeOptions= {['10','20','50','100']}
                        showSizeChanger={true}
                        onShowSizeChange={this.handleChangePageSize}
                        onChange={this.handlePageChange}
                    />
                ) : (
                    ''
                )}
            </Page>
        )
    }
}
