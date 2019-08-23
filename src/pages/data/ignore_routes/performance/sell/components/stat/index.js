'use strict'

import React from 'react'
import {Table, Button, Form, Radio, Row, Col,Popover,Modal, Pagination, DatePicker,Icon,message,Cascader} from 'antd'
import {connect} from 'dva'
import moment from 'moment'
import 'moment/locale/zh-cn'
// import documentTitleDecorator from 'hoc/documentTitle'
import Page, {ContentAdvSearch as PageContentAdvSearch} from  'components/business/Page'
import { SHOP_TYPE, getMappingPlatformByType, getMappingFromByType, getMappingDecByOri } from '@/common/shopConf'
import downloadSvg  from '@/assets/font_icons/download.svg'
import DepartmentSelect from 'components/business/DepartmentSelect'
import UserSelect from 'components/business/UserSelect'
import styles from './index.less'
import ModelDetail from './modelDetail'
import UpdataPerf from './updatePerf'
import CreateRecord from './createRecord'
import OperateRecord from './operateRecord'
moment.locale('zh-cn')
const { MonthPicker,  WeekPicker } = DatePicker
const FormItem = Form.Item
const UPDATE_STATUS={
    1:'更新中',
    2:'更新成功',
    3:'更新失败'
}

const  STATISTICS_STATE = 1  

const  ORDER_STATE = 2  

