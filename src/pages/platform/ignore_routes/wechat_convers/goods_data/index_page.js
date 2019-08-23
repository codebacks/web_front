/**
 **@time: 2018/11/15
 **@Description:微转淘二期数据
 **@author: yecuilin
 */
import Page, { DEFAULT_PAGER, DEFAULT_PAGER_FILTER } from 'components/business/Page'
import {Form,Button,Row,Col,Input,DatePicker,Table,Pagination,Select,Spin} from 'antd'
import documentTitleDecorator from 'hoc/documentTitle'
import { connect } from 'dva'
import WeChatSelectSingle from '../../../../../components/business/WeChatSelectSingle'
import {client_app,source_from,getClientAppVal,getSourceFromVal} from '../../../../../common/statistics'
import {getShopValByName} from '../../../../../common/shopConf'
import {getShopTypeByVal} from '../../../../../common/shopConf'
import { jine } from '../../../../../utils/display'
import moment from 'moment'
import echarts from 'echarts/lib/echarts'
import echartsTheme from 'common/huzanEchartTheme'
import 'echarts/lib/component/legend'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/grid'
import 'echarts/lib/chart/line'
import styles from './index.less'
const FormItem = Form.Item
const { RangePicker } = DatePicker
const Option = Select.Option
const DEFAULT_CONDITION = {
    id:'',
    type:'',
    client_type:'',
    source_from:'',
    begin_at:'',
    end_at:'',
    receive_wx_nick:'',
    send_wx_uin:'',
}   

@Form.create()
@documentTitleDecorator({
    overrideTitle:'数据'
})
@connect(({ platform_wechat_convers, base }) => ({
    platform_wechat_convers, base
}))

