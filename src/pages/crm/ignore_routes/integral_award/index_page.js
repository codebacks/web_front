import {Fragment} from 'react'
import Page, { DEFAULT_PAGER, DEFAULT_PAGER_FILTER } from '@/components/business/Page'
import documentTitleDecorator from 'hoc/documentTitle'
import { Form, Row, Col, Input, Button, Icon, Table, Pagination, Modal, Select, Tabs, Divider, Badge, message, notification } from 'antd'
import { connect } from 'dva'
import router from 'umi/router'
import styles from './index.less'
import { getImageAbsoulteUrl } from '@/utils/resource'
import {jine, datetime} from '../../../../utils/display'
import { AWARD_TYPE, getStatusTypeByVal, getAwardTypeByVal, getStatusValByName } from 'crm/services/integral'
const Option = Select.Option
const TabPane = Tabs.TabPane
const confirm = Modal.confirm

const DEFAULT_CONDITION = {
    type:'',
    name:'',
    status: ''
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
        disabledBtn: {
            on: true,
            off: true,
            del: true,
        },
        selectedRowKeys: [],
        condition: { ...DEFAULT_CONDITION },
        pager: { ...DEFAULT_PAGER }
    }

    initPage = (isSetHistory = false) => {
        const condition = this.getParamForObject(DEFAULT_CONDITION, this.props.location.query)
        const pager = this.getParamForObject(DEFAULT_PAGER, this.props.location.query, DEFAULT_PAGER_FILTER)
        this.getPageData(condition, pager, isSetHistory)
        const {
            type,
            name,
            status
        } = condition
        this.props.form.setFieldsValue({
            'type': type,
            'name': name,
        })
    }

    getPageData = (condition, pager, isSetHistory = true, callback) => {
        if (isSetHistory) {
            this.history(condition, pager)
        }

        this.setState({
            selectedRowKeys: [],
            condition: condition,
            pager: pager,
            loading: true
        })
        this.props.dispatch({
            type: 'crm_intergral/getAwardList',
            payload:{
                offset: pager.current - 1,
                limit: pager.pageSize,
                type:condition.type,
                name:condition.name,
                status:condition.status
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
        this.initBtnStatus()
        this.handleSearch()
    }
    handleSearch = () =>{
        const { form } = this.props
        form.validateFields((error,value) => {
            const condition = {
                ...this.state.condition,
                ...{
                    type: value.type || '',
                    name: value.name || '',
                }
            }
            const pager = {
                pageSize : this.state.pager.pageSize,
                current : DEFAULT_PAGER.current
            }
            this.initBtnStatus()
            this.getPageData(condition, pager)
        })
    }


    addAward = ()=>{
        router.push('/crm/integral_award/award_detail')
    }

    handleTabs = (key)=>{
        const condition = {
            ...this.state.condition,
            ...{
                status: key || ''
            }
        }
        const pager = {
            pageSize : this.state.pager.pageSize,
            current : DEFAULT_PAGER.current
        }
        this.initBtnStatus()
        this.getPageData(condition, pager)
    }
    handleGoods = (item)=>{
        router.push(`/crm/integral_award/award_detail?id=${item.id}`)
    }
    toggleGoods = (item)=>{
        let status = parseInt(item.status,10) === getStatusValByName('ShangJia') ? getStatusValByName('XiaJia') : getStatusValByName('ShangJia')
        let text = parseInt(item.status,10) === getStatusValByName('ShangJia') ? '下架' : '上架'
        if(status === getStatusValByName('ShangJia') && parseInt(item.stock_count, 10) === 0){
            // confirm({
            //     title: `库存为0，无法上架`,
            //     maskClosable: true,
            //     onOk: () => {},
            //     onCancel:()=> {},
            // })
            notification.open({
                message: '提示',
                description: '抱歉，此款奖品库存为0，无法上架，请编辑库存数后再执行上架操作。',
                icon: <Icon type="info-circle" style={{ color: '#108ee9', fontSize: 20 }} />,
              })
            return 
        }
        this.onBatch([item.id + ''], text, false, status)
    }

    // 批量操作
    // 上架
    onBatchOn =  ()=>{
        const {selectedRowKeys} = this.state
        this.onBatch(selectedRowKeys, '上架', true, getStatusValByName('ShangJia'))
    }
    // 下架
    onBatchOff =  ()=>{
        const {selectedRowKeys} = this.state
        this.onBatch(selectedRowKeys, '下架', true, getStatusValByName('XiaJia'))
    }
    // 删除
    onBatchDel =  ()=>{
        const {selectedRowKeys} = this.state
        this.onBatch(selectedRowKeys, '删除', true)
    }
    onBatch = (ids, text, isBatch, status)=>{
        let api_type = '', payload = {}
        if(status){
            api_type = 'crm_intergral/toggleAward'
            payload = {
                ids: ids,
                status: status
            }
        }else{
            api_type = 'crm_intergral/deleteAward'
            payload = {
                ids: ids
            }
        }
        let _this = this
        confirm({
            title: `确认操作`,
            content: `是否${isBatch?'批量':''}${text}选中的奖品`,
            maskClosable: true,
            onOk: () => {
                _this.props.dispatch({
                    type: api_type,
                    payload: payload,
                    callback: (res) => {
                        if (!res.error) {
                            message.success(`已${isBatch?'批量':''}${text}选中的奖品`)
                            _this.initBtnStatus(()=>{
                                _this.handleSearch()
                            })
                        }
                    }
                })
            },
            onCancel() {
            },
        })
    }
    onSelectChange =(selectedRowKeys, selectedRows) => {
        // 更改按钮的disabled状态
        // 有上架的状态，则可以显示批量下架(下架同理)
        // 有下架的且不包含上架的才显示批量删除
        const { getGoodsList } = this.props.crm_intergral
        this.setState({
            selectedRowKeys: [...selectedRowKeys]
        },()=>{
            console.log(selectedRowKeys)
            let hasOn = false, hasOff = false, stockCount = false
            for(let v of getGoodsList){
                for(let k of selectedRowKeys){
                    if(v.id === k){
                        let status = parseInt(v.status, 10)
                        let stock_count = parseInt(v.stock_count, 10)
                        // 上架
                        if(status === getStatusValByName('ShangJia')){
                            hasOn = true
                        }
                        // 下架
                        if(status === getStatusValByName('XiaJia')){
                            hasOff = true
                        }
                        // 判断
                        if(status === getStatusValByName('XiaJia') && stock_count === 0 ){
                            stockCount = true
                        }
                    }
                }  
            }
            let {disabledBtn} = this.state
            console.log(hasOn, hasOff, stockCount)
            if(hasOn){
                disabledBtn.off = false
            }
            if(hasOff && !stockCount){
                disabledBtn.on = false
            }
            if(hasOff && stockCount){
                disabledBtn.on = true
            }
            // 没有上架且有下架
            if(hasOn || hasOff){
                disabledBtn.del = false
            }
            if(!hasOn && !hasOff){
                disabledBtn.off = true
                disabledBtn.on = true
                disabledBtn.del = true
            }
            console.log(disabledBtn)
            this.setState({
                disabledBtn : {...disabledBtn}
            })
        })
    }
    initBtnStatus = (callback)=>{
        this.setState({
            selectedRowKeys: [],
            disabledBtn : {...{
                off : true,
                on : true,
                del : true,
            }}
        },callback) 
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
                style: {
                    marginRight: '40px'
                }
            },
        }
        const columns = [
            {
                title: '奖品名称',
                dataIndex: 'name',
                className: 'hz-table-column-width-150'
            },
            {
                title: '奖品主图',
                dataIndex: 'image_urls',
                className: 'hz-table-column-width-100',
                render: (value,item,index) => {
                    if(!item.image_urls){
                        return ''
                    }
                    let imgArr = item.image_urls
                    if(Array.isArray(imgArr)&&imgArr.length>0){
                        return <div className={styles.awardImg}>{imgArr[0]&&(<img src={getImageAbsoulteUrl(imgArr[0])} alt=''/>)}</div>
                    }else{
                        return ''
                    }
                }
            },
            {
                title: '奖品类型',
                dataIndex: 'type',
                className: 'hz-table-column-width-100',
                render:(text,record,index) =>{
                    return getAwardTypeByVal(text) || ''
                } 
            },
            {
                title: '奖品状态',
                dataIndex: 'status',
                className: 'hz-table-column-width-100',
                render:(text,record,index) =>{
                    return <Badge status={parseInt(text, 10) === getStatusValByName('ShangJia') ?'success': 'default'} text={`已${getStatusTypeByVal(text)}`}/>
                } 
            },
            {
                title: '奖品价值(元)',
                dataIndex: 'price',
                className: 'hz-table-column-width-120',
                align: 'right',
                render:(text,record,index) =>{
                    return text&&jine(text, '0.00', 'Fen')
                } 
            },
            {
                title: '兑换积分',
                dataIndex: 'consumed_points',
                className: 'hz-table-column-width-100',
                align: 'center',
                render:(text,record,index) =>{
                    return text&&jine(text, '0,00', 'Fen')
                } 
            },
            {
                title: '总库存',
                dataIndex: 'stock_count',
                className: 'hz-table-column-width-80',
                align: 'center',
                render:(text,record,index) =>{
                    if(parseInt(text, 10) > 0){
                        return text
                    }else{
                        return <span style={{color: '#f00'}}>{text}</span>
                    }
                    
                } 
            },
            {
                title: '已兑换',
                dataIndex: 'sales_count',
                className: 'hz-table-column-width-80',
                align: 'center',
            },
            {
                title: '更新时间',
                dataIndex: 'updated_at',
                className: 'hz-table-column-width-120',
                render: (value,item,index) => {
                    return value&&datetime(value)
                }
            },
            {
                title: '操作',
                dataIndex: 'action',
                className: 'hz-table-column-width-120',
                render: (value, record, index) => {
                    return (
                        <Fragment>
                            <a href='javascript:;' onClick={() => this.handleGoods(record)}>编辑</a>
                            < Divider type = "vertical" />
                            <a href='javascript:;' onClick={() => this.toggleGoods(record)}>{parseInt(record.status, 10) !== 1?'上架':'下架'}</a>
                        </Fragment>
                    )
                }
            }
        ]
        
        const { getFieldDecorator } = this.props.form
        const { getGoodsList, goodsListTotal } = this.props.crm_intergral
        const { current, pageSize } = this.state.pager
        const { selectedRowKeys,loading } = this.state
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange
        }
        return (
            <Page>
                {/*头部面包屑*/}
                <Page.ContentHeader
                    title={this.props.documentTitle}
                    helpUrl="http://newhelp.51zan.cn/manual/content/%E5%AE%A2%E6%88%B7%E7%AE%A1%E7%90%86/%E7%A7%AF%E5%88%86%E8%BF%90%E8%90%A5.md"
                />
                <Button className={styles.btnClick} type="primary" onClick={this.addAward}>
                    <Icon type="plus" />
                    添加奖品
                </Button>
                <div className={styles.head}>
                    <div className={styles.headTit}>温馨提示</div>
                    <div>
                        <div className={styles.headCon}>1. 添加的奖品将在积分商城展示，红包奖品需支付公众号开通企业付款功能。开通前，需入驻满90天，且有30天连续不间断流水记录；</div>
                        <div className={styles.headCon}>2. 奖品展示默认按创建或更新时间降序排列，最新排在最前面；</div>
                        <div className={styles.headCon}>3. 商城奖品将显示库存，若奖品兑换完，将自动下架，可编辑重新上架。</div>
                    </div>
                </div>
                {/*搜索条件框*/}
                <Page.ContentAdvSearch  multiple={false}>
                    <Form onSubmit={this.onSubmit}>
                        <Row>
                            <Col span={8}>
                                <Form.Item label='奖品名称' {...formItemLayout}>
                                    {getFieldDecorator('name', {})(
                                        <Input placeholder='请输入奖品名称' />
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label='奖品类型' {...formItemLayout}>
                                    {getFieldDecorator('type', {})(
                                        <Select placeholder="全部类型" getPopupContainer={triggerNode => triggerNode.parentNode}>
                                            <Option value=''>全部类型</Option>
                                            {
                                                AWARD_TYPE.map(item=>{
                                                    return <Option value={item.value} key={item.value}>{item.type}</Option>
                                                })
                                            }
                                        </Select>
                                    )}
                                </Form.Item>
                            </Col>
                            <Col style={{marginTop:'4px'}}>
                                <Button type='primary' htmlType='submit'>
                                    <Icon type="search" />
                                    搜索
                                </Button>
                                <Button className="hz-btn-width-default hz-margin-small-left" style={{marginLeft:'16px'}} onClick={this.onReset}>重置</Button>
                            </Col>
                        </Row>
                    </Form>
                </Page.ContentAdvSearch>
                <Tabs activeKey={this.state.condition.status + ''} onChange={this.handleTabs}>
                    <TabPane tab="全部" key=""></TabPane>
                    <TabPane tab="已上架" key="1"></TabPane>
                    <TabPane tab="已下架" key="2"></TabPane>
                </Tabs>
                <div className={styles.batchOperate}>
                    <Button className={styles.button} disabled={this.state.disabledBtn.on} onClick={this.onBatchOn}>批量上架</Button>
                    <Button className={styles.button} disabled={this.state.disabledBtn.off} onClick={this.onBatchOff}>批量下架</Button>
                    <Button className={styles.button} disabled={this.state.disabledBtn.del} onClick={this.onBatchDel}>批量删除</Button>
                </div>
                <Table
                    rowKey='id'
                    rowSelection={rowSelection} 
                    columns={columns}
                    pagination={false}
                    loading={loading}
                    dataSource={getGoodsList}
                />
                {getGoodsList.length ?
                    <Pagination
                        className="ant-table-pagination"
                        current={current}
                        total={goodsListTotal}
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
