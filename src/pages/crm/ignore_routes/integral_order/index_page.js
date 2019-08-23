import {Fragment} from 'react'
import Page, { DEFAULT_PAGER, DEFAULT_PAGER_FILTER } from '@/components/business/Page'
import documentTitleDecorator from 'hoc/documentTitle'
import { Form, Row, Col, Input, Button, Icon, Table ,Pagination , DatePicker, Cascader, Divider, Badge, message } from 'antd'
import { connect } from 'dva'
import moment from "moment"
import styles from './index.less'
import OrderDetail from './OrderDetail'
import DeliverGoods from './DeliverGoods'
import {jine, datetime} from '../../../../utils/display'
import { AWARD_TYPE, PACKET_STATUS, GOODS_STATUS,getAwardTypeByVal, getAwardValByName, getPacketStatusTypeByVal, getPacketStatusStatusByVal, getGoodStatusStatusByVal, getGoodStatusTypeByVal } from 'crm/services/integral'
const { RangePicker } = DatePicker

const DEFAULT_CONDITION = {
    no:'',
    wx_query:'',
    good_type:'',
    good_name:'',
    status:'',
    begin_at:'',
    end_at:'',
}

@documentTitleDecorator()
@Form.create()
@connect(({ base,crm_intergral }) => ({
    base,
    crm_intergral
}))
export default class Index extends Page.ListPureComponent {
    state = {
        loading: false,
        exportLoading: false,
        OrderVisible: false,
        GoodVisible: false,
        curItem: {},
        condition: { ...DEFAULT_CONDITION },
        pager: { ...DEFAULT_PAGER }
    }
    componentDidMount(){
        super.componentDidMount()
        this.props.dispatch({
            type: 'crm_intergral/getExpressList',
            payload:{}
        })
    }

