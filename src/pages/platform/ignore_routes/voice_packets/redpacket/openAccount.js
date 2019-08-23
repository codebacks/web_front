/**
 **@Description:
 **@author: 吴明
 */

import React, {Component} from 'react'
import { DatePicker, Select,Form, Row, Col, Input, Button, Table, Pagination, Modal, Icon, Popover } from 'antd'
import OrderDetails from 'setting/ignore_routes/shop_order/shop_orders_details'
import {connect} from 'dva'
import RechargeAccount from '../compoments/rechargeAccount'
import WeChatSelectSingle from 'components/business/WeChatSelectSingle'
import UserSelect from 'components/business/UserSelect'
import PromotionActivity from '../compoments/promotionActivity'
import Page from '@/components/business/Page'
import {jine} from '../../../../../utils/display'
import {Link} from 'dva/router'
import styles from './index.less'

@connect(({base,platform_voicepacket}) => ({
    base,
    platform_voicepacket
}))
@Form.create()

export default class Index extends Component {
    constructor ( props) {
        super(props)
        this.state = {
            offset: 1,
            limit: 10,
            order_no:'',
            shop_id:'',
            sender_wechat_uin:'',
            operator_id:'',
            status:'',
            end_at:'',
            begin_at:'',
            platform_type:'',
            order_nos:'',
            index:'',
            visibleRecharge:false,
            payOk:false,
            activityVisible:false
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
        const  { 
            order_no,
            shop_id,
            sender_wechat_uin,
            operator_id,
            status} = this.state
        let begin = ''
        let end = ''
        if(this.state.end_at && this.state.begin_at){
            begin = this.timestampToTime(this.state.begin_at._d)
            end = this.timestampToTime(this.state.end_at._d)
        }

        dispatch({
            type: 'platform_voicepacket/voicePacketsList',
            payload: {
                order_no:order_no,
                shop_id:shop_id,
                sender_wechat_uin:sender_wechat_uin,
                operator_id:operator_id,
                status:status,
                offset: (page -1)* per_page,
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
            type: 'platform_voicepacket/shopList',
            payload: {
                offset: 0,
                limit:500,
                service:'red-packet'
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
    handleTableChange = (value,key) => {
        this.setState({
            offset:value
        })
        this.getData(value,this.state.limit)
    }
    changeStatus = (value) => {
        this.setState({
            status:value || ''
        })
    }
    changeOperator = (value) => {
        this.setState({
            operator_id:value,
            sender_wechat_uin: ''
        })
    }
    changeWechat = (value) => {
        this.setState({
            sender_wechat_uin:value
        })
    }
    changeShop = (value) => {
        this.setState({
            shop_id:value || ''
        })
    }
    toSelectchange = (value,pageSize) =>{
        this.setState({
            offset:1,
            limit: pageSize
        })
        this.getData(1,pageSize)
    }
    changeOrderno = (event) => {
        this.setState({
            order_no:event.target.value || ''
        })
    }
    handleSearch = () =>{
        this.getData(1, this.state.limit)
    }
    handleReset = () => {
        this.setState({
            order_no:'',
            shop_id:'',
            sender_wechat_uin:'',
            operator_id:'',
            status:'',
            end_at:'',
            begin_at:'',
            offset:1
        },()=>{
            this.getData(this.state.offset,this.state.limit)
        })
    }

    componentDidMount () {
        let activity_code = sessionStorage.getItem('HUZAN_ACTIVITY_CODE')
        if(!activity_code){
            this.setState({
                activityVisible:true
            })
            sessionStorage.setItem('HUZAN_ACTIVITY_CODE',true)
        }
        this.getData(this.state.offset,this.state.limit)
        this.getShop()
    }
    showTips (tip) {
        Modal.warning({
            okText:'确定',
            title: '失败说明',
            content: tip,
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
    onCancel = (value) =>{
        if(value === '1'){
            this.setState({
                visibleRecharge:false,
            })
        }else{
            this.setState({
                visibleRecharge:false,
                payOk:true
            })
        }
    }
    rechargeAccount = () =>{
        this.setState({
            visibleRecharge:true
        })
    }
    handleOk=()=>{
        const { dispatch } = this.props
        dispatch({
            type: 'platform_voicepacket/voicePacketsAccount',
            payload: {
            },
            callback:(data) =>{
            }
        })
        this.setState({
            payOk:false
        })
    }
    handleCancel = () =>{
        window.open('http://newhelp.51zan.cn/manual/content/%E8%90%A5%E9%94%80%E5%B9%B3%E5%8F%B0/%E8%AF%AD%E9%9F%B3%E7%BA%A2%E5%8C%85/%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98.md','_blank')
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
    handleCancelActivity = ()=>{
        this.setState({
            activityVisible:false
        })
    }
    handleActivityRecharge =()=>{
        this.setState({
            activityVisible:false,
            visibleRecharge:true
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
            title: '金额',
            dataIndex: 'amount',
            key: 'amount',
            render: (text, record) => (
                <span>{jine(text,'','Fen')}</span>    
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
                    width: '80px',
                    textAlign: 'right'
                },
            },
            wrapperCol: {
                span: 16,
            },
        }
        const { limit, offset, order_no, status,shop_id,activityVisible, operator_id, begin_at,payOk, end_at, sender_wechat_uin} = this.state
        const { shopList,data,count,loading,accountInfo } = this.props.platform_voicepacket
        return (
            <Page >
                <Page.ContentHeader
                    title="红包列表"
                    helpUrl='http://newhelp.51zan.cn/manual/content/%E8%90%A5%E9%94%80%E5%B9%B3%E5%8F%B0/%E8%AF%AD%E9%9F%B3%E7%BA%A2%E5%8C%85.md'
                />
                <div className={styles.formSearch}>
                    <div className={styles.description}>语音红包为第三方提供的红包发送功能， 在第三方平台微信充值账户之后，就可以在牛客服上发送语音红包了，虎赞新零售平台会记录相关数据，方便查询和对账。</div>
                    <Form className={styles.accountInfo}>
                        <Row>
                            <Col span={12} className={styles.accountName}>
                                <div className={styles.thirdAvatar}>
                                    <img  className={styles.avatar}   src={require('../../../assets/images/thirdAvatar.svg')} alt="第三方头像"/>
                                    <div style={{marginLeft:16}}>
                                        <p>第三方账户名</p>
                                        <p className={styles.name}>{accountInfo.nick_name}</p>      
                                    </div>
                                </div>
                                <div>
                                    <Button type='primary' className={styles.button} onClick={()=>{this.rechargeAccount()}}>立即充值</Button>
                                    <Link to='/platform/voice_packets/recharge'><Button  className={styles.buttonRecord}>充值记录</Button></Link>
                                </div>
                            </Col>
                            <Col span={12} className={styles.accountMoney}>
                                <div className={styles.totalMoney}>
                                    <p>账户余额（元）</p>
                                    <p>{jine(accountInfo.amount,'','Fen')}</p>
                                </div>
                                <div className={styles.availMoney}>
                                    <p>可用余额（元）</p>
                                    <p>{jine(accountInfo.amount - accountInfo.frozen_amount,'','Fen')}</p>
                                </div>
                            </Col>
                        </Row>
                    </Form>
                </div>
                <Page.ContentAdvSearch>
                    <Form layout="horizontal" className="hz-from-search">
                        <Row>
                            <Col span={8}>
                                <Form.Item label="起止时间：" {...formItemLayout}>
                                    <RangePicker onChange={(value)=>{this.changeTime(value)}} style={{width:'100%'}}  value={[begin_at,end_at]}/>
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
                                        onChange={(value)=>{this.changeOperator(value)}}
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
                                        onChange={(value)=>{this.changeWechat(value)}}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="店铺："  {...formItemLayout}>
                                    <Select placeholder="选择店铺"  value={shop_id}   onChange={(value)=>{this.changeShop(value)}}>
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
                                <Col span={3} style={{width: '80px'}}></Col>
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
                <Table
                    pagination={false}
                    columns={columns}
                    loading= {loading}
                    className={styles.voice_packet}
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
                        onShowSizeChange={this.toSelectchange.bind(this)}
                        onChange={this.handleTableChange.bind(this)}
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
                <RechargeAccount visible={this.state.visibleRecharge} onCancel={this.onCancel}  key={this.state.visibleRecharge}></RechargeAccount>
                <Modal
                    visible={payOk}
                    onOk={this.handleOk}
                    cancelText='支付遇见问题'
                    okText='充值完成'
                    closable={false}
                    maskClosable={false}
                    onCancel={this.handleCancel}
                >
                    <p><Icon type="exclamation-circle" theme="filled"  style={{color:'#F15043',fontSize:'20px'}} /><span className={styles.payTip}>在完成付款之前，请不要关闭这个窗口</span></p>
                    <p style={{paddingLeft:'28px'}}>请在新页面扫码支付，完成充值！</p>
                </Modal>
                <PromotionActivity  activityVisible = {activityVisible}  cancelActivity={this.handleCancelActivity}  cancelRecharge={this.handleActivityRecharge}/>
            </Page>
        )
    }
}
