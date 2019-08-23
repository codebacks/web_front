/**
 **@Description:虎赞小店-优惠券数据
 **@author: yecuilin
 */

import Page, { DEFAULT_PAGER, DEFAULT_PAGER_FILTER } from 'components/business/Page'
import {Form,Button,Row,Col,Radio,Input,DatePicker,Table,Pagination,Spin} from 'antd'
import documentTitleDecorator from 'hoc/documentTitle'
import WeChatSelectSingle from '../../../../../components/business/WeChatSelectSingle'
import { connect } from 'dva'
import moment from 'moment'
import echarts from 'echarts/lib/echarts'   
import echartsTheme from 'common/huzanEchartTheme'
import 'echarts/lib/component/legend'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/grid'
import 'echarts/lib/chart/line'
import styles from '../index.less'
import router from 'umi/router'

const FormItem = Form.Item
const { RangePicker } = DatePicker


const DEFAULT_CONDITION = {
    id:'',
    sender_wechat_uin:'',
    gainer:'',
    sent_begin_at:'',
    sent_end_at:'',
    picked_begin_at:'',
    picked_end_at:'',
    used_begin_at:'',
    used_end_at:'',
}  

@Form.create()
@connect(({base,mall_discount_coupon}) =>({
    base,
    mall_discount_coupon
}))
@documentTitleDecorator({
    overrideTitle:'数据'
})