    initPage = (isSetHistory = false) => {
        const condition = this.getParamForObject(DEFAULT_CONDITION, this.props.location.query)
        const pager = this.getParamForObject(DEFAULT_PAGER, this.props.location.query, DEFAULT_PAGER_FILTER)
        this.getPageData(condition, pager, isSetHistory)
        const {
            no,
            wx_query,
            good_type,
            good_name,
            status,
            begin_at,
            end_at
        } = condition
        let typeStatus = []
        if(good_type&&status){
            typeStatus= [+good_type, +status]
        }
        this.props.form.setFieldsValue({
            'no': no,
            'wx_query': wx_query,
            'good_name': good_name,
            'typeStatus': typeStatus,
            'rangePicker': begin_at && end_at ? [moment(begin_at),moment(end_at)] : []
        })
    }

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
            type: 'crm_intergral/getExchangeList',
            payload:{
                offset: pager.current - 1,
                limit: pager.pageSize,
                no:condition.no,
                wx_query:condition.wx_query,
                good_type:condition.good_type,
                good_name:condition.good_name,
                status:condition.status,
                begin_at:condition.begin_at,
                end_at: condition.end_at,
            },
            callback: ()=>{

                this.setState({
                    loading: false
                })
            }
        })
    }

    /**公共方法 */

    /**页面事件 */
    onSubmit = (e) => {
        e.preventDefault()
        this.handleSearch()
    }
    onReset = () => {
        this.props.form.resetFields()
        this.handleSearch()
    }
    handleSearch = () =>{
        const { form } = this.props
        form.validateFields((error,value) => {
            let begin_at = '', end_at = '', good_type = '', status=''
            if (value.rangePicker && value.rangePicker.length !== 0) {
                begin_at = value.rangePicker[0].format('YYYY-MM-DD')
                end_at = value.rangePicker[1].format('YYYY-MM-DD')
            }
            if (value.typeStatus && value.typeStatus.length !== 0) {
                good_type = value.typeStatus[0]
                status = value.typeStatus[1]
            }
            const condition = {
                ...this.state.condition,
                ...{
                    no: value.no || '',
                    wx_query: value.wx_query || '',
                    good_type: good_type || '',
                    good_name: value.good_name || '',
                    status: status,
                    begin_at: begin_at,
                    end_at: end_at
                }
            }
            const pager = {
                pageSize : this.state.pager.pageSize,
                current : DEFAULT_PAGER.current
            }
            this.getPageData(condition, pager)
        })
    }
    // 导出记录
    export = () =>{
        this.setState({exportLoading: true})
        const { form } = this.props
        form.validateFields((error,value) => {
            let begin_at = '', end_at = '', good_type = '', status=''
            if (value.rangePicker && value.rangePicker.length !== 0) {
                begin_at = value.rangePicker[0].format('YYYY-MM-DD')
                end_at = value.rangePicker[1].format('YYYY-MM-DD')
            }
            if (value.typeStatus && value.typeStatus.length !== 0) {
                good_type = value.typeStatus[0]
                status = value.typeStatus[1]
            }
            const condition = {
                ...this.state.condition,
                ...{
                    no: value.no || '',
                    wx_query: value.wx_query || '',
                    good_type: good_type || '',
                    good_name: value.good_name || '',
                    status: status,
                    begin_at: begin_at,
                    end_at: end_at
                }
            }
            // 获取form表单的内容
            if(!condition.begin_at || !condition.end_at){
                message.warn('请选择兑换时间后下载')
                this.setState({exportLoading: false})
                return
            }
            this.props.dispatch({
                type:'crm_intergral/exportOrder',
                payload:{
                    no: condition.no || '',
                    wx_query: condition.wx_query || '',
                    good_type: condition.good_type || '',
                    good_name: condition.good_name || '',
                    status: condition.status,
                    start_at: condition.begin_at,
                    end_at: condition.end_at
                },
                callback:(data) =>{
                    this.setState({exportLoading: false})
                    if(data && data.meta.code === 200){
                        window.location.href = data.data.url
                    }
                }
            })
        })
    }
    onCloseModal = (modalName)=>{
        this.setState({
            [modalName]: false
        })
    }
    handleDetail = (item) => {
        this.setState({
            OrderVisible: true,
            curItem: {...item}
        })
    }
    handleGoods = (item)=>{
        this.setState({
            GoodVisible: true,
            curItem: {...item}
        })
    }
    onDeliver = (item)=>{
        this.setState({
            GoodVisible: false
        },()=>{
            this.initPage()
        }) 
    }
    getChildByType = (type)=>{
        if(!type){
            return [] 
        }
        if(type + '' === getAwardValByName('HongBao') + ''){
            return PACKET_STATUS.map(v => {
                return {
                    value: v.value,
                    label: v.type,
                }
            })
        }else if(type + '' === getAwardValByName('ShiWu') + ''){
            return GOODS_STATUS.map(v => {
                return {
                    value: v.value,
                    label: v.type,
                }
            })
        }else{
            return []
        }
    }
    render() {
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
                title: '订单编号',
                dataIndex: 'no',
                className: 'hz-table-column-width-100',
            },
            {
                title: '兑换时间',
                dataIndex: 'created_at',
                className: 'hz-table-column-width-120',
                render: (value,item,index) => {
                    return value&&datetime(value)
                }
            },
            {
                title: '客户微信昵称',
                dataIndex: 'wx_name',
                className: 'hz-table-column-width-120',
            },
            {
                title: '客户微信号',
                dataIndex: 'wx_id',
                className: 'hz-table-column-width-120',
            },
            {
                title: '奖品名称',
                dataIndex: 'good_name',
                className: 'hz-table-column-width-100',
            },
            {
                title: '奖品数量',
                dataIndex: 'good_count',
                className: 'hz-table-column-width-100',
                align: 'center',
            },
            {
                title: '奖品类型',
                dataIndex: 'good_type',
                className: 'hz-table-column-width-100',
                render:(text,record,index) => getAwardTypeByVal(text)   
            },
            {
                title: '消耗积分',
                dataIndex: 'consumed_points',
                className: 'hz-table-column-width-100',
                align: 'center',
                render:(text,record,index) =>{
                    return text&&jine(text, '0,00', 'Fen')
                } 
            },
            {
                title: '订单状态',
                dataIndex: 'status',
                className: 'hz-table-column-width-120',
                render:(text,record,index) =>{
                    let node =''
                    let type = parseInt(record.good_type, 10)
                    if(type === getAwardValByName('HongBao')){
                        node = (<Badge status={getPacketStatusStatusByVal(text)} text={getPacketStatusTypeByVal(text)}/>)
                    }else if(type === getAwardValByName('ShiWu')){
                        node = (<Badge status={getGoodStatusStatusByVal(text)} text={getGoodStatusTypeByVal(text)}/>)
                    }
                    return node
                } 
            },
            {
                title: '操作',
                dataIndex: 'action',
                className: 'hz-table-column-width-120',
                render: (value, record, index) => {
                    if(parseInt(record.status, 10) === 1 && parseInt(record.good_type, 10) === 2 ){
                        return (
                            <Fragment>
                                <a href='javascript:;' onClick={() => this.handleDetail(record)}>详情</a>
                                < Divider type = "vertical" />
                                <a href='javascript:;' onClick={() => this.handleGoods(record)}>发货</a>
                            </Fragment>
                        )
                    }else{
                        return <a href='javascript:;' onClick={() => this.handleDetail(record)}>详情</a>
                    }
                }
            }
        ]

        const { getFieldDecorator } = this.props.form
        const { exchangeList, exchangeListTotal } = this.props.crm_intergral
        const { current, pageSize } = this.state.pager
        const { loading, exportLoading } = this.state
        const type = AWARD_TYPE.map((item)=>{
            return {
                value: item.value,
                label: item.type,
                children:[{
                        value: '',
                        label: '全部', 
                    }].concat(this.getChildByType(item.value) || []) 
            }
        })
        return (
            <Page>
                {/*头部面包屑*/}
                <Page.ContentHeader
                    title={this.props.documentTitle}
                    helpUrl="http://newhelp.51zan.cn/manual/content/%E5%AE%A2%E6%88%B7%E7%AE%A1%E7%90%86/%E7%A7%AF%E5%88%86%E8%BF%90%E8%90%A5.md"
                />
                {/*搜索条件框*/}
                <Page.ContentAdvSearch>
                    <Form onSubmit={this.onSubmit}>
                        <Row>
                            <Col span={8}>
                                <Form.Item label='订单编号' {...formItemLayout}>
                                    {getFieldDecorator('no', {})(
                                        <Input placeholder='请输入订单编号' />
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label='客户微信' {...formItemLayout}>
                                    {getFieldDecorator('wx_query', {})(
                                        <Input placeholder='请输入微信昵称/账号' />
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label='奖品名称' {...formItemLayout}>
                                    {getFieldDecorator('good_name', {})(
                                        <Input placeholder='请输入奖品名称' />
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label='订单状态' {...formItemLayout}>
                                    {getFieldDecorator('typeStatus', {})(
                                        <Cascader 
                                            placeholder='请选择订单状态' 
                                            options={type}
                                            getPopupContainer={triggerNode => triggerNode.parentNode}
                                        ></Cascader>
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label='兑换时间' {...formItemLayout}>
                                    {getFieldDecorator('rangePicker', {})(
                                        <RangePicker/>
                                    )}
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={8}>
                                <Col span={3} style={{width: '80px'}}></Col>
                                <Col span={16}>
                                    <Button type='primary' htmlType='submit'>
                                        <Icon type="search" />
                                        搜索
                                    </Button>
                                    <Button className="hz-btn-width-default hz-margin-small-left" style={{marginLeft:'16px'}} onClick={this.onReset}>重置</Button>
                                </Col>
                            </Col>
                        </Row>
                    </Form>
                </Page.ContentAdvSearch>
                <Row style={{marginBottom: '16px'}} type="flex" justify="end">
                    <Col style={{textAlign: 'right'}}>
                        <Button onClick={this.export} loading={exportLoading} disabled={exportLoading}>
                            <Icon type="download" />
                            下载记录
                        </Button>
                    </Col>
                </Row>
                <Table
                    rowKey='id'
                    columns={columns}
                    pagination={false}
                    loading={loading}
                    dataSource={exchangeList}
                />
                {exchangeList.length ?
                    <Pagination
                        className="ant-table-pagination"
                        current={current}
                        total={exchangeListTotal}
                        showTotal={(total) => `共 ${total} 条`} 
                        showQuickJumper={true} 
                        showSizeChanger={true}  
                        pageSize={pageSize} 
                        pageSizeOptions= {['10', '20', '50', '100']}
                        onShowSizeChange={this.handleListPageChangeSize}
                        onChange={this.handleListPageChange} />
                    : ''
                }
                <OrderDetail 
                    visible={this.state.OrderVisible} 
                    id={this.state.OrderVisible + '1'} 
                    onChange={(name)=>this.onCloseModal(name)} 
                    item={this.state.curItem} 
                    key = {this.state.OrderVisible + '1'}
                />
                <DeliverGoods 
                    visible={this.state.GoodVisible} 
                    id={this.state.GoodVisible + '2'} 
                    onChange={(name)=>this.onCloseModal(name)} 
                    onDeliver = {this.onDeliver}
                    item={this.state.curItem} 
                    key = {this.state.OrderVisible + '2'}
                />
            </Page>
        )
    }
}
