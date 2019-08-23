/**
 **@Description:
 **@author: 吴明
 */

import React, {Component} from 'react'
import { DatePicker, Select,Form, Row, Col, Input, Button, Table, Pagination, Modal, Icon, Popover,Collapse,Badge,message,Spin,Divider,Empty } from 'antd'
import OrderDetails from 'setting/ignore_routes/shop_order/shop_orders_details'
import {connect} from 'dva'
import documentTitleDecorator from 'hoc/documentTitle'
import WeChatSelectSingle from 'components/business/WeChatSelectSingle'
import UserSelect from 'components/business/UserSelect'
import Page from '@/components/business/Page'
import {Link} from 'dva/router'
import styles from './index.less'
import DownloadSvg from '../../../../assets/font_icons/download.svg'
import { Label } from 'components/business/Page'
import moment from 'moment'
import {getStatusByVal} from '../../services/redpacket'

@connect(({base,platform_redpacket}) => ({
    base,
    platform_redpacket
}))
@Form.create()

@documentTitleDecorator({
    title:'红包'
})
export default class Index extends Component {
    constructor ( props) {
        super(props)
        this.state = {
            //当前页
            offset: 1,
            //每页条数
            limit: 10,
            //店铺关联订单编号
            order_no:'',
            //店铺ID
            shop_id:'',
            //店铺名字
            shop_name:'',
            //发送者微信ID
            sender_wechat_uin:'',
            //发送者微信昵称
            sender_wechat_nickname:'',
            //操作人ID
            operator_id:'',
            //操作人昵称
            operator_nickname:'',
            //状态 （1:待领取，2:已领取，3:未领取，4:领取失败）
            status:'',
            //查询结束始时间
            end_at:'',
            //查询开始时间
            begin_at:'',
            platform_type:'',
            order_nos:'',
            index:'',
            recordVisible:false,
            createReportaLoading:false,
            recipient_nickname:'', //接受者微信昵称
            buyer_id:'',//买家id
            reportList_offset: 1,
            //每页条数
            reportList_limit: 10,
            reportListLoaing:false,
        }
    }
    timestampToTime = (timestamp) =>{
        let date = new Date(timestamp)
        let Y = date.getFullYear()
        let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1)
        let D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
        return Y + '-' + M + '-' + D
    }
    // 获取数据
    getData (page,per_page) {
        const { dispatch } = this.props
        let begin = ''
        let end = ''
        if(this.state.end_at && this.state.begin_at){
            begin = this.timestampToTime(this.state.begin_at._d)
            end = this.timestampToTime(this.state.end_at._d)
        }

        dispatch({
            type: 'platform_redpacket/tableList',
            payload: {
                ...this.state,
                //当前页
                offset: (page -1)* per_page,
                //每页条数
                limit: per_page,
                begin_at: begin,
                end_at: end
            },
            callback:() =>{
            }
        })
    }
    // 获取店铺列表
    getShop () {
        const { dispatch } = this.props
        dispatch({
            type: 'platform_redpacket/shopList',
            payload: {
                //当前页
                offset: 0,
                //每页条数
                limit:500,
                service:'red-packet'
            },
            callback:() =>{
            }
        })
    }
    // 判断是否开通小红包功能
    checkPacket () {
        const { dispatch } = this.props
        dispatch({
            type: 'platform_redpacket/checkPacket',
            payload: {
                has_wx_pay:2
            },
            callback:() =>{

            }
        })
    }
    changeTime = (value) => {
        if(value.length>0){
            this.setState({
                begin_at:value[0],
                end_at:value[1]
            })
        }else {
            this.setState({
                begin_at:'',
                end_at:''
            }) 
        }
        
    }
    handleTableChange = (value,key,type) => {
        if(type === 'list'){
            this.setState({
                offset:value
            })
            this.getData(value,this.state.limit)
        }else{
            this.setState({
                reportList_offset:value
            })
            this.getReportList(value,this.state.reportList_limit)
        }
        
    }
    changeStatus = (value) => {
        this.setState({
            status:value || '',
        })
    }
    changeOperator = (value,option) => {
        this.setState({
            operator_id:value,
            operator_nickname:value ? option : '',
            sender_wechat_uin: '',
            sender_wechat_nickname:''
        })
    }
    changeWechat = (value,option) => {
        this.setState({
            sender_wechat_uin:value,
            sender_wechat_nickname:value ? option : ''
        })
    }
    changeShop = (value,option) => {
        this.setState({
            shop_id:value || '',
            shop_name:value ? option.props.children : ''
        })
    }
    toSelectchange = (value,pageSize,type) =>{
        if(type === 'list'){
            this.setState({
                offset:1,
                limit: pageSize
            })
            this.getData(1,pageSize)
        }else{
            this.setState({
                reportList_offset:1,
                reportList_limit: pageSize
            })
            this.getReportList(1,pageSize)
        }    
    }
    changeOrderno = (event) => {
        this.setState({
            order_no:event.target.value || ''
        })
    }
    handleSearch = () =>{
        this.setState({
            offset:1
        })
        this.getData(1, this.state.limit)
    }
    handleReset = () => {
        // this.props.form.resetFields()
        this.setState({
            //店铺关联订单编号
            order_no:'',
            //店铺ID
            shop_id:'',
            //店铺名字
            shop_name:'',
            //发送者微信ID
            sender_wechat_uin:'',
            sender_wechat_nickname:'',
            //操作人ID
            operator_id:'',
            operator_nickname:'',
            //状态 （1:待领取，2:已领取，3:未领取，4:领取失败）
            status:'',
            //查询结束始时间
            end_at:'',
            //查询开始时间
            begin_at:'',
            offset:1,
            recipient_nickname:'', //接受者微信昵称
            buyer_id:'',//买家id

        },()=>{
            this.getData(1,this.state.limit)
        })
    }

    componentDidMount () {
        this.getData(this.state.offset,this.state.limit)
        this.getShop()
        this.checkPacket()
    }
    showTips (tip) {
        Modal.warning({
            okText:'确定',
            title: '领取失败',
            content:<p>{tip}，<a target="_blank" without='true' rel='noopener noreferrer' style={{textDecoration:'underline'}} href="http://newhelp.51zan.cn/manual/content/%E8%90%A5%E9%94%80%E5%B9%B3%E5%8F%B0/%E5%B0%8F%E7%BA%A2%E5%8C%85/%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98.md">参考链接</a></p>,
            okType: 'primary'
        })
    }
    showOrderDetail = (record,index) =>{
        this.setState({
            platform_type:record.platform_type,
            order_nos:record.order_no,
            index:index
        })
    }
    hideOrderDetailsModal = () => {
        this.setState({
            platform_type:'',
            order_nos:'',
            index:''
        })
    }
    statu = (record) => {
        switch (record.status) {
            case  3 :
                return  <Popover placement="top" content={<div>客户24小时内未领取，红包已失效</div>}>
                    <span className={styles.circleGray}>已过期</span>
                </Popover>  
            case  2 :
                return <span className={styles.circleGreen}>已领取</span>
            case  1 :
                return <span className={styles.circleOrange}>待领取</span>
            case  4 :
                return <span className={styles.circleRed} onClick={() => this.showTips(record.payment.remark)}>领取失败</span>
            default:
                return null
        }
    }
    checkRecord = () =>{
        const {reportList_offset,reportList_limit} = this.state
        const {reportListLoaing} = this.state
        if(reportListLoaing){
            return false
        }
        this.getReportList(reportList_offset,reportList_limit)
    }
    getReportList = (page,per_page) =>{
        this.setState({
            reportListLoaing:true
        })
        this.props.dispatch({
            type:'platform_redpacket/reportList',
            payload:{
                offset: (page -1)* per_page,
                limit: per_page,
                type:3
            },
            callback:(res) =>{
                if(res.meta && res.meta.code === 200){
                    this.setState({
                        recordVisible:true,
                        
                    })
                }
                this.setState({
                    reportListLoaing:false
                })
            }
        })
    }
    handleCancel = () =>{
        this.setState({
            recordVisible:false,
            reportList_offset:1,
            reportList_limit: 10
        })
    }
    createRecord = () =>{
        //是否选择时间范围、是否是90天
        const {
            begin_at,
            end_at,
            status,
            operator_id,
            operator_nickname,
            sender_wechat_uin,
            sender_wechat_nickname,
            shop_id,
            shop_name,
            order_no,
            recipient_nickname,
            buyer_id
        } = this.state

        if(!begin_at || !end_at){
            message.error('生成新的报表数据，请先设置起止时间')
            return
        }
        if(begin_at && end_at){
            if(moment(end_at).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')){
                message.error('不支持下载当天数据')
                return
            }
            let days = moment(end_at).diff(moment(begin_at), 'days')
            if(Math.abs(days) + 1 > 90){
                message.error('当前仅支持下载90天内数据')
                return
            }
        }
        let postData = {
            begin_at:moment(begin_at).format('YYYY-MM-DD'),
            end_at:moment(end_at).format('YYYY-MM-DD'),
            status:status,
            operator_id:operator_id,
            operator:operator_nickname,
            sender_wechat_uin:sender_wechat_uin,
            sender_wechat_nickname:sender_wechat_nickname,
            shop_id:shop_id,
            shop_name:shop_name,
            order_no:order_no,
            recipient_nickname:recipient_nickname,
            buyer_id:buyer_id
        }
        this.createRedReportList(postData,'create')
    } 
    //重新生成
    createRenewReport = (e,data) =>{
        e.stopPropagation()
        let obj = {
            id:data.id,
            ...data.attach
        }
        this.createRedReportList(obj,'anew')
    }
    createRedReportList = (data,type) =>{
        this.setState({
            createReportaLoading:false
        })
        this.props.dispatch({
            type:'platform_redpacket/report',
            payload:data,
            callback:(res) =>{
                this.setState({
                    createReportaLoading:false
                })
                if(res.meta && res.meta.code === 200){
                    if(type === 'anew'){
                        message.success('重新生成成功')
                        this.getReportList(this.state.reportList_offset,this.state.reportList_limit)
                    }else{
                        message.success('生成中，请稍后在生成记录中查看')
                    }
                    
                }
            }
        })
    }
    rangeDisabledTime = (current) => {
        let nowAday = moment()
        if (current <= nowAday) return false
        else return true
    }
    changeRecipientnickname = (event) =>{
        this.setState({
            recipient_nickname:event.target.value || ''
        })
    }
    changeBuyerid = (event) =>{
        this.setState({
            buyer_id:event.target.value || ''
        })
    }
    render() {
        const { RangePicker } = DatePicker
        const Option = Select.Option
        const columns = [{
            title: '发送时间',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 180,
        },{
            title: '金额(元)',
            dataIndex: 'amount',
            key: 'amount',
            render: (text, record) => (
                <span>{(record.amount/100).toFixed(2)}</span>    
            ),
            className: 'hz-table-column-width-90',
            align: 'right',
        },{
            title: '状态',
            dataIndex: 'status',
            width:110,
            key: 'status', 
            render: (text, record) => (
                this.statu(record)
            )
        },{
            title: '接收微信',
            dataIndex: 'recipient_nickname',
            className: 'hz-table-column-width-120',
            key: 'recipient_nickname'
        },{
            title: '领取微信',
            dataIndex: 'gainer',
            width: 140,
            key: 'gainer'
        },{
            title: '订单号',
            dataIndex: 'order_no',
            key: 'order_no',
            render:(text,record,index) =>{
                return <a onClick={()=>this.showOrderDetail(record,index)}>{text}</a>
            }
        },{
            title: '店铺',
            dataIndex: 'shop_name',
            key: 'shop_name'
            
        },{
            title: '买家ID',
            dataIndex: 'buyer_id',
            key: 'buyer_id',
            className: 'hz-table-column-width-100'
        },{
            title: '操作人',
            className: 'hz-table-column-width-80',
            dataIndex: 'operator',
            key: 'operator'
        },{
            title: '发送微信',
            className: 'hz-table-column-width-120',
            dataIndex: 'sender_wechat_nickname',
            key: 'sender_wechat_nickname',
        },{
            title: '备注',
            dataIndex: 'remark',
            className: 'hz-table-column-width-150',
            key: 'remark'
        }]
        const formItemLayout = {
            labelCol: {
                span: 6,
                style: {
                    width: '70px',
                    textAlign: 'right'
                },
            },
            wrapperCol: {
                span: 16,
            },
        }
        const labelLayout = {
            titlelCol: {
                span: 16,
                style: {
                    width: '110px',
                    textAlign: 'right',
                },
            },
            textCol: {
                span: 6,
            }
        }
        const recordAction = (data) => <Row tyle="flex" justify="space-between">
            <Col span={18} style={{color:'#333333'}}>
                <span>生成时间：{data.created_at}</span>
                <span style={{marginLeft:24}}>完成时间：{data.complete_at}</span>
            </Col>
            <Col span={6} className={styles.recordHeaderRight}>
                <span className={styles.statusName}>
                    {
                        data.status === 1 && <Badge status="default" text="生成中" className={styles.statusBadge}/>
                    }
                    {
                        data.status === 2 && <Badge status="success" text="已完成" className={styles.statusBadge} style={{width:72}}/>
                    }
                    {
                        data.status === 3 && <Badge status="error" text="生成失败" className={styles.statusBadge} style={{marginRight:16}}/>
                    }
                </span>
                <span>
                    {
                        data.status === 2 ? <a href={'http://document.51zan.com/'+data.path}>下载</a> : ''
                    }
                    {
                        data.status === 1 ? <span style={{display:'inline-block',width:101,textAlign:'left'}}><a>--</a></span>: 
                            <span>
                                {
                                    data.status === 2 ? <Divider type="vertical" /> : ''
                                }
                                <a herf="javascript:;" onClick={(e) => this.createRenewReport(e,data)}>重新生成</a>
                            </span>                    
                    }
                </span>
            </Col>
        </Row>
        const { 
            limit, 
            offset, 
            order_no, 
            status,shop_id, operator_id, 
            begin_at, end_at, sender_wechat_uin,
            recipient_nickname,buyer_id,reportList_offset,
            reportList_limit,
        } = this.state
        const { shopList,data,count,ispacket, loading ,reportList,reportList_total} = this.props.platform_redpacket
        const subTitle = ispacket.length > 0 && `支付账号：${ispacket[0].name}`
        const action = ispacket.length === 0 && <div><Link to='/setting/authorization/subscription?type=openAuthorization'> <Button type="primary" className={styles.open}>未开通</Button></Link></div>
        const Panel = Collapse.Panel
        return (
            <Page className={styles.formSearch}>
                <Page.ContentHeader
                    title="红包记录"
                    subTitle={subTitle}
                    action={action}
                    helpUrl="http://newhelp.51zan.cn/manual/content/%E5%B0%8F%E7%BA%A2%E5%8C%85.md"
                />
                <Page.ContentDescription label='温馨提示：' text='为了便于管理和统计，本系统小红包统一从公众号商户平台付款。授权公众号、完成支付配置、开通企业付款到零钱、启用支付功能。即可开通小红包功能，为保障小红包功能的正常使用，请务必确保商户平台余额充足' />
                <Page.ContentAdvSearch>
                    <Form layout="horizontal" className="hz-from-search">
                        <Row>
                            <Col span={8}>
                                <Form.Item label="起止时间：" {...formItemLayout}>
                                    <RangePicker onChange={(value)=>{this.changeTime(value)}} style={{width:'100%'}}  value={[begin_at,end_at]} disabledDate={(current) => this.rangeDisabledTime(current)}/>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="状态：" {...formItemLayout}>
                                    <Select  value={status} onChange={(value)=>{this.changeStatus(value)}}>
                                        <Option value="" style={{color:'#bfbfbf !import'}}>全部状态</Option>
                                        <Option value="1">待领取</Option>
                                        <Option value="2">已领取</Option>
                                        <Option value="3">已过期</Option>
                                        <Option value="4">领取失败</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="操作人："  {...formItemLayout}>
                                    <UserSelect
                                        placeholder="选择操作人账号"
                                        userId={operator_id}
                                        onChange={(value,option)=>{this.changeOperator(value,option)}}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={8}>
                                <Form.Item label="发送微信：" {...formItemLayout}>
                                    <WeChatSelectSingle
                                        placeholder="选择操作人微信号"
                                        userId={operator_id}
                                        uin={sender_wechat_uin}
                                        onChange={(value,option)=>{this.changeWechat(value,option)}}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="店铺："  {...formItemLayout}>
                                    <Select placeholder="选择店铺"  value={shop_id}   onChange={(value,option)=>{this.changeShop(value,option)}}>
                                        <Option value="" style={{color:'#bfbfbf !import'}}>全部店铺</Option>
                                        {
                                            shopList.map(function (item, index) {
                                                return <Option key={index} value={item.id}>{item.name}</Option>
                                            })
                                        }
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="订单号："  {...formItemLayout}>
                                    <Input placeholder="输入订单号"    value={order_no}  onChange={(value)=>{this.changeOrderno(value)}}/>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={8}>
                                <Form.Item label="接收微信"  {...formItemLayout}>
                                    <Input placeholder="输入接收人微信昵称" value={recipient_nickname}  onChange={(value)=>{this.changeRecipientnickname(value)}}/>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="买家ID"  {...formItemLayout}>
                                    <Input placeholder="输入买家ID" value={buyer_id}  onChange={(value)=>{this.changeBuyerid(value)}}/>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={8}>
                                <Col span={3} style={{width: '70px'}}></Col>
                                <Col span={16}>
                                    <Button className="hz-btn-width-default" type="primary" htmlType="submit" onClick={this.handleSearch}>
                                        <Icon type="search"/>
                                        搜索
                                    </Button>
                                    <Button className="hz-btn-width-default hz-margin-small-left" style={{marginLeft:'16px'}} onClick={this.handleReset}>
                                        重置
                                    </Button>
                                </Col>
                            </Col>
                        </Row>
                    </Form>
                </Page.ContentAdvSearch>
                <Row type="flex" justify="end" style={{marginBottom:16}}>
                    <Col>
                        <Button type="primary" ghost onClick={this.createRecord} loading={this.state.createReportaLoading} disabled={this.state.createReportaLoading}>
                            <Icon component={DownloadSvg} style={{ fontSize: '16px' }}/>
                            生成红包列表
                        </Button>
                        <Button className="hz-btn-width-default hz-margin-small-left" style={{marginLeft:'16px'}} onClick={this.checkRecord}>
                           生成记录
                        </Button>
                        <Popover placement="bottom" arrowPointAtCenter={true} content='当前仅支持下载90天内数据'>
                            <span style={{marginLeft:8}}><Icon className="hz-text-primary hz-icon-size-default" type="question-circle-o" /></span>
                        </Popover>
                    </Col>
                </Row>
                <Table
                    pagination={false}
                    columns={columns}
                    className={styles.red_packet}
                    loading= {loading}
                    rowKey={record => record.id}
                    dataSource={data}
                    scroll={{ x: 1366 }} />
                {data.length? (
                    <Pagination
                        className="ant-table-pagination"
                        total={count}
                        current={offset}
                        showQuickJumper={true}
                        showTotal={total => `共${count}条记录`}
                        pageSize={ limit }
                        pageSizeOptions= {['10','20','50','100']}
                        showSizeChanger={true}
                        onShowSizeChange={(value,pageSize)=>this.toSelectchange(value,pageSize,'list')}
                        onChange={(value,key)=>this.handleTableChange(value,key,'list')}
                    />
                ) : (
                    ''
                )}
                <OrderDetails
                    key={this.state.index}
                    order_no = {this.state.order_nos}
                    platform_type = {this.state.platform_type}
                    onClose={this.hideOrderDetailsModal}
                ></OrderDetails>
                <Modal
                    title="生成记录"
                    footer={null}
                    visible={this.state.recordVisible}
                    width="900px"
                    onCancel={this.handleCancel}
                    maskClosable={false}
                    destroyOnClose

                >
                    <Spin spinning={this.state.reportListLoaing}>
                        <Collapse className={styles.carriage} bordered={false} defaultActiveKey={[]} expandIcon={({ isActive }) => <Icon type="caret-right" style={{color:'#55638B'}} rotate={isActive ? 90 : 0} />} accordion>
                            {
                                reportList && reportList.map((item, index) => {
                                    return <Panel header={recordAction(item)} key={index + ''} className={styles.customPanelStyle}>
                                        <div className={styles.CollapsePartItem}>
                                            <div className={styles.partItemDetail}>
                                                <div>
                                                    <Label title="起止日期" text={item.attach.begin_at+'~'+item.attach.end_at} {...labelLayout}></Label>
                                                </div>
                                                <div>
                                                    <Label title="状态" text={item.attach.status ? getStatusByVal(item.attach.status) : '全部状态'} {...labelLayout}></Label>
                                                </div>
                                                <div>
                                                    <Label title="操作人" text={item.attach.operator ? item.attach.operator : '全部【员工】'} {...labelLayout}></Label>
                                                </div>
                                                <div>
                                                    <Label title="发送微信" text={item.attach.sender_wechat_nickname ? item.attach.sender_wechat_nickname : '全部【微信号】'} {...labelLayout}></Label>
                                                </div>
                                                <div>
                                                    <Label title="接收微信" text={item.attach.recipient_nickname} {...labelLayout}></Label>
                                                </div>
                                                <div>
                                                    <Label title="买家ID" text={item.attach.buyer_id} {...labelLayout}></Label>
                                                </div>
                                                <div>
                                                    <Label title="店铺" text={item.attach.shop_name ? item.attach.shop_name : '全部店铺'} {...labelLayout}></Label>
                                                </div>
                                            </div>
                                        </div>
                                    </Panel>
                                })
                            }
                        </Collapse>
                        
                        <div style={{overflow:'hidden'}}>
                            {
                                reportList.length ? <Pagination
                                    className="ant-table-pagination"
                                    total={reportList_total}
                                    current={reportList_offset}
                                    size="small"
                                    showQuickJumper={true}
                                    showTotal={total => `共${reportList_total}条记录`}
                                    pageSize={ reportList_limit }
                                    pageSizeOptions= {['10','20','50','100']}
                                    showSizeChanger={true}
                                    onShowSizeChange={(value,pageSize)=>this.toSelectchange(value,pageSize,'reportList')}
                                    onChange={(value,key)=>this.handleTableChange(value,key,'reportList')}
                                /> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                            }
                        </div>
                    </Spin>
                </Modal>
            </Page>
        )
    }
}
