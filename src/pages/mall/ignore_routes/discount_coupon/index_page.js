/**
 **@Description:优惠券-列表
 **@author: yecuilin
 */
import Page, { DEFAULT_PAGER , DEFAULT_PAGER_FILTER,Label} from '../../../../components/business/Page'
import {connect} from 'dva'
import DocumentTitle from 'react-document-title'
import { Button, Icon, Divider,Table, Pagination, Popover,Tooltip,Badge, message,Form, Row, Col, Input, DatePicker ,Select,Modal} from 'antd'
import router from 'umi/router'
import styles from './index.less'
import numeral from 'numeral'
import moment from 'moment'
import { getImageAbsoulteUrl } from '../../../../utils/resource'
import {STATUS_TYPE} from '../../services/discount_coupon'
import {jine} from '../../../../utils/display'
const FormItem = Form.Item
const { RangePicker } = DatePicker
const Option = Select.Option
const DEFAULT_CONDITION = {
    title:'',
    status:'',
    begin_at:'',
    end_at:'',
}

@Form.create()
@connect(({base,mall_discount_coupon}) =>({
    base,
    mall_discount_coupon
}))
export default class extends Page.ListPureComponent {
    state = {
        condition: {...DEFAULT_CONDITION},
        pager: {...DEFAULT_PAGER},
        loading:false,
        visible:false,
        getgoodsList_loading:false,
        currentPage: 1,
        currentPageSize: 10,
        id:0,
    }
    initPage = (isSetHistory = false) => {
        const condition = this.getParamForObject(DEFAULT_CONDITION, this.props.location.query)
        const pager = this.getParamForObject(DEFAULT_PAGER, this.props.location.query, DEFAULT_PAGER_FILTER)
        this.getPageData(condition, pager, isSetHistory)
        const { title,status, begin_at, end_at } = condition
        this.props.form.setFieldsValue({
            'rangePicker': begin_at && end_at ? [moment(begin_at), moment(end_at)] : [],
            'title': title || '',
            'status': status
        })
    }
    getPageData = (condition, pager, isSetHistory = true,callback) => {
        if( isSetHistory ){
            this.history(condition, pager)
        }
        this.setState({
            condition: condition,
            pager: pager,
            loading:true,
        })
        this.props.dispatch({
            type:'mall_discount_coupon/couponDataList',
            payload:{
                title:condition.title,
                status:condition.status,
                begin_at:condition.begin_at,
                end_at:condition.end_at,
                offset: (pager.current - 1) * pager.pageSize,
                limit: pager.pageSize,
            },
            callback:(data) =>{
                this.setState({
                    loading: false
                })
              
            }
            
        })


    }
    searchData = () =>{
        const { form } = this.props
        
        form.validateFields((error,value) => {
            if (error) return
            let beginAt = '', endAt = ''
            
            if (value.rangePicker && value.rangePicker.length !== 0) {
                beginAt = value.rangePicker[0].format('YYYY-MM-DD HH:mm:ss')
                endAt = value.rangePicker[1].format('YYYY-MM-DD HH:mm:ss')
            }

            const condition = {
                ...this.state.condition,
                ...{
                    title:value.title || '',
                    status:value.status,
                    begin_at:beginAt,
                    end_at:endAt,
                }
            }

            const pager = {
                pageSize : this.state.pager.pageSize,
                current : DEFAULT_PAGER.current
            }
            
            this.getPageData(condition, pager)
        })
    }
    /* 事件处理 */
    onSubmit = (e) => {
        e.preventDefault()

        this.searchData()
    }
    onReset = () => {
        this.props.form.resetFields()

        this.searchData()
    }
    // 新建优惠券
    create = () =>{
        router.push('/mall/discount_coupon/create')
    }
    // 查看详情
    checkDetail = (data) =>{
        this.props.dispatch({
            type:'mall_discount_coupon/checkDetail',
            payload:{
                id:data.id
            },
            callback:(val) =>{
                if(val.data && val.meta.code === 200){
                    this.setState({
                        visible:true,
                        id:data.id
                    },() =>{
                        if(val.data.goods_relation === 2){
                            this.getgoodsList()
                        }
                    })
                    
                }
            }
        })

    }
    handleCancel = () =>{
        this.setState({
            visible:false
        })
    }
    goCheckData = (data) =>{
        router.push(`/mall/discount_coupon/discount_data?id=${data.id}`)
    }
    getgoodsList = () =>{
        const {id,currentPage,currentPageSize} = this.state
        this.setState({
            getgoodsList_loading:true
        })
        this.props.dispatch({
            type:'mall_discount_coupon/getgoodsList',
            payload:{
                id:id,
                page: currentPage - 1,
                per_page: currentPageSize,
            },
            callback:()=>{
                this.setState({
                    getgoodsList_loading:false
                })
            }
        })
    }
    showSpecs (value) {
        let specificList = ''
        if (value.property_a) {
            specificList += value.property_a
            if (value.property_b) {
                specificList += '；' + value.property_b
            }
            if (value.property_c) {
                specificList += '；' + value.property_c
            }
        }
        return specificList
    }
    checkTag = (data) =>{
        switch(data.goods.activity_type) {
            case 1:
                return <span className={`${styles.tag} ${styles.isCoupon}`}>拼团</span>
            case 2:
                return <span className={`${styles.tag} ${styles.isSpecial}`}>特价</span>
            case 4:
                return <span className={`${styles.tag} ${styles.isNomal}`}>普通</span>
            default: 
                return ''
        }
    }
    handleChangeSize = (value, pageSize) => {
        this.setState({
            currentPageSize: pageSize,
            currentPage: value
        },()=>{
            this.getgoodsList()
        })
    }
    goToPage = (page, pageSize) =>{
        this.setState({
            currentPage: page
        },()=>{
            this.getgoodsList()
        })
    }
    // 下架 
    handleCoupub = (data,type) =>{
        let tip = '', title = ''
        if(type === 'solidOut'){
            title = '下架活动'
            tip = '下架后优惠券不能继续领取，但是已被领取的券可以继续使用，是否下架？'
        }else if(type === 'putaway'){
            title = '上架活动'
            tip = '上架后优惠券能继续领取，是否上架？'
        }else{
            title = '作废活动'
            tip = '作废后优惠券将下架；且已领取的优惠券不可用，作废操作不可逆，是否作废？'
        }
        Modal.confirm({
            title: title,
            content: tip,
            onOk:()=> {
                this.props.dispatch({
                    type:`mall_discount_coupon/${type}`,
                    payload:{
                        id:data.id
                    },
                    callback:(data) =>{
                        if(data.data && data.meta.code === 200){
                            if(type === 'solidOut'){
                                message.success('下架操作成功！')
                            }else if(type === 'putaway'){
                                message.success('上架操作成功！')
                            }else{
                                message.success('作废操作成功！')
                            }
                            this.searchData()
                        }
                    }
                })
            },
        })
        
    }
    render (){
        const { getFieldDecorator } = this.props.form
        const { current, pageSize } = this.state.pager
        const {visible,getgoodsList_loading,currentPage,currentPageSize} = this.state
        const {couponDataList,couponDataList_total,checkDetail,getgoodsList,getgoodsList_total} = this.props.mall_discount_coupon
        const formItemLayoutSpecial = {
            labelCol: {
                span: 6,
                style: {
                    width: '86px',
                    textAlign: 'left',
                },
            },
            wrapperCol: {
                span: 16,
            },
        }
        const formItemLayout = {
            labelCol: {
                span: 6,
                style: {
                    width: '70px',
                    textAlign: 'left',
                },
            },
            wrapperCol: {
                span: 16,
            },
        }
        const action = (<div>
            <Button
                type="primary"
                onClick={this.create.bind(this)}
            >
                <Icon type="plus" />新建优惠券
            </Button>
        </div>)
        const columns = [
            {
                title: '创建时间',
                dataIndex: 'created_at'
            },{
                title: '优惠券名称',
                dataIndex: 'title',
                render:(text,record) =>{
                    return(
                        <a href="javascript:void(0)" onClick={()=>this.checkDetail(record)}>
                            {
                                text.length >= 5 ? <Popover placement="topLeft" content={text} title={null} trigger="hover">
                                    <span>{text.substring(0,4)}...</span>
                                </Popover>
                                    : <span>{text}</span>
                            }
                        </a>
                    )
                }
            },{
                title: '优惠内容',
                dataIndex: 'content',
                render:(text,record) =>{
                    return (
                        <div>
                            <span>满{jine(record.coupon_type.full_amount,'0','Fen')}减{jine(record.coupon_type.reduce_amount,'0','Fen')}</span>
                        </div>
                    )
                }
            },{
                title: '可用商品',
                dataIndex: 'goods_relation',
                render:(text,record) =>{
                    return (
                        <span>{text === 1 ? '全部商品' : '指定商品'}</span>
                    )
                }
            },{
                title: '状态',
                dataIndex: 'status',
                render:(text,record) =>{
                    if(record.status === 11 && record.available_status !== 3){
                        return(
                            <Badge status="default" text="已下架" />
                        )
                    }else if(record.status === 12){
                        return(
                            <Badge status="default" text="已作废" />
                        )
                    }else if(record.available_status === 1){
                        
                        return(
                            <Badge status="error" text="未开始" />
                        )
                    }else if(record.available_status === 2){
                        return(
                            <Badge status="success" text="可用" />
                        )
                    }else if(record.available_status === 3){
                        return(
                            <Badge status="warning" text="不可用" />
                        )
                    }
                }
            },{
                title: '总数',
                align:'center',
                dataIndex: 'count'
            },{
                title: '发放次数',
                align:'center',
                dataIndex: 'grant_times'
            },{
                title: '领取次数',
                align:'center',
                dataIndex: 'pick_times'
            },{
                title: '使用次数',
                align:'center',
                dataIndex: 'use_times'
            },{
                title: '有效期',
                dataIndex: 'expired_time',
                render:(text,record) =>{
                    return (
                        <div>
                            <div style={{marginBottom:3}}>{record.begin_at.substring(0,16)} ~</div>
                            <div>{record.end_at.substring(0,16)}</div>
                        </div>
                    )
                }
            },{
                title: '操作',
                dataIndex: 'action',
                render:(text,record,inxex) =>{
                    return (
                        <div>   
                            <a href='javascript:;' onClick={()=>this.goCheckData(record)}>数据</a>
                            
                            {
                                record.status === 10 && record.available_status !==3 ? <span>
                                    <Divider type="vertical" />
                                    <a href='javascript:;' onClick={()=>this.handleCoupub(record,'solidOut')}>下架</a>
                                </span> : ''
                            }
                            {
                                (record.status === 11 && record.available_status !== 3) ? <span>
                                    <Divider type="vertical" />
                                    <a href='javascript:;' onClick={()=>this.handleCoupub(record,'putaway')}>上架</a>
                                </span> : ''
                            }
                            {
                                (record.status === 12 || record.available_status === 3) ? '' : <span>
                                    <Divider type="vertical" />
                                    <a href='javascript:;' onClick={()=>this.handleCoupub(record,'cancellation')}>作废</a>
                                </span> 
                            }
                        </div>
                        
                    )
                }
            },
        ]
        const columns_modal = [
            {
                title: '商品',
                dataIndex: 'goods',
                render:(text,record) =>{
                    let string = this.showSpecs(record)
                    return (
                        <div className={styles.goodsInfoWrap}>
                            <div className={styles.goodsImgWrap}>
                                <img src={ record.cover_url ? getImageAbsoulteUrl(record.cover_url, { thumbnail: { width: 60, height: 60 } }) : ''} alt="" />
                            </div>
                            <div className={styles.goodsInfo}>
                                <Tooltip placement="top" title={record.goods.name} arrowPointAtCenter>
                                    <div className={styles.goodsName} style={{maxWidth:420}}>{record.goods.name}</div>
                                </Tooltip>
                                <div style={{display: 'flex',alignItems: 'center'}}>
                                    <span style={{color: '#FA8910'}}>￥{numeral(record.price / 100).format('0,00.00')}</span>
                                    {string !== '' ?
                                        <Tooltip placement="bottom" title={string} arrowPointAtCenter>
                                            <span className={styles.specs}>{string}</span>
                                        </Tooltip>
                                        : ''
                                    }
                                    <div className={styles.tagWrap}>
                                        {
                                            record.is_valid_coupon ? <span className={`${styles.tag} ${styles.isCoupon}`} >优惠券</span> : ''
                                        }
                                        {
                                            record.goods.is_recommend ? <span className={`${styles.tag} ${styles.isRecommend}`}>推荐</span> : ''
                                        }
                                        {this.checkTag(record)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }
            }
        ]
        return(
            <DocumentTitle title='优惠券'>
                <Page>
                    <Page.ContentHeader
                        title='优惠券'
                        action={action}
                    />
                    <Page.ContentAdvSearch>
                        <Form onSubmit={this.onSubmit} layout="horizontal" className="hz-from-search">
                            <Row>
                                <Col span={8}>
                                    <FormItem label="优惠券名称" {...formItemLayoutSpecial}>
                                        {getFieldDecorator('title',{})(
                                            <Input placeholder='请输入优惠券名称'/>
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={8}>
                                    <FormItem label='优惠券状态' {...formItemLayoutSpecial}>
                                        {getFieldDecorator('status',{})(
                                            <Select
                                                placeholder="全部状态"
                                            >
                                                <Option value="">全部状态</Option>
                                                {
                                                    STATUS_TYPE.slice(0,5).map((item) => {
                                                        return <Option key={item.value} value={item.value}>{item.name}</Option>
                                                    })
                                                }
                                            </Select>
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={8}>
                                    <FormItem label='创建时间' {...formItemLayout}>
                                        {getFieldDecorator('rangePicker',{})(
                                            <RangePicker 
                                                showTime={{
                                                    hideDisabledOptions: true,
                                                    defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('00:00:00', 'HH:mm:ss')],
                                                }}
                                                format="YYYY-MM-DD HH:mm:ss"
                                                placeholder={['起始时间', '结束时间']}
                                                style={{width:'100%'}}
                                            />
                                        )}
                                    </FormItem>
                                </Col>
                            </Row>
                            <Button type='primary' icon="search" style={{marginLeft:86}} htmlType='submit'>搜索</Button>
                            <Button style={{marginLeft: '16px',width: '82px'}} onClick={this.onReset}>重置</Button>
                        </Form>
                    </Page.ContentAdvSearch>
                    <Table
                        columns={columns}
                        dataSource={couponDataList}
                        loading={this.state.loading}
                        pagination={false}
                        rowKey='id'
                    />
                    {
                        couponDataList && couponDataList.length ? <Pagination
                            className="ant-table-pagination"
                            current={current}
                            total={couponDataList_total}
                            showTotal={(total) => `共 ${total} 条`} 
                            showQuickJumper={true} 
                            showSizeChanger={true}  
                            pageSize={pageSize} 
                            pageSizeOptions= {['10', '20', '50', '100']}
                            onShowSizeChange={this.handleListPageChangeSize}
                            onChange={this.handleListPageChange} />
                            : ''
                    }
                    <Modal
                        title="优惠券详情"
                        visible={visible}
                        width={600}
                        footer={null}
                        onCancel={this.handleCancel}
                    >
                        <div className={styles.boxTitle}>
                            <span className={styles.boxTitleIcon}></span>
                            <span className='hz-margin-small-left'>基础设置</span>
                        </div>
                        <Row className={styles.dataItem}>
                            <Col span={24}>
                                <Label title="优惠券名称" text={checkDetail.title}></Label>
                            </Col>
                            <Col span={24}>
                                {
                                    Object.keys(checkDetail).length ? <Label title="优惠券内容" text={`满${jine(checkDetail.coupon_type.full_amount,'0','Fen')}减${jine(checkDetail.coupon_type.reduce_amount,'0','Fen')}`}></Label> : ''
                                }
                                
                            </Col>
                            <Col span={24}>
                                <Label title="优惠券数量" text={checkDetail.count}></Label>
                            </Col>
                            <Col span={24} style={{marginBottom:0}}>
                                {
                                    Object.keys(checkDetail).length ?   <Label title="有效期" text={`${checkDetail.begin_at.substring(0,16)}~${checkDetail.end_at.substring(0,16)}`}></Label> : ''
                                }
                                
                            </Col>
                        </Row>
                        <div className={styles.boxTitle} style={{marginTop:24}}>
                            <span className={styles.boxTitleIcon}></span>
                            <span className='hz-margin-small-left'>领取规则</span>
                        </div>
                        <Row className={styles.dataItem}>
                            <Col span={24}>
                                <Label title="每人领取次数" text={checkDetail.available_times ? checkDetail.available_times : '不限'}></Label>
                            </Col>
                        </Row>
                        <div className={styles.boxTitle} style={{marginTop:24}}>
                            <span className={styles.boxTitleIcon}></span>
                            <span className='hz-margin-small-left'>可用商品</span>
                        </div>
                        <Row className={styles.dataItem}>
                            <Col span={24}>
                                <Label title="可用商品" text={checkDetail.goods_relation === 1  ? '全部商品' : '指定商品'}></Label>
                            </Col>
                        </Row>
                        {
                            checkDetail.goods_relation === 2 ? <div style={{overflow:'hidden'}}>
                                <Table
                                    columns={columns_modal}
                                    dataSource={getgoodsList}
                                    loading={getgoodsList_loading}
                                    pagination={false}
                                    rowKey='id'
                                    scroll={{ y: 300 }}
                                />
                                {
                                    getgoodsList && getgoodsList.length ? <Pagination
                                        className="ant-table-pagination"
                                        size="small"
                                        current={currentPage}
                                        total={getgoodsList_total}
                                        showTotal={(total) => `共 ${total} 条`} 
                                        showQuickJumper={true} 
                                        showSizeChanger={true}  
                                        pageSize={currentPageSize} 
                                        pageSizeOptions= {['10', '20', '50', '100']}
                                        onShowSizeChange={this.handleChangeSize}
                                        onChange={this.goToPage} />
                                        : ''
                                }
                                
                            </div> : '' 
                        }
                    </Modal>
                </Page>
                
            </DocumentTitle> 
        )
    }
}