export default class extends Page.ListPureComponent{
    state = {
        condition: { ...DEFAULT_CONDITION },
        pager: { ...DEFAULT_PAGER },
        timeValue:'7',
        uin:'',
        getEchartData_laoding:false,
        getCouponData_laoding:false,

    }
    initPage = (isSetHistory = false) =>{
        const condition = this.getParamForObject(DEFAULT_CONDITION, this.props.location.query)
        const pager = this.getParamForObject(DEFAULT_PAGER, this.props.location.query, DEFAULT_PAGER_FILTER)
        const {query} = this.props.location
        if(query.id){
            this.checkDetail(query.id)
            this.getEchartData() 
            this.getPageData(condition, pager, isSetHistory) 
            const {sender_wechat_uin,gainer,sent_begin_at,sent_end_at,picked_begin_at,picked_end_at,used_begin_at,used_end_at} = condition
            this.props.form.setFieldsValue({
                gainer:gainer,
                'send_rangePicker': sent_begin_at || sent_end_at ? [moment(sent_begin_at, 'YYYY/MM/DD HH:mm:ss'), moment(sent_end_at, 'YYYY/MM/DD HH:mm:ss')] : null,
                'pick_rangePicker': picked_begin_at || picked_end_at ? [moment(picked_begin_at, 'YYYY/MM/DD HH:mm:ss'), moment(picked_end_at, 'YYYY/MM/DD HH:mm:ss')] : null,
                'used_rangePicker': used_begin_at || used_end_at ? [moment(used_begin_at, 'YYYY/MM/DD HH:mm:ss'), moment(used_end_at, 'YYYY/MM/DD HH:mm:ss')] : null,
            })
            this.setState({
                uin:sender_wechat_uin
            })
        }else{
            router.push('/mall/discount_coupon')
        }
        
    }
    getPageData = (condition,pager,isSetHistory = true,callback) =>{
        if (isSetHistory) {
            this.history(condition, pager)
        }
        this.setState({
            condition: condition,
            pager: pager,
        })
        
        this.getCouponData(condition,pager)
    }
    // 获取折线图数据
    getEchartData = (condition) =>{
        this.setState({
            getEchartData_laoding:true
        })
        this.props.dispatch({
            type:'mall_discount_coupon/echartsData',
            payload:{
                id:Number(this.props.location.query.id),
                cycle:this.state.timeValue
            },
            callback:(data) =>{
                if(data.data && data.meta.code === 200){
                    const {echartsData} = this.props.mall_discount_coupon
                    let arr = [], legend = ['发送数','领取数','使用数']
                    for(let i = 0;i<echartsData.length;i++){
                        arr.push({
                            data:echartsData[i],
                            name:legend[i]
                        })
                    }
                    this.showEcharts(arr)
                }
                this.setState({
                    getEchartData_laoding:false
                })
            }
        })
    }
    showEcharts = (value) =>{
        const colorList = ['#FFAA16','#4391FF','#3FCD9C']
        const option = {
            tooltip: {
                trigger: 'axis'
            },
            legend:{
                icon: 'circle',
                itemWidth: 7,
                itemHeight: 7,
                itemGap: 15,
                borderRadius: 4,
                textstyles: {
                    fontSize: 12
                },
                show: true,
                right: '3%',
                top: 0,
                data: value.map(c=> c.name)
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            toolbox: {
                trigger: 'axis',
                axisPointer: {            
                    type: 'line'
                }
            },
            xAxis: [
                {
                    type : 'category',
                    boundaryGap : false,
                    data:value[0].data.map(i => i.time.slice(5,10).replace('-','.'))
                }
            ],
            yAxis: {
                type: 'value'
            },
            series: value.map((c,i) => ({
                name: c.name,
                itemStyle:{
                    color:colorList[i]
                },
                emphasis:{
                    itemStyle: {
                        // 高亮时点的颜色。
                        color: colorList[i]
                    },
                },
                data: c.data.map(i =>i.total),
                type: 'line',
                smooth: false,
            }))
        }
        let myChart = echarts.init(document.getElementById('distributorDataEcarts'), echartsTheme)
        myChart.setOption(option)
    }
    checkDetail = (id) =>{
        this.props.dispatch({
            type:'mall_discount_coupon/checkDetail',
            payload:{
                id:Number(id)
            }
        })

    }
    // 获取列表
    getCouponData = (condition,pager) => {
        this.setState({
            getCouponData_laoding:true
        })
        this.props.dispatch({
            type:'mall_discount_coupon/couponData',
            payload:{
                id:condition.id,
                sender_wechat_uin:condition.sender_wechat_uin,
                gainer:condition.gainer,
                sent_begin_at:condition.sent_begin_at,
                sent_end_at:condition.sent_end_at,
                picked_begin_at:condition.picked_begin_at,
                picked_end_at:condition.picked_end_at,
                used_begin_at:condition.used_begin_at,
                used_end_at:condition.used_end_at,
                offset:(pager.current - 1) * pager.pageSize,
                limit: pager.pageSize, 
            },
            callback:(data) =>{
                this.setState({
                    getCouponData_laoding:false
                })
            }

        })
    }
    changeTimeValue = (e) =>{
        this.setState({
            timeValue:e.target.value
        },() =>{
            this.getEchartData()
        })
    }
    handleChange = (val) =>{
        this.setState({
            uin:val
        })
    } 
    // 点击搜索
    onSubmit = (e) =>{
        e.preventDefault()
        this.handleSearch()
    }
    handleSearch = () =>{
        const {query} = this.props.location
        let sent_beginAt = '', send_endAt = '', picked_beginAt = '', picked_endAt = '',used_beginAt = '',used_endAt = ''
        this.props.form.validateFields((err,values) =>{
            if(values.send_rangePicker && values.send_rangePicker.length !== 0){
                sent_beginAt = values.send_rangePicker[0].format('YYYY-MM-DD HH:mm:ss')
                send_endAt = values.send_rangePicker[1].format('YYYY-MM-DD HH:mm:ss')
            }
            if(values.pick_rangePicker && values.pick_rangePicker.length !== 0){
                picked_beginAt = values.pick_rangePicker[0].format('YYYY-MM-DD HH:mm:ss')
                picked_endAt = values.pick_rangePicker[1].format('YYYY-MM-DD HH:mm:ss')
            }
            if(values.used_rangePicker && values.used_rangePicker.length !== 0){
                used_beginAt = values.used_rangePicker[0].format('YYYY-MM-DD HH:mm:ss')
                used_endAt = values.used_rangePicker[1].format('YYYY-MM-DD HH:mm:ss')
            }
            const condition = {
                ...this.state.condition,
                ...{
                    id:query.id,
                    sender_wechat_uin:this.state.uin,
                    gainer:values.gainer || '',
                    sent_begin_at:sent_beginAt,
                    sent_end_at:send_endAt,
                    picked_begin_at:picked_beginAt,
                    picked_end_at:picked_endAt,
                    used_begin_at:used_beginAt,
                    used_end_at:used_endAt,
                }
            }
            const pager = {
                pageSize : this.state.pager.pageSize,
                current : DEFAULT_PAGER.current
            }
            this.getPageData(condition, pager)
        })
    }
    // 重置
    onReset = () =>{
        this.props.form.resetFields()
        this.setState({
            uin:''
        },()=>{
            this.handleSearch()
        })
        
    } 
    checkOrderDetail= (data) =>{
        router.push(`/mall/order_list/order_detail?id=${data.order_id}`)
    }
    render(){
        const {getFieldDecorator} = this.props.form
        const { current, pageSize } = this.state.pager
        const {checkDetail,couponData,couponData_total} = this.props.mall_discount_coupon
        const {timeValue,getEchartData_laoding,getCouponData_laoding} = this.state
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
        const columns = [
            {
                title:'发送时间',
                dataIndex:'sent_at'
            },{
                title:'发送人微信',
                dataIndex:'sender_wechat_nick'
            },{
                title:'接收者微信',
                dataIndex:'recipient_nickname'
            },{
                title:'领取时间',
                dataIndex:'picked_at'
            },{
                title:'优惠券编码',
                dataIndex:'no',
            },{
                title:'领取人微信',
                dataIndex:'gainer'
            },{
                title:'用券时间',
                dataIndex:'used_at'
            },{
                title:'订单号',
                dataIndex:'order_no',
                render:(text,record) =>{
                    if(text){
                        return <a href="javascript:void(0)" onClick={()=>this.checkOrderDetail(record)}>{text}</a>
                    }else{
                        return ""
                    }
                    
                }
            }
        ]
        return(
            <Page>
                <Page.ContentHeader 
                    hasGutter={false}
                    breadcrumbData={[{
                        name: '优惠券', 
                        path: '/mall/discount_coupon'
                    }, {
                        name: '数据'
                    }]}
                />
                <div className={styles.distributorData_name}>{
                    Object.keys(checkDetail).length ? checkDetail.title : ''
                }</div>
                <div className={styles.distributorData_echarts}>
                    <Row type="flex" justify="space-between" align="middle">
                        <Col>
                            <Radio.Group
                                value={timeValue}
                                onChange={this.changeTimeValue}
                            >
                                <Radio.Button value="7">近7天</Radio.Button>
                                <Radio.Button value="30" >近30天</Radio.Button>
                                <Radio.Button value="90">近90天</Radio.Button>
                            </Radio.Group>
                        </Col>
                    </Row>
                    <Spin spinning={getEchartData_laoding}>
                        <div id="distributorDataEcarts" style={{width: '100%', height:'300px'}}></div>
                    </Spin>
                </div>
                <Page.ContentAdvSearch>
                    <Form onSubmit={this.onSubmit} layout="horizontal" className="hz-from-search">
                        <Row>
                            <Col span={8}>
                                <FormItem label="发送人微信" {...formItemLayout}>
                                    <WeChatSelectSingle
                                        departmentId={undefined}
                                        userId={undefined}
                                        uin={this.state.uin}
                                        onChange={(value) => {
                                            this.handleChange(value)
                                        }}
                                    />
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem label="领取人微信" {...formItemLayout}>
                                    {getFieldDecorator('gainer', {
                                        rules: [
                                            {
                                                validator: this.checkBlack
                                            }
                                        ]
                                    })(
                                        <Input placeholder='请输入领取人微信昵称' />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem label='发送时间' {...formItemLayout}>
                                    {getFieldDecorator('send_rangePicker')(
                                        <RangePicker 
                                            placeholder={['开始时间','结束时间']}
                                            format="YYYY-MM-DD HH:mm:ss" 
                                            showTime={{
                                                hideDisabledOptions: true,
                                                defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('00:00:00', 'HH:mm:ss')],
                                            }} 
                                            style={{width:'100%'}}
                                        />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem label='领取时间' {...formItemLayout}>
                                    {getFieldDecorator('pick_rangePicker')(
                                        <RangePicker 
                                            placeholder={['开始时间','结束时间']}
                                            format="YYYY-MM-DD HH:mm:ss" 
                                            showTime={{
                                                hideDisabledOptions: true,
                                                defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('00:00:00', 'HH:mm:ss')],
                                            }}
                                            style={{width:'100%'}}
                                        />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem label='用券时间' {...formItemLayout}>
                                    {getFieldDecorator('used_rangePicker')(
                                        <RangePicker 
                                            format="YYYY-MM-DD HH:mm:ss"
                                            placeholder={['开始时间','结束时间']}
                                            showTime={{
                                                hideDisabledOptions: true,
                                                defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('00:00:00', 'HH:mm:ss')],
                                            }}
                                            style={{width:'100%'}}
                                        />
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <Button type='primary' icon="search" style={{marginLeft: '80px'}} htmlType='submit'>搜索</Button>
                        <Button style={{marginLeft: '16px',width: '82px'}} onClick={this.onReset}>重置</Button>
                    </Form>
                </Page.ContentAdvSearch>
                <Table
                    columns={columns}
                    dataSource={couponData}
                    loading={getCouponData_laoding}
                    rowKey="id"
                    pagination={false}
                />
                {
                    couponData && couponData.length ? <Pagination
                        className="ant-table-pagination"
                        current={current}
                        total={couponData_total}
                        showTotal={(total) => `共 ${total} 条`} 
                        showQuickJumper={true} 
                        showSizeChanger={true}  
                        pageSize={pageSize} 
                        pageSizeOptions= {['10', '20', '50', '100']}
                        onShowSizeChange={this.handleListPageChangeSize}
                        onChange={this.handleListPageChange} /> 
                        : ''
                }
                
            </Page>
        )
    }
}
