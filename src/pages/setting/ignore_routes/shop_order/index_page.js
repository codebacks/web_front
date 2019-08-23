import React from 'react'
import Page, { DEFAULT_PAGER , DEFAULT_PAGER_FILTER, LabelEllipsis} from '../../../../components/business/Page'
import {connect} from 'dva'
import {Row, Button, Select, Table, DatePicker, Form, Col, Input, Icon, Pagination, Cascader } from 'antd'
import documentTitleDecorator from 'hoc/documentTitle'
import {getOrderStatusText, getOrderFormText} from '../../services/importOrder'
import { ORDER_STATUSES, ORDER_FORMS} from '../../services/importOrder'
import {jine, datetime} from '../../../../utils/display'
import moment from 'moment'
import OrderDetails from './shop_orders_details'
import _ from 'lodash'
import OrderModal from './order_modal'
import { SHOP_TYPE, getShopTypeByVal, getShopValByName } from '../../../../common/shopConf'

import styles from './index.less'

const RangePicker = DatePicker.RangePicker
const Option = Select.Option
const DEFAULT_CONDITION = {
    type: '',
    shop_id: '',
    no: '',
    status: '',
    data_from: '',
    buyer_username: '',
    beginAt: '',
    endAt: '',
}


@Form.create()
@documentTitleDecorator()
@connect(({setting_orders_import_shop, base}) => ({
    setting_orders_import_shop,
    base,
}))
export default class extends Page.ListPureComponent {
    state= {
        loading: false,
        exportLoad: false,
        visible: false,
        currentDetailsID: '',
        show: false,
    }
    initPage = (isSetHistory = false) => {
        let condition = this.getParamForObject(DEFAULT_CONDITION, this.props.location.query)
        const pager = this.getParamForObject(DEFAULT_PAGER, this.props.location.query, DEFAULT_PAGER_FILTER)
        const { type, shop_id, no, status, data_from, buyer_username, beginAt, endAt } = condition
        if (!beginAt || !endAt) { 
            let arr = [moment().subtract(3, 'months'), moment()].map(item => item.format('YYYY-MM-DD'))
            condition.beginAt = arr[0]
            condition.endAt = arr[1]
        }
        this.getPageData(condition, pager, isSetHistory)
        if (type) { 
            this.props.form.setFieldsValue({
                'type': [parseInt(type, 10), parseInt(shop_id, 10) || ''],
            })
        }
        if(type&&parseInt(type, 10) === getShopValByName('WS')){
            this.setState({
                visible: true
            },()=>{
                this.props.form.setFieldsValue({
                    'status': status&&parseInt(status, 10),
                    'data_from': data_from&&parseInt(data_from, 10),
                    'no': no,
                    'buyer_username': buyer_username,
                    'rangePicker': beginAt && endAt ? [moment(beginAt),moment(endAt)] : [moment().subtract(3, 'months'), moment()],
                })
            })
        }else{
            this.props.form.setFieldsValue({
                'status': status&&parseInt(status, 10),
                'data_from': data_from&&parseInt(data_from, 10),
                'no': no,
                'buyer_username': buyer_username,
                'rangePicker': beginAt && endAt ? [moment(beginAt),moment(endAt)] : [moment().subtract(3, 'months'), moment()],
            }) 
        }
    }
    getPageData = (condition, pager, isSetHistory = true,callback) => {
        if( isSetHistory ){
            this.history(condition, pager)
        }
        this.setState({
            condition: condition,
            pager: pager,
            loading: true
        })
        this.props.dispatch({
            type: 'setting_orders_import_shop/getOrderList',
            payload: {
                condition: {
                    'type': condition.type,
                    'status': condition.status,
                    'shop_id': condition.shop_id,
                    'data_from': condition.data_from,
                    'no': condition.no,
                    'buyer_username': condition.buyer_username,
                    'begin_at': condition.beginAt,
                    'end_at': condition.endAt,  
                },
                pageOptions: {
                    pageSize: pager.pageSize,
                    pageIndex: pager.current,
                }
            },
            callback: (data) => {
                this.setState({
                    loading: false
                })
                callback && callback(data)
            }
        })
    }
    searchData = () => {
        const { form } = this.props
        form.validateFields((error,value) => {
            let beginAt = '', endAt = '', type='', shop_id = ''
            if (value.rangePicker && value.rangePicker.length !== 0) {
                beginAt = value.rangePicker[0].format('YYYY-MM-DD')
                endAt = value.rangePicker[1].format('YYYY-MM-DD')
            }
            if (value.type && value.type.length !== 0) {
                type = value.type[0]
                shop_id = value.type[1]
            }
            const condition = {
                ...this.state.condition,
                ...{
                    type: type,
                    shop_id: shop_id,
                    status: value.status || '',
                    data_from: value.data_from || '',
                    no: value.no || '',
                    buyer_username: value.buyer_username || '',
                    endAt: endAt,
                    beginAt: beginAt,
                }
            }
            const pager = {
                pageSize : this.state.pager.pageSize,
                current : DEFAULT_PAGER.current
            }
            this.getPageData(condition, pager)
        })
    }
    componentDidMount(){
        this.getShops()
        this.initForm()
        super.componentDidMount()
        this.props.dispatch({
            type: 'setting_orders_import_shop/getToken',
            payload: {
                type: 'document',
            },
        })
    }
    initForm = () => {
        this.props.form.setFieldsValue({rangePicker:[moment().subtract(3, 'months'), moment()]})
    }
    getShops = () => {
        this.props.dispatch({
            type: 'setting_orders_import_shop/getShops'
        })
    }
    getListData = () => {
        let {condition, pager} = this.state
        this.getPageData(condition, pager)
    }