@connect(({ base, data_performance_sell}) => ({
    base, data_performance_sell
}))
// @documentTitleDecorator()
export default class extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            type:'1',
            user_id:'',
            wechat_id:'',
            metric_mode:'',
            view_mode:'',
            visible:false,
            updateVisible:false,
            schedule:{},
            recordVisible:false,
            createVisible:false,
            recordType:'',
        }
    }

    componentDidMount() {
        this.handleSearch()
        this.queryUpdateStatus()
        this.getShops()
        this.timer = setInterval(()=>{
            this.queryUpdateStatus()
        },5000)
    }

    getShops = () => {
        this.props.dispatch({
            type: 'data_performance_sell/getShops'
        })
    }
    queryUpdateStatus= ()=>{
        this.props.dispatch({
            type:'data_performance_sell/queryUpdateStatus',
            payload:{},
            callback:(data)=>{
                this.setState({
                    schedule:data
                })
                if(!data || data.status!==1 ){
                    clearInterval(this.timer)
                }
            }
        })
    }
    handleSearch = () => {
        this.props.dispatch({
            type: 'data_performance_sell/query',
            payload: {
                offset:1
            },
            callback:()=>{
                this.setState({
                    user_id:'',
                    wechat_id:'',
                    metric_mode:'',
                    view_mode:'' 
                })
            }
        })
    }
    handleChangeDate = (startValue, endValue) => {
        const {range,params} = this.props.data_performance_sell
        if (startValue) {
            params.start_at =moment(startValue).startOf(`${range}`).format('YYYY-MM-DD')
            params.end_at = moment(startValue).endOf(`${range}`).format('YYYY-MM-DD')
        } else {
            params.start_at = ''
            params.end_at = ''
        }
        this.props.dispatch({
            type:'data_performance_sell/setParams',
            payload:{
                params:{
                    ...params
                }
            }
        })
    };
    setTimeRange = (startValue, endValue) => {
        let range = ''
        if(moment().subtract(1, 'days').isSame(startValue, 'day')
      && moment().isSame(endValue, 'day')){
            range = 'yesterday'
        }else if(moment().subtract(6, 'days').isSame(startValue, 'day')
      && moment().isSame(endValue, 'day')){
            range = 'week'
        }else if(moment().subtract(29, 'days').isSame(startValue,'day')
      && moment().isSame(endValue, 'day')){
            range = 'month'
        }
        this.props.dispatch({
            type: 'data_performance_sell/setProperty',
            payload: {range: range}
        })
    }
    handleChange = (key, e) => {
        let val = ''
        if (key === 'query') {
            val = e.target.value
        } else {
            val = e
        }
        let params = {...this.props.data_performance_sell.params}
        params[key] = val
        if (key === 'department_id') {
            params['user_id'] = undefined
            params['uin'] = undefined
        } else if (key === 'user_id') {
            params['uin'] = undefined
        }else if(key ==='shop_id'){
            params['platform']= e[0]
            params['shop_id']= e[1]
        }
        this.props.dispatch({
            type: 'data_performance_sell/setParams',
            payload: {params: params},
        })
    };

    handleChangeTimeRange = (e) => {
        const value = e.target.value
        switch(value) {
            case 'day':
                this.setTimeParams('day')
                break
            case 'week':
                this.setTimeParams('week')
                break
            case 'month':
                this.setTimeParams('month')
                break
            default:
        }
        this.props.dispatch({
            type: 'data_performance_sell/setProperty',
            payload: {
                range: value
            }
        })
    }
    handleChangeType = (e)=>{
        this.props.dispatch({
            type: 'data_performance_sell/query',
            payload: {
                params:{
                    type: e.target.value
                },
                offset:1
            }
        })
    }
    setTimeParams = (days) => {
        const startTime =  moment().subtract(1, `${days}s`).endOf(`${days}`).startOf(`${days}`).format('YYYY-MM-DD')
        const endTime = moment().subtract(1, `${days}s`).endOf(`${days}`).endOf(`${days}`).format('YYYY-MM-DD')
        this.props.dispatch({
            type: 'data_performance_sell/setParams',
            payload: {
                params: {
                    start_at: startTime,
                    end_at: endTime
                }
            }
        })
    }
    downLoadDetail = () =>{
        this.props.dispatch({
            type: 'data_performance_sell/downloadSell',
            payload: {
            },
            callback: (url)=>{
                window.location.href=url
            }
        })
    }
    handleChangeSize = ( current,size) =>{
        this.props.dispatch({
            type: 'data_performance_sell/query',
            payload: {
                params:{
                    limit:size 
                },
                offset:current
            }
        })
    }
    goToPage = (current) =>{
        this.props.dispatch({
            type: 'data_performance_sell/query',
            payload: {
                offset:current
            }
        })
    }
    sort =(key) =>{
        const {params} = this.props.data_performance_sell
        if(params.sort !== key){
            this.props.dispatch({
                type: 'data_performance_sell/query',
                payload: {
                    params:{
                        sort:key
                    },
                    offset:1

                }
            })
        }
        
    } 
    disabledDate =(current) =>{
        const {range} = this.props.data_performance_sell
        return current && current > moment().subtract(1,`${range}s`).endOf(`${range}`)
    }
    resetSearch = ()=>{
        this.props.dispatch({
            type:'data_performance_sell/setProperty',
            payload:{
                params:{
                    start_at: moment().subtract(1, 'days').format('YYYY-MM-DD'),
                    end_at: moment().subtract(1, 'days').format('YYYY-MM-DD'),
                    department_id: undefined,
                    user_id: undefined,
                    type:'2',
                    limit:10,
                    offset:0,
                    sort:'amount'
                },
                range:'day'
            }
        })

        this.props.dispatch({
            type: 'data_performance_sell/query',
            payload: {
                offset:1,
                range:'day',
                params:{
                    start_at: moment().subtract(1, 'days').format('YYYY-MM-DD'),
                    end_at: moment().subtract(1, 'days').format('YYYY-MM-DD'),
                    department_id: undefined,
                    user_id: undefined,
                    type:'2',
                    limit:10,
                    offset:0,
                    sort:'amount'
                },
            }
        })

    }

    handleModelOrderCustomerCount = (record) =>{
        this.setState({
            metric_mode:1,
            view_mode:1,
            user_id:record.user_id,
            wechat_id:record.wechat_id,
            visible:true
        })
    }
    handleModelOrderCount = (record) =>{
        this.setState({
            metric_mode:1,
            view_mode:2,
            user_id:record.user_id,
            wechat_id:record.wechat_id,
            visible:true
        })
    }
 
    handleModelReceiveCustomerCount =(record)=>{
        this.setState({
            metric_mode:2,
            view_mode:1,
            user_id:record.user_id,
            wechat_id:record.wechat_id,
            visible:true
        })
    }

    handleModelReceiveOrderCount = (record)=>{
        this.setState({
            metric_mode:2,
            view_mode:2,
            user_id:record.user_id,
            wechat_id:record.wechat_id,
            visible:true
        })
    }
    handleCancelModel = ()=>{
        this.setState({
            visible:false
        })
    }
    dateType = () => {
        const {range,params} = this.props.data_performance_sell
        switch (range) {
            case 'day' :
                return <DatePicker
                    format="YYYY-MM-DD"
                    // value={moment().subtract(1, `days`)}
                    showToday={false}
                    style={{width:'50%'}}
                    value={params.start_at?moment(params.start_at).endOf('day'):''}
                    onChange={this.handleChangeDate}
                    placeholder="请选择"
                    allowClear={false}
                    disabledDate={this.disabledDate}
                />
            case "week" :
                return <WeekPicker
                    placeholder="请选择" 
                    value={params.start_at?moment(params.start_at).endOf('week'):''}
                    style={{width:'50%'}}
                    allowClear={false}
                    onChange={this.handleChangeDate}
                    disabledDate={this.disabledDate}
                />
            case "month" :
                return   <MonthPicker 
                    placeholder="请选择" 
                    style={{width:'50%'}}
                    allowClear={false}
                    value={params.start_at?moment(params.start_at).endOf('month'):''}
                    onChange={this.handleChangeDate}
                    disabledDate={this.disabledDate}
                />
        }   
    } 
    /**
     * 是否是微信账号视图
     */
    isWeChatAccountView = () => {
        return this.props.data_performance_sell.params.type === "1"
    }
    handleUpdateData = ()=>{ 
        if(moment().format('HH:mm:ss')>'23:00:00' || moment().format('HH:mm:ss')<'09:00:00' ){
            Modal.error({
                icon:<Icon type="exclamation-circle" theme="filled" style={{color:'#F15043',fontSize:'24px','verticalAlign':'bottom'}} />,
                title: '更新数据提示',
                okText:'确定',
                content: '每日23:00:00-次日09:00:00绩效数据稽核中，请勿更新，谢谢',
            })
        }else{
            this.setState({
                updateVisible:true
            })
        }
    }
    handleCancelUpdate =(value)=>{
        if(value){
            this.queryUpdateStatus()
            this.timer = setInterval(()=>{
                this.queryUpdateStatus()
            },5000)
        }
        this.setState({
            updateVisible:false,
            createVisible:false
        })
    }
    createStatement =(value)=>{
        this.setState({
            createVisible:true,
            recordType:value
        })
    }


    operateRecord = ()=>{
        this.setState({
            recordVisible:true
        })
    }
    handleCancelRecord =()=>{
        this.setState({
            recordVisible:false
        })
    }
    componentWillUnmount (){
        clearInterval(this.timer)
    }
    handleCloseSchedule =()=>{
        const { schedule } = this.state 
        delete schedule['end_date']
        this.setState({schedule})
    }
    render() {
        const {params, loading, range,list,current,total,shops} = this.props.data_performance_sell
        const { user_id ,wechat_id , metric_mode,view_mode,visible,updateVisible,schedule,recordVisible,createVisible,recordType} = this.state
        const  disabled = schedule&&schedule.hasOwnProperty('start_date') && schedule.status===1?true:false
        const columns =[
            {
                title: '排行',
                fixed: 'left',
                width: 100,
                align:'center',
                key:'center',
                render:(text,record,index)=>{
                    if( params.sort === 'department_name' ||  params.sort === 'user_nickname'){
                        return <div className={styles.ellipsis100}>--</div>
                    }else{
                        if(params.offset === 0){
                            if(index === 0){
                                return <img style={{width:'40px'}}   title='第一名' src={require('../../../../../assets/images/gold.svg')} />
                            }else if(index ===1){
                                return <img  style={{width:'40px'}} title='第二名' src={require('../../../../../assets/images/silver.svg')} />
                            }else if (index ===2){
                                return <img  style={{width:'40px'}} title='第三名'  src={require('../../../../../assets/images/copper.svg')} />
                            }else{
                                return <div className={styles.ellipsis100}>{index+1}</div>
                            }
                        }else{
                            return <div className={styles.ellipsis100}>{index+1 + params.offset }</div>
                        }
                        
                    }
                }
            },
            // {
            //     title: ()=>{
            //         return (
            //             <span  className={styles.cursor} onClick={()=>this.sort('department_name')}>部门 <Icon style={{color:params.sort === 'department_name'?'#000':'#999'  }}  type="caret-down"/></span>
            //         )
            //     },
            //     fixed: 'left',
            //     className: 'hz-table-column-width-100',
            //     key:'department_name',
            //     dataIndex: 'department_name'
            // },
            {
                title: ()=>{
                    return (
                        <span  className={styles.cursor}  onClick={()=>this.sort('user_nickname')}>员工 <Icon  style={{color:params.sort === 'user_nickname'?'#000':'#999'  }} type="caret-down"/></span>
                    )
                },
                width: 120,
                fixed: 'left',
                dataIndex: 'user_nickname',
                key:'user_nickname',
                render:(text,record,index)=>{
                    return <div className={styles.ellipsis120}>{text}</div>
                }
            },
            {
                title: !this.isWeChatAccountView() ?'绑定微信数':'所属微信',
                fixed: 'left',
                key:'wechat',
                width:120,
                render:(text,record,index)=>{
                    return  !this.isWeChatAccountView() ? 
                        <div className={styles.ellipsis120}>{record.wechat_count}</div>
                        :
                        <Popover placement="top" content={record.wechat_nickname}>
                            <div className={styles.ellipsis120}>{record.wechat_nickname}</div>
                        </Popover>
                }
            },
            this.isWeChatAccountView() ? {
                title: '微信备注',
                fixed: 'left',
                dataIndex: 'wechat_remark',
                width:120,
                key:'wechat_remark',
                render:(text,record,index)=>{
                    return <Popover placement="top" content={text}>
                        <div className={styles.ellipsis120}>{text}</div>
                    </Popover> 
                }
            }:{}
            ,
            {
                title: ()=>{
                    return (
                        <span  className={styles.cursor}  onClick={()=>this.sort('order_customer_count')}>付款客户数 <Icon  style={{color:params.sort === 'order_customer_count'?'#000':'#999'  }}  type="caret-down"/></span>
                    )
                },
                className: 'hz-table-column-width-130',
                dataIndex: 'order_customer_count',
                key:'order_customer_count',
                render:(text,record,index)=>{
                    return  text===0 ?  <span>{text}</span> : <a onClick={()=>{this.handleModelOrderCustomerCount(record)}}>{text}</a>
                }
            },
            {
                title: '付款客户比例',
                dataIndex: 'order_customer_ratio',
                className: 'hz-table-column-width-120',
                key:'order_customer_ratio',
                render:(text,record,index)=>{
                    return <div>{text}%</div>
                }
            },
            {   
                title: ()=>{
                    return (
                        <span  className={styles.cursor}  onClick={()=>this.sort('amount')}>付款金额 <Icon  style={{color:params.sort === 'amount'?'#000':'#999'  }} type="caret-down"/></span>
                    )
                },
                className: 'hz-table-column-width-110',
                dataIndex: 'amount',
                key:'amount',
                render:(text,record,index)=>{
                    return <div>{(text/100).toFixed(2)}</div>
                }
            },
            {
                title: ()=>{
                    return (
                        <span  className={styles.cursor}  onClick={()=>this.sort('order_count')}>付款订单数 <Icon style={{color:params.sort === 'order_count'?'#000':'#999'  }}  type="caret-down"/></span>
                    )
                },
                className: 'hz-table-column-width-130',
                key:'order_count',
                dataIndex: 'order_count',
                render:(text,record,index)=>{
                    return text===0 ?  <span>{text}</span> : <a onClick={()=>{this.handleModelOrderCount(record)}}>{text}</a>
                }
            },
            {
                title: ()=>{
                    return (
                        <span  className={styles.cursor}  onClick={()=>this.sort('order_price')}>付款客单价 <Icon style={{color:params.sort === 'order_price'?'#000':'#999'  }} type="caret-down"/></span>
                    )
                }, 
                className: 'hz-table-column-width-130',
                key:'order_price',
                dataIndex: 'order_price',
                render:(text,record,index)=>{
                    return <div>{(text/100).toFixed(2)}</div>
                }
            },
            {
                title: ()=>{
                    return (
                        <span  className={styles.cursor}  onClick={()=>this.sort('receive_customer_count')}>成功交易客户数 <Icon style={{color:params.sort === 'receive_customer_count'?'#000':'#999'  }}  type="caret-down"/></span>
                    )
                }, 
                className: 'hz-table-column-width-150',
                key:'receive_customer_count',
                dataIndex: 'receive_customer_count',
                render:(text,record,index)=>{
                    return text===0 ?  <span>{text}</span> : <a onClick={()=>{this.handleModelReceiveCustomerCount(record)}}>{text}</a>
                }
            },
            {
                title: '成功交易客户比例',
                className: 'hz-table-column-width-150',
                dataIndex: 'receive_customer_ratio',
                key:'receive_customer_ratio',    
                render:(text,record,index)=>{
                    return <div>{text}%</div>
                }
            },
            {
                title: ()=>{
                    return (
                        <span  className={styles.cursor}  onClick={()=>this.sort('receive_amount')}>成功交易金额 <Icon style={{color:params.sort === 'receive_amount'?'#000':'#999'  }} type="caret-down"/></span>
                    )
                } ,
                className: 'hz-table-column-width-140',
                dataIndex: 'receive_amount',
                key: 'receive_amount',
                render:(text,record,index)=>{
                    return <div>{(text/100).toFixed(2)}</div>
                }
            },
            {
                title: ()=>{
                    return (
                        <span  className={styles.cursor}  onClick={()=>this.sort('receive_order_count')}>成功交易订单数 <Icon  style={{color:params.sort === 'receive_order_count'?'#000':'#999'  }} type="caret-down"/></span>
                    )
                } ,
                className: 'hz-table-column-width-150',
                dataIndex: 'receive_order_count',
                key: 'receive_order_count',
                render:(text,record,index)=>{
                    return text===0 ?  <span>{text}</span> :<a onClick={()=>{this.handleModelReceiveOrderCount(record)}}>{text}</a>
                }
            },
            {
                title: ()=>{
                    return (
                        <span  className={styles.cursor}  onClick={()=>this.sort('receive_price')}>成功交易客单价 <Icon style={{color:params.sort === 'receive_price'?'#000':'#999'  }} type="caret-down"/></span>
                    )
                },
                className: 'hz-table-column-width-160',
                dataIndex: 'receive_price',
                key: 'receive_price',
                render:(text,record,index)=>{
                    return <div>{(text/100).toFixed(2)}</div>
                }
            }
        ]

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

        let type = []
        const arr =SHOP_TYPE.filter((item) => { 
            return  item.name !== 'Mendian'
        })

        arr.forEach((item, index) => { 
            type.push({
                value: item.value,
                label: item.type,
                children: [{
                    value:'',
                    label:'不限'
                }],
            })
        })
        shops.forEach((val,key) => { 
            type.forEach((v,k) => { 
                if (val.type === v.value) { 
                    v.children.push({
                        value: val.id,
                        label: val.name,  
                    })
                }
            }) 
        })
        
        const action=(
            <div>
                <header style={{'fontSize':'16px','borderBottom':'1px solid #E3E3E3','paddingBottom':'14px'}}>列表数据说明</header>
                <p className={styles.tipName}><span  className={styles.tipContent}>付款客户数</span>下单并付款（含货到付款）的客户数</p>
                <p className={styles.tipName}><span className={styles.tipContent}>付款客户比例</span>付款客户数/周期最后一天客户总数*100%</p>
                <p className={styles.tipName}><span className={styles.tipContent}>付款金额</span>客户下单并付款（含货到付款）的订单总金额</p>
                <p className={styles.tipName}><span className={styles.tipContent}>付款订单数</span>客户下单并付款（含货到付款）的订单笔数</p>
                <p className={styles.tipName}><span className={styles.tipContent}>付款客单价</span>付款金额/付款订单数</p>
                <p className={styles.tipName}><span className={styles.tipContent}>成功交易客户数</span>订单完成的客户数</p>
                <p className={styles.tipName}><span className={styles.tipContent}>成功交易客户比例</span>成功交易客户数/周期最后一天客户总数*100%</p>
                <p className={styles.tipName}><span className={styles.tipContent}>成功交易金额</span>客户订单完成的订单总金额</p>
                <p className={styles.tipName}><span className={styles.tipContent}>成功交易订单数</span>客户订单完成的订单笔数</p>
                <p className={styles.tipName}><span className={styles.tipContent}>成功订单客单价</span>成功交易金额/成功交易次数</p>
            </div>
        )
        return (
            // <Page>
            <div className={styles.data_sell}> 
                <PageContentAdvSearch>
                    <Form>
                        <Row>
                            <Col>
                                <h5 className='title' style={{fontSize:14}}>温馨提示：</h5>
                            </Col>
                            <Col>   
                                1. 淘系店铺绩效数据更新，请先确认订单已导入；
                            </Col>
                            <Col>   
                                2. 搜索及生成报表前请先手动更新对应时间范围内数据。
                            </Col>
                        </Row>
                    </Form>
                </PageContentAdvSearch>
                <div>
                    <Button type='primary' style={{marginBottom:16}}   disabled={disabled}  onClick={()=>{this.handleUpdateData()}}>
                        更新数据
                    </Button>
                    {
                        schedule&&schedule.hasOwnProperty('end_date')? <span className={styles.schedule}>
                            {schedule.start_date}~{schedule.end_date}报表{UPDATE_STATUS[schedule.status]} <Icon type="close"  onClick={this.handleCloseSchedule}   className={styles.closeSchedule}  />
                        </span>:''
                    }
                   
                </div>  
                <PageContentAdvSearch>
                    <Form>
                        <Row className={styles.date}>
                            <Col span={7}>
                                <FormItem {...formItemLayout} label="所属店铺：" colon={false}>
                                    <Cascader placeholder='不限'  value={params.platform?[params.platform,params.shop_id]:[]}   options={type}  onChange={(value)=>{this.handleChange('shop_id', value)}}  popupClassName={styles.userCascader}></Cascader>
                                </FormItem>
                            </Col> 
                            <Col span={7}>
                                <FormItem {...formItemLayout} label="所属员工：" colon={false}>
                                    <UserSelect
                                        departmentId={params.department_id}
                                        userId={params.user_id}
                                        onChange={(value)=>{this.handleChange('user_id', value)}}
                                    />
                                </FormItem>
                            </Col>
                            
                            <Col span={10}>
                                <FormItem {...formItemLayout} label="日期：" colon={false}>
                                    <Radio.Group className={styles.range}
                                        value={range}
                                        onChange={this.handleChangeTimeRange}
                                    >
                                        <Radio.Button value="day" className={styles.item}>日</Radio.Button>
                                        <Radio.Button value="week" className={styles.item}>周</Radio.Button>
                                        <Radio.Button value="month" className={styles.item}>月</Radio.Button>
                                    </Radio.Group>
                                    {   
                                        this.dateType()
                                    }
                                </FormItem>
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
                                    <Button  style={{width:'82px',marginLeft:'16px'}} className="hz-btn-width-default"  onClick={this.resetSearch}>
                                        重置
                                    </Button>
                                </Col>
                            </Col>
                        </Row>
                    </Form>
                </PageContentAdvSearch>
                <div className={styles.performanceSell}>
                    <div className={styles.sellflex}>
                        <div>
                            <Radio.Group  value={params.type} onChange={this.handleChangeType}>
                                <Radio.Button value="2">按员工查看</Radio.Button>
                                <Radio.Button value="1">按微信号查看</Radio.Button>
                            </Radio.Group> 
                            <Popover placement="bottomLeft" arrowPointAtCenter={true} content={action}>
                                <span className={styles.explain}><Icon className="hz-text-primary hz-icon-size-default" type="question-circle-o" /></span>
                            </Popover>
                        </div>
                        <div>
                            <Button className={styles.downLoad} onClick={()=>{this.createStatement(STATISTICS_STATE)}}>
                                <Icon component={downloadSvg} style={{fontSize:16}}/>
                                生成统计报表
                            </Button>
                            <Button className={styles.downLoad} onClick={()=>{this.createStatement(ORDER_STATE)}}>
                                <Icon component={downloadSvg} style={{fontSize:16}}/>
                                生成订单报表
                            </Button>
                            
                            
                            <Button className={styles.downLoad} onClick={this.operateRecord}>
                                操作记录
                            </Button>
                            <Popover placement="bottom" arrowPointAtCenter={true} content='当前仅支持近31天内的数据查询、更新及报表生成'>
                                <span className={styles.explain}><Icon className="hz-text-primary hz-icon-size-default" type="question-circle-o" /></span>
                            </Popover>
                        </div>
                        
                       
                    </div>
                    <Table columns={columns} dataSource={list}  rowKey={(record, index) => index} pagination={false}  scroll={{ x: 1950}}   loading={loading}/>
                    {
                        list && list.length > 0 && !loading ?
                            <Pagination
                                className="ant-table-pagination"
                                current={current}
                                total={total}
                                showTotal={(total) => `共 ${total} 条`} 
                                showQuickJumper={true} 
                                showSizeChanger={true}  
                                pageSize={params.limit} 
                                pageSizeOptions= {['10', '20', '50', '100']}
                                onShowSizeChange={this.handleChangeSize}
                                onChange={this.goToPage} />
                            : ''
                    }
                </div>
                <ModelDetail   
                    key= {`${user_id}_${metric_mode}_${view_mode}_${wechat_id}`}  
                    user_id = {user_id}  
                    wechat_id = {wechat_id}
                    metric_mode = {metric_mode}
                    view_mode = {view_mode}
                    visible = {visible}
                    handleCancelModel ={this.handleCancelModel}
                />
                <UpdataPerf 
                    visible = {updateVisible}
                    handleCancelUpdate = { this.handleCancelUpdate}
                />
                <CreateRecord 
                    visible = {createVisible}
                    data={type}
                    key={recordType}
                    type={recordType}
                    handleCancelUpdate = { this.handleCancelUpdate}
                />
                <OperateRecord 
                    visible = {recordVisible}
                    key={recordVisible}
                    cancelRecord={ this.handleCancelRecord}
                />
            </div>
        )
    }
}