export default class extends Page.ListPureComponent{
    state = {
        historyDataLoading: false,
        TaoType:'',
        id:null,
        uin:'',
        lineEchartLoading:false,
        condition: { ...DEFAULT_CONDITION },
        pager: { ...DEFAULT_PAGER }
    }
    initPage = (isSetHistory = false) =>{
        const condition = this.getParamForObject(DEFAULT_CONDITION, this.props.location.query)
        const pager = this.getParamForObject(DEFAULT_PAGER, this.props.location.query, DEFAULT_PAGER_FILTER)
        const {query} = this.props.location
        let TaoType = null
        if(Number(query.type) === getShopValByName('TaoBao') || Number(query.type) === getShopValByName('TianMao')){
            TaoType = 'tao'
        }else{
            TaoType = 'not_tao'
        }
        this.setState({
            id:query.id,
            TaoType:TaoType
        },()=>{
            this.getGoodsInfo()
            this.getDataMessage()
            this.getPageData(condition, pager, isSetHistory)        
            const { client_type, source_from,begin_at,end_at,send_wx_uin,receive_wx_nick} = condition
            this.props.form.setFieldsValue({
                'client_type': client_type,
                'source_from': source_from,
                'rangePicker': begin_at || end_at ? [moment(begin_at, 'YYYY/MM/DD'), moment(end_at, 'YYYY/MM/DD')] : null,
                'receive_wx_nick':receive_wx_nick
            })
            this.setState({
                uin:send_wx_uin
            })
        })
        
    }
    getPageData = (condition,pager,isSetHistory = true,callback) =>{
        if (isSetHistory) {
            this.history(condition, pager)
        }
        this.setState({
            ...this.state.TaoType,
            condition: condition,
            pager: pager,
            historyDataLoading: false,
        })

        this.getSendHistory(condition,pager)
        
    }
    // 商品信息
    getGoodsInfo = () =>{
        this.props.dispatch({
            type:'platform_wechat_convers/getGoodItemInfo',
            payload:{
                id:this.state.id
            }
        })
    } 
    onSubmit = (e) =>{
        e.preventDefault()
        this.handleSearch()
    }
    handleSearch = () =>{
        const {form} = this.props
        const {query} = this.props.location
        let begin_at = '', end_at = ''
        
        form.validateFields((error,value) =>{
            if (value.rangePicker && value.rangePicker.length !== 0) {
                begin_at = value.rangePicker[0].format('YYYY-MM-DD')
                end_at = value.rangePicker[1].format('YYYY-MM-DD')
            }
            const condition = {
                ...this.state.condition,
                ...{ 
                    id:query.id,
                    client_type:value.client_type || '',
                    source_from:value.source_from || '',
                    begin_at: begin_at,
                    end_at: end_at,
                    send_wx_uin:this.state.uin,
                    receive_wx_nick:value.receive_wx_nick || ''
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
    checkBlack = (rule, value, callback) =>{
        if (value && /^[\s　]|[ ]$/.test(value)) {
            callback('请勿以空格开头或结束')
        }
        callback()
    }
    // 获取30天商品推荐数据信息
    getDataMessage = () =>{
        this.setState({
            lineEchartLoading:true
        })
        this.props.dispatch({
            type:'platform_wechat_convers/getGoodsrecommendInfo',
            payload:{
                id:this.state.id
            },
            callback:(data) =>{
                this.setState({
                    lineEchartLoading:false
                })
                if(data.data && data.meta.code === 200){
                    const {GoodsrecommendInfo} = this.props.platform_wechat_convers
                    const {TaoType} = this.state
                    let arr = [] ,legend = []
                    if(TaoType === 'tao'){
                        legend = ['发送次数','展示次数（PV）','访问人数（UV）','加购点击次数']
                    }else{
                        legend = ['发送次数','展示次数（PV）','访问人数（UV）']
                    }
                    for(let i = 0;i < GoodsrecommendInfo.data.length;i++){
                        arr.push({
                            data:GoodsrecommendInfo.data[i],
                            name:legend[i]
                        })
                    }
                    this.showEcharts(arr)
                }
            }
        })
    }
    showEcharts = (value) =>{
        let data = []
        const {TaoType} = this.state
        if(TaoType === 'tao'){
            data = value
        }else{
            data = value.slice(0,3)
        }
        const colorList = ['#4391FF','#3FCD9C','#FFAD1F','#F35D51']
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
                data: data.map(c=> c.name)
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
                    data:data[0].data.map(i => i.time.slice(5,10).replace('-','.'))
                }
            ],
            yAxis: {
                type: 'value'
            },
            series: data.map((c,i) => ({
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
        let myChart = echarts.init(document.getElementById('goodsDataEcarts'), echartsTheme)
        myChart.setOption(option)
    }
    // 发送记录
    getSendHistory = (condition,pager) =>{
        this.setState({
            historyDataLoading:true
        })
        this.props.dispatch({
            type:'platform_wechat_convers/getsendDatalist',
            payload:{
                id:condition.id,
                client_type:condition.client_type,
                begin_at:condition.begin_at,
                end_at: condition.end_at,
                source_from:condition.source_from,
                send_wx_uin:condition.send_wx_uin,
                receive_wx_nick:condition.receive_wx_nick,
                offset:(pager.current - 1) * pager.pageSize,
                limit: pager.pageSize, 
            },
            callback:() =>{
                this.setState({
                    historyDataLoading:false
                })
            }
        })
    }
    handleChange = (val) =>{
        this.setState({
            uin:val
        })
    }   
    render() {
        const {getFieldDecorator} = this.props.form
        const {sendDatalist,totalsendDatalist,GoodsrecommendInfo,GoodItemInfo} = this.props.platform_wechat_convers
        const { current, pageSize } = this.state.pager
        const {TaoType,lineEchartLoading,historyDataLoading} = this.state
        const formItemLayout = {
            labelCol: {
                span: 6,
                style: {
                    width: '70px',
                    textAlign: 'right',
                },
            },
            wrapperCol: {
                span: 16,
            },
        }
        const columns = [
            {
                title:'客户端',
                dataIndex:'client_type',
                render:(text,record,index) =>{
                    return (
                        <span>{getClientAppVal(text)}</span>
                    )
                }
            },{
                title:'推荐方式',
                dataIndex:'source_from',
                render:(text,record,index) =>{
                    return (
                        <span>{getSourceFromVal(text)}</span>
                    )
                }
            },{
                title:'发送时间',
                dataIndex:'created_at'
            },{
                title:'微信号',
                dataIndex:'send_wx_nick'
            },{
                title:'接收方',
                dataIndex:'receive_wx_nick'
            },{
                title:'展示次数（PV）',
                dataIndex:'pv_count',
                align: 'center',
            },{
                title:'访问人数（UV）',
                dataIndex:'uv_count',
                align: 'center',
            },{
                title:'加购点击次数',
                dataIndex:'click_count',
                align: 'center',
                className:`${TaoType === 'tao' ? styles.tao_type : styles.not_tao_type}`
            }
        ]
        return(
            <Page>
                <Page.ContentHeader 
                    hasGutter={false}
                    breadcrumbData={[{
                        name: '商品推荐',
                        path: '/platform/wechat_convers'
                    }, {
                        name: '数据'
                    }]}
                />
                <Page.ContentBlock title='商品信息' hasDivider={false}>
                    <Row className={styles.statisticsWrap}>
                        <Col span={6}>
                            <dl>
                                <dd><span>类型：</span>
                                    { 
                                        GoodItemInfo.shop && getShopTypeByVal(GoodItemInfo.shop.type)
                                    }
                                </dd>
                                <dt><span style={{minWidth:'70px'}}>商品名称：</span>{GoodItemInfo.name}</dt>
                            </dl>
                        </Col>
                        <Col span={6}>
                            <dl>
                                <dd><span>店铺：</span>
                                    { 
                                        GoodItemInfo.shop ? GoodItemInfo.shop.name : ''
                                    }
                                </dd>
                                <dt><span>价格：</span>{jine(GoodItemInfo.price,'0.00','Fen')}</dt>
                            </dl>
                        </Col>
                        <Col span={6}>
                            <dl>
                                <dd><span>平台ID：</span>{GoodItemInfo.number}</dd>
                                <dt><span>商品修改时间：</span>{GoodItemInfo.modified_at} </dt>
                            </dl>
                        </Col>
                        <Col span={6}>
                            <dl>
                                <dd><span>商家编码：</span>{GoodItemInfo.outer_number}</dd>
                                <dt><span>商品状态：</span>{GoodItemInfo.status === 1 ? '在售' : '下架' }</dt>
                            </dl>
                        </Col>
                    </Row>
                </Page.ContentBlock>
                <Page.ContentBlock title='数据信息' hasDivider={false} subhead='近30天'>
                    <Row className={styles.displayWrap}>
                        <Col span={TaoType === 'tao' ? 6 : 8}>
                            <dl className={styles.lastItem}>
                                <dd>发送次数 </dd>
                                <dt>{GoodsrecommendInfo.send_count}</dt>
                            </dl>
                        </Col>
                        <Col span={TaoType === 'tao' ? 6 : 8}>
                            <dl>
                                <dd>展示次数（PV）</dd>
                                <dt>{GoodsrecommendInfo.pv_count}</dt>
                            </dl>
                        </Col>
                        <Col span={TaoType === 'tao' ? 6 : 8}>
                            <dl>
                                <dd>访问人数（UV）</dd>
                                <dt>{GoodsrecommendInfo.uv_count}</dt>
                            </dl>
                        </Col>
                        {
                            TaoType === 'tao' ? <Col span={6}>
                                <dl>
                                    <dd>加购点击次数</dd>
                                    <dt>{GoodsrecommendInfo.click_count}</dt>
                                </dl>
                            </Col>
                                : ''
                        }
                        
                    </Row>
                    <div className={styles.echartsWrap}>
                        {/* <div className={styles.echartsTitle}>商家商品推荐</div> */}
                        <Spin spinning={lineEchartLoading}>
                            <div id="goodsDataEcarts" style={{width: '100%', height:'350px',padding:'8px 0'}}></div>
                        </Spin>
                    </div>
                </Page.ContentBlock>
                <Page.ContentBlock title='发送记录' hasDivider={false}/>
                <Page.ContentAdvSearch>
                    <Form onSubmit={this.onSubmit}>
                        <Row>
                            {
                                TaoType === 'tao' ? <Col span={8}>
                                    <FormItem label="客户端" {...formItemLayout}>
                                        {getFieldDecorator('client_type')(
                                            <Select placeholder="全部客户端">
                                                <Option value=''>全部客户端</Option>
                                                {client_app.map((item) => {
                                                    return <Option key={item.value} value={item.value}>{item.name}</Option>
                                                })}
                                            </Select>                                         
                                        )}
                                    </FormItem>
                                </Col>
                                    : ''
                            }
                            <Col span={8}>
                                <FormItem label="推荐方式" {...formItemLayout}>
                                    {getFieldDecorator('source_from')(
                                        <Select placeholder="全部推荐方式">
                                            <Option value=''>全部推荐方式</Option>
                                            {source_from.map((item) => {
                                                return <Option key={item.value} value={item.value}>{item.name}</Option>
                                            })}
                                        </Select>
                                    )}
                                </FormItem>
                                
                            </Col>
                            <Col span={8}>
                                <FormItem label='发送日期' {...formItemLayout}>
                                    {getFieldDecorator('rangePicker')(
                                        <RangePicker/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem label="所属微信：" {...formItemLayout} colon={false}>
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
                                <FormItem label="接收方" {...formItemLayout}>
                                    {getFieldDecorator('receive_wx_nick', {
                                        rules: [
                                            {
                                                validator: this.checkBlack
                                            }
                                        ]
                                    })(
                                        <Input placeholder='请输入接收方昵称或群名' />
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
                    dataSource={sendDatalist}
                    loading={historyDataLoading}
                    rowKey="id"
                    pagination={false}
                />
                {parseFloat(totalsendDatalist) ? 
                    <Pagination
                        className="ant-table-pagination"
                        current={current}
                        total={parseFloat(totalsendDatalist)}
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