    searchFormSubmitHandler = (e) => {
        e.preventDefault()
        this.searchData()
    }

    resetSearchHandler = () => {
        this.setState({
            visible: false
        },()=>{
            this.props.form.resetFields()
            this.initForm()
            this.searchData()
        })
    }

    changeSizeHandler = (current, size) => {
        this.setState({
            currentPageSize: size
        }, () => {
            this.getListData()
        })
    }

    changePageHandler = (page, pageSize) => {
        this.setState({
            currentPageIndex: page
        }, () => {
            this.getListData()
        })
    }

    detailCloseHandler = () => {
        this.setState({
            currentDetailsID: ''
        })
    }

    detailOpenHandler = (id) => {
        this.setState({
            currentDetailsID: id
        })
    }
    getDataFrom = (text, item, index) => { 
        if (text === 1 || text === 2 ) { 
            return getOrderFormText(text) + '-' + getShopTypeByVal(item.shop.type)
        }
        if (text === 4 ) { 
            return '自动同步-' + getShopTypeByVal(item.shop.type)
        }
        return getOrderFormText(text)
    }
    changeShop = (value)=>{
        let type = value[0]
        if(!type){
            return
        }
        if(parseInt(type, 10) === getShopValByName('WS')){
            this.setState({
                visible: true
            })
        }else{
            this.setState({
                visible: false
            })
        }
    }
    // 导出订单
    exportOrder = ()=>{
        const { form } = this.props
        form.validateFields((error,value) => {
            let beginAt = '', endAt = '', type='', shop_id = ''
            if (value.rangePicker && value.rangePicker.length !== 0) {
                beginAt = value.rangePicker[0].format('YYYY-MM-DD')
                endAt = value.rangePicker[1].format('YYYY-MM-DD')
            }
            if (value.type && value.type.length !== 0) {
                type = value.type[0]
                shop_id = value.type[1]
            }
            this.setState({
                exportLoad: true
            })
            this.props.dispatch({
                type: 'setting_orders_import_shop/exportOrder',
                payload: {
                    type: type,
                    shop_id: shop_id,
                    status: value.status || '',
                    data_from: value.data_from || '',
                    buyer_username: value.buyer_username || '',
                    begin_at: beginAt,
                    end_at: endAt,
                    no: value.no || '',
                },
                callback: () => {
                    this.setState({
                        exportLoad: false
                    },()=>{
                        const { exportUrl } = this.props.setting_orders_import_shop
                        if(exportUrl){
                            window.location.href = exportUrl
                        }
                    })
                }
            })
        })
    }
    onOpenModal = ()=>{
        this.setState({
            show: true
        })
    }
    onCloseModal = ()=>{
        this.setState({
            show: false
        })
    }
    render(){
        //定义表格顶部字段
        const columns = [
            {
                title: '类型',
                width: 75,
                dataIndex: 'shop_name',
                render: (text, item) => getShopTypeByVal(item.shop.type)
            },
            {
                title: '店铺',
                width: 100,
                dataIndex: 'file_name',
                render: (text, item) => <LabelEllipsis text={item.shop.name} />
            },
            {
                title: '订单号',
                width: 150,
                dataIndex: 'no',
                render: (text) => <LabelEllipsis text={text} />
            },
            {
                title: '购物账号',
                width: 150,
                dataIndex: 'buyer_username',
                render: (text, item) => <LabelEllipsis text={text} />
            },
            {
                title: '收货人',
                width: 90,
                dataIndex: 'receiver_name',
            },
            {
                title: '实收款(元)',
                dataIndex: 'paid_amount',
                width: 100,
                align: 'right',
                render: (text) => jine(text/100)
            },
            {
                title: '创建时间',
                dataIndex: 'created_at',
                width: 145,
                render: (text, item) => datetime(text)
            },
            {
                title: '状态',
                dataIndex: 'status',
                width: 90,
                render: (text, item) => getOrderStatusText(text)
            },
            {
                title: '来源',
                dataIndex: 'data_from',
                width: 140,
                render: (text, item, index) => { 
                    return this.getDataFrom(text, item, index)
                }
            },
            {
                title: '操作',
                dataIndex: 'opreate',
                width: 100,
                render: (value,item,index) => {
                    return <span onClick={()=> {this.detailOpenHandler(item.id)}} style={{color: '#4391FF', cursor: 'pointer'}} alt=''>查看详情</span>
                }
            },
        ]
        const OrderData = this.props.setting_orders_import_shop.list
        const total = this.props.setting_orders_import_shop.total
        const { current, pageSize } = this.props.setting_orders_import_shop
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

        const { getFieldDecorator } = this.props.form

        const data = this.props.setting_orders_import_shop.shops
        let type = []

        const {initData} = this.props.base
        const version_id = _.get(initData, 'company.product_version.id', '') 
        
        const arr =SHOP_TYPE.filter((item) => { 
            return version_id ===10 || version_id ===0 ? item.name !== 'Mendian' &&  item.name !== "TaoBao" &&  item.name !== "TianMao" &&  item.name !== "JD" &&  item.name !== "YouZan" :item.name !== 'Mendian'
        })
        arr.forEach((item, index) => { 
            type.push({
                value: item.value,
                label: item.type,
                children: [{
                    value: '',
                    label: '不限', 
                }],
            })
        })
        data.forEach((val,key) => { 
            type.forEach((v,k) => { 
                if (val.type === v.value) { 
                    v.children.push({
                        value: val.id,
                        label: val.name,  
                    })
                }
            }) 
        })
        
        return(
            <Page>
                <Page.ContentHeader
                    title={this.props.documentTitle}
                    helpUrl="http://newhelp.51zan.cn/manual/content/%E7%B3%BB%E7%BB%9F%E8%AE%BE%E7%BD%AE/%E5%BA%97%E9%93%BA.md"
                />    
                <Page.ContentAdvSearch>
                    <Form layout="horizontal" className="hz-from-search" onSubmit={this.searchFormSubmitHandler}>
                        <Row>
                            <Col span={8}>
                                <Form.Item label="店铺" {...formItemLayout}>
                                    {getFieldDecorator("type",{})(
                                        <Cascader 
                                            placeholder='不限' 
                                            options={type} popupClassName={styles.userCascader} 
                                            onChange={this.changeShop}
                                            getPopupContainer={triggerNode=>triggerNode.parentNode}
                                        ></Cascader>
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="订单状态"  {...formItemLayout}>
                                    {getFieldDecorator("status",{})(
                                        <Select
                                            placeholder="不限"
                                            optionFilterProp="children"
                                            dropdownClassName={styles.userSelect}
                                            getPopupContainer={triggerNode=>triggerNode.parentNode}
                                        >
                                            <Option value="">不限</Option>
                                            {
                                                ORDER_STATUSES.map(item => {
                                                    return (
                                                        <Option key={item.value} value={item.value}>{item.name}</Option>            
                                                    )
                                                })
                                            }
                                        </Select>
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="数据来源" {...formItemLayout}>
                                    {getFieldDecorator("data_from",{})(
                                        <Select
                                            placeholder="不限"
                                            optionFilterProp="children"
                                            getPopupContainer={triggerNode=>triggerNode.parentNode}
                                        >
                                            <Option value="">不限</Option>
                                            {
                                                ORDER_FORMS.map(item => {
                                                    return (
                                                        <Option   style={{display:(version_id ===10 || version_id ===0)&&item.value===1?'none':'block'}}   key={item.value} value={item.value}>{item.name}</Option>            
                                                    )
                                                })
                                            }
                                        </Select>
                                    )}
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={8}>
                                <Form.Item label="订单搜索"  {...formItemLayout}>
                                    {getFieldDecorator("no",{})(
                                        <Input placeholder="订单号" 
                                            onKeyUp={(e)=>{
                                                this.props.form.setFieldsValue({no: e.target.value.replace(/^\s/,'')})
                                            }} 
                                            onPaste = {(e)=>{
                                                this.props.form.setFieldsValue({no: e.target.value.replace(/^\s/,'')})
                                            }}
                                        />    
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="购物账号"  {...formItemLayout}>
                                    {getFieldDecorator("buyer_username",{})(
                                        <Input placeholder="旺旺ID，京东购物账号，微信号等"
                                            onKeyUp={(e)=>{
                                                this.props.form.setFieldsValue({buyer_username: e.target.value.replace(/^\s/,'')})
                                            }} 
                                            onPaste = {(e)=>{
                                                this.props.form.setFieldsValue({buyer_username: e.target.value.replace(/^\s/,'')})
                                            }}
                                        />
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="创建时间" {...formItemLayout}>
                                    {getFieldDecorator("rangePicker",{})(
                                        <RangePicker allowClear={false}/>
                                    )}
                                </Form.Item>
                            </Col>  
                        </Row>

                        <Row>
                            <Col span={8}>
                                <Col span={3} style={{width: '70px'}}></Col>
                                <Col span={16}>
                                    <Button className="hz-btn-width-default" type="primary" htmlType="submit" onClick={this.searchOrder}>
                                        <Icon type="search"/>
                                        搜索
                                    </Button>
                                    <Button className="hz-btn-width-default hz-margin-base-left" onClick={this.resetSearchHandler}>
                                        重置
                                    </Button>
                                </Col>
                            </Col>
                            {
                                this.state.visible&&(
                                    <Col span={8} offset={8}>
                                        <Col span={3} style={{width: '70px'}}></Col>
                                        <Col span={16}>
                                            <Button style={{marginRight: 6}}  type="primary" ghost loading={this.state.exportLoad} onClick={this.exportOrder}>导出订单</Button>
                                            <Button type="primary" ghost onClick={this.onOpenModal}>导入物流信息</Button> 
                                        </Col> 
                                    </Col>
                                )
                            }
                        </Row>
                    </Form>
                </Page.ContentAdvSearch>
                {/*表格*/}
                <Row>
                    <Table className="hz-table-fixed" columns={columns} dataSource={OrderData} loading={this.state.loading} pagination={false} rowKey='id' />
                    {
                        OrderData&&OrderData.length>0?
                            <Pagination 
                                className="ant-table-pagination"
                                current={current}
                                total={total}
                                showTotal={(total) => `共 ${total} 条`} 
                                showQuickJumper={true} 
                                showSizeChanger={true}  
                                pageSize={pageSize} 
                                pageSizeOptions= {['10', '20', '50', '100']}
                                onShowSizeChange={this.handleListPageChangeSize}
                                onChange={this.handleListPageChange} 
                            />
                            :''
                    } 
                </Row>

                <OrderDetails key={this.state.currentDetailsID} id={this.state.currentDetailsID} onClose={this.detailCloseHandler} />
                <OrderModal visible={this.state.show}  onClose={this.onCloseModal} key={this.state.show} />
            </Page>
        )
    }
}
