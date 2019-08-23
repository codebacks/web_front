import React from 'react'
import {connect} from 'dva'
import Page, { DEFAULT_PAGER , DEFAULT_PAGER_FILTER} from '../../../../components/business/Page'
import {  Row, Button, Select, Table, DatePicker, Pagination, Form, Col, Popover, Cascader } from 'antd'
import documentTitleDecorator from 'hoc/documentTitle'
import {datetime} from '../../../../utils/display'
import { SHOP_TYPE } from '../../../../common/shopConf'
import  OrderImport  from './modals/OrderImport'
import  FailCount  from './modals/FailCount'
import OrderDemo from './modals/OrderDemo'
import _ from 'lodash'
import Developer from './modals/Developer'
import moment from 'moment'
import styles from './index.less'
const { RangePicker } = DatePicker
const Option = Select.Option
const dataState = {
    'Leadingin': 1,
    'Finished': 2,
    'Error': 3,
}
const DEFAULT_CONDITION = {
    type: '',
    shop_id: '',
    status: '',
    beginAt: '',
    endAt: '',
}


@connect(({setting_ordersImport, base}) => ({
    setting_ordersImport,
    base,
}))
@documentTitleDecorator()
@Form.create()
export default class extends Page.ListPureComponent {
    state = {
        loading: false,
        importVisiable: false,
        failVisiable: false,
        demoVisiable: false,
        developVisiable: false,
    }  
    initPage = (isSetHistory = false) => {
        const condition = this.getParamForObject(DEFAULT_CONDITION, this.props.location.query)
        const pager = this.getParamForObject(DEFAULT_PAGER, this.props.location.query, DEFAULT_PAGER_FILTER)
        const { type, shop_id, status, beginAt, endAt } = condition
        this.getPageData(condition, pager, isSetHistory)
        if (type&&shop_id) { 
            this.props.form.setFieldsValue({
                'shop_id': [parseInt(type, 10), parseInt(shop_id, 10)],
            })
        }
        this.props.form.setFieldsValue({
            'status': status&&parseInt(status,10),
            'rangePicker': beginAt && endAt ? [moment(beginAt),moment(endAt)] : [],
        })
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
            type: 'setting_ordersImport/getOrderList',
            payload: {
                type: condition.type,
                shop_id: condition.shop_id,
                status: condition.status,
                begin_at: condition.beginAt,
                end_at: condition.endAt,  
                currentPage: pager.current,
                perPage: pager.pageSize,
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
            if (value.shop_id && value.shop_id.length !== 0) {
                type = value.shop_id[0]
                shop_id = value.shop_id[1]
            }
            const condition = {
                ...this.state.condition,
                ...{
                    type: type,
                    shop_id: shop_id,
                    status: value.status || '',
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

    componentDidMount () {
        super.componentDidMount()
        this.props.dispatch({
            type: 'setting_ordersImport/getShopList',
            payload: {
                offset: 0,
                limit: 1000,
            },
        })
        this.props.dispatch({
            type: 'setting_ordersImport/getToken',
            payload: {
                type: 'document',
            },
        })
    }
    //搜索
    orderSearch = () => {
        this.searchData()
    }
    resetSearchHandler = ()=>{
        this.props.form.resetFields()
        this.searchData()
    }
    //导入订单弹窗处理
    ordersImport= () => {
        this.setState({
            importVisiable: true,
        })
    }
    setCurrent= (item) => {
        this.props.dispatch({
            type: 'setting_ordersImport/setProperty',
            payload: { currentItem: item },
        })
    }
    //错误信息
    getErrorInfo = (item) => {
        this.props.dispatch({
            type: 'setting_ordersImport/setProperty',
            payload: { loading: true }
        }) 
        this.setCurrent(item)
        this.props.dispatch({
            type: 'setting_ordersImport/getFailItem',
            payload: {
                id: item.id
            },
            callback: (data)=>{
                this.props.dispatch({
                    type: 'setting_ordersImport/setProperty',
                    payload: { loading: false }
                })
            }
        })
        this.setState({
            failVisiable: true,
        })
    }
    //备注
    addOrderDec = (item) => {
        this.setCurrent(item)
        this.setState({
            demoVisiable: true,
        })
    }
    onChangeImport = () => { 
        this.setState({
            importVisiable: false,
        })
    }
    onChangeFail = () => { 
        this.setState({
            failVisiable: false,
        })
    }
    onChangeDemo = () => { 
        this.setState({
            demoVisiable: false,
        })
    }
    onClickDevelop = ()=>{
        this.setState({
            developVisiable: true
        })
    }
    onChangeDevelop = ()=>{
        this.setState({
            developVisiable: false
        })
    }
    render() {
        const { loading } = this.state
        const { currentPage, perPage, OrderData, totalPage, shopDataOrder } = this.props.setting_ordersImport
        OrderData.forEach((val,key)=>{
            shopDataOrder.forEach((v,k)=>{
                if(val.shop_id === v.id){
                    val.shop_name = v.name
                }
            })
        })
        let type = []
        const {initData} = this.props.base
        const version_id = _.get(initData, 'company.product_version.id', '') 
        // 显示淘宝天猫类型的店铺的导入
        const arr =SHOP_TYPE.filter((item) => { 
            return version_id ===10 || version_id ===0? item.name === 'ZiYing' : item.name === 'TaoBao' || item.name === 'TianMao' || item.name === 'ZiYing'
        })
        arr.forEach((item, index) => { 
            type.push({
                value: item.value,
                label: item.type,
                children: [],
            })
        })
        shopDataOrder.forEach((val,key) => { 
            type.forEach((v,k) => { 
                if (val.type === v.value) { 
                    v.children.push({
                        value: val.id,
                        label: val.name,  
                    })
                }
            }) 
        })
        //定义表格顶部字段
        const columns = [
            {
                title: '导入店铺',
                dataIndex: 'shop_name',
            },
            {
                title: '导入文件',
                dataIndex: 'file_name',
                render: (value,item,index) => {
                    if(value === null){
                        return ''
                    }else{
                        return (
                            <div>
                                <div>
                                    <Popover content={value.order_name} trigger="hover" placement="bottom" overlayStyle={{maxWidth: 200,wordWrap:'break-word'}}>
                                        {value.order_name.length>10?`${value.order_name.substr(0,10)}...`:value.order_name}
                                    </Popover> 
                                </div>
                                <div>
                                    <Popover content={value.item_name} trigger="hover" placement="bottom" overlayStyle={{maxWidth: 200,wordWrap:'break-word'}}>
                                        {value.item_name.length>10?`${value.item_name.substr(0,10)}...`:value.item_name}
                                    </Popover>
                                </div>
                            </div>
                        )
                    }
                }
            },
            {
                title: '导入订单数',
                dataIndex: 'count',
                align: 'center',
            },
            {
                title: '成功',
                dataIndex: 'success_count',
                align: 'center',
            },
            {
                title: '失败',
                dataIndex: 'failed_count',
                align: 'center',
                render: (value,item,index) => {
                    return <span style={{color: '#4492FF',cursor: 'pointer'}} onClick={()=>{this.getErrorInfo(item)}}>{value}</span>
                }
            },
            {
                title: '导入时间',
                dataIndex: 'created_at',
                render: (text, item) => datetime(text)
            },
            {
                title: '完成时间',
                dataIndex: 'complete_at',
                render: (text, item) => datetime(text)
            },
            {
                title: '导入状态',
                dataIndex: 'status',
                render: (value,item,index) => {
                    if(value === dataState.Finished){
                        return <div>已完成</div>
                    }else if(value === dataState.Leadingin){
                        return <div>导入中</div>
                    }else if(value === dataState.Error){
                        return <div  style={{color: '#4492FF',cursor: 'pointer'}}  onClick={()=>{this.getErrorInfo(item)}}>异常终止</div>
                    }
                } 
            },
            {
                title: '备注',
                dataIndex: 'memo',
                render: (value,item,index) => {
                    if(value){
                        return <div style={{color: '#4492FF',cursor: 'pointer'}} onClick={()=>{this.addOrderDec(item)}}>{value}</div>
                    }else{
                        return <div style={{color: '#4492FF',cursor: 'pointer'}} onClick={()=>{this.addOrderDec(item)}}>添加</div>
                    }
                }
            },
        ]
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
        return (
            <Page>
                <Page.ContentHeader
                    title={this.props.documentTitle}
                    helpUrl="http://newhelp.51zan.cn/manual/content/%E7%B3%BB%E7%BB%9F%E8%AE%BE%E7%BD%AE/%E5%BA%97%E9%93%BA.md"
                />
                <Row>
                    <div style={{marginBottom: 16}}>
                        <Button
                            type="primary"
                            style={{width: '100'}}
                            onClick={this.ordersImport}
                        >手动导入订单
                        </Button>
                        <Button
                            className={styles.downLoad + ' ant-btn'}
                            style={{width: '100',float: 'right'}}
                            onClick={this.onClickDevelop}
                        >API订单接入
                        </Button>
                    </div>  
                </Row>
                <div> 
                    {/*搜索*/}
                    <Page.ContentAdvSearch>
                        <Form layout="horizontal" className="hz-from-search">
                            <Row>
                                <Col span={8}>
                                    <Form.Item label="导入店铺" {...formItemLayout}>
                                        {getFieldDecorator("shop_id",{})(
                                            <Cascader placeholder='不限' options={type} getPopupContainer={triggerNode=>triggerNode.parentNode}></Cascader>
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item label="导入状态" {...formItemLayout}>
                                        {getFieldDecorator("status",{})(
                                            <Select 
                                                getPopupContainer={triggerNode=>triggerNode.parentNode} 
                                                placeholder='不限'
                                            >
                                                <Option value="">不限</Option>
                                                <Option value={dataState.Finished}>已完成</Option>
                                                <Option value={dataState.Leadingin}>导入中</Option>
                                                <Option value={dataState.Error}>异常终止</Option>
                                            </Select>
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item label="导入时间" {...formItemLayout}>
                                        {getFieldDecorator("rangePicker",{})(
                                            <RangePicker format={'YYYY-MM-DD'}/>
                                        )}
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={8}>
                                    <Col span={3} style={{width: '70px'}}></Col>
                                    <Col span={16}>
                                        <Button type="primary" icon="search" onClick={this.orderSearch}>搜索</Button>
                                        <Button className="hz-btn-width-default hz-margin-base-left" onClick={this.resetSearchHandler}>
                                            重置
                                        </Button>
                                    </Col>
                                </Col>  
                            </Row>
                        </Form>
                    </Page.ContentAdvSearch> 
                    {/*表格*/}
                    <Row>
                        <Table columns={columns} dataSource={OrderData} pagination={false} rowKey='id' loading={loading} />
                        {OrderData&&OrderData.length>0 ? 
                            <Pagination 
                                className="ant-table-pagination"
                                current={currentPage}
                                total={totalPage}
                                showTotal={(total) => `共 ${total} 条`} 
                                showQuickJumper={true} 
                                showSizeChanger={true}  
                                pageSize={perPage} 
                                pageSizeOptions= {['10', '20', '50', '100']}
                                onShowSizeChange={this.handleListPageChangeSize}
                                onChange={this.handleListPageChange} 
                            />
                            :''
                        }
                    </Row>
                    <OrderImport
                        visiable={this.state.importVisiable} 
                        onChange={this.onChangeImport} 
                        key={this.state.importVisiable.toString() + "1"}
                    ></OrderImport>
                    <FailCount 
                        visiable={this.state.failVisiable} 
                        onChange={this.onChangeFail} 
                        key={this.state.failVisiable.toString()+2}
                    ></FailCount>
                    <OrderDemo
                        visible={this.state.demoVisiable}
                        onChange={this.onChangeDemo}
                        key={this.state.demoVisiable.toString()+3}
                    ></OrderDemo>
                    <Developer
                        visible={this.state.developVisiable}
                        onChange={this.onChangeDevelop}
                        key={this.state.developVisiable.toString()+4}
                    />
                </div>
            </Page>
        )
    }
}
