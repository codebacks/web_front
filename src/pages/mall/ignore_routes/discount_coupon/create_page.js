/**
 **@Description:优惠券-创建优惠券
 **@author: yecuilin
 */
import React from 'react'
import DocumentTitle from 'react-document-title'
import Page from 'components/business/Page'
import { Form,Table ,Pagination, DatePicker, Radio, Row, Col, Button, InputNumber, Icon,Tooltip, message } from 'antd'
import router from 'umi/router'
import { connect } from 'dva'
import HzInput from '@/components/HzInput'
import styles from './index.less'
import classnames from 'classnames'
import moment from 'moment'
import AddGoods from './component/add_goods'
import { getImageAbsoulteUrl } from '../../../../utils/resource'
import _ from 'lodash'
import numeral from 'numeral'


@connect(({ mall_discount_coupon, base }) => ({
    mall_discount_coupon,
    base,
}))
@Form.create({})
export default class Create extends React.PureComponent {
    state = {
        addgoodsVisible:false,
        goodsKeyRandom:'',
        chooseGoodsList:[],
        selectedRowKeys:[],
        offset:1,
        limit:10,
        draw_time:1,  //领取次数 默认不限
        saveLoading:false,
    }
    componentDidMount(){
        
    }   

    chooseGoods = () =>{
        this.setState({
            addgoodsVisible:true,
            goodsKeyRandom:Math.random()
        })
    }
    addgoodsOk = (data) =>{
        this.setState({
            addgoodsVisible:false,
            chooseGoodsList:data
        }, () => {
            this.props.form.validateFields(['chooseGood'], { force: true })
        })
    }
    addgoodsClose = () =>{
        this.setState({
            addgoodsVisible:false,
        })
    }
    // 多选框
    onSelectChange = (selectedRowKeys) => {

        this.setState({ selectedRowKeys },()=>{
            console.log(this.state.selectedRowKeys)
        })
    }
    // 删除 选择的商品list
    deleteGoodsItem = (record,index) =>{
        const {selectedRowKeys,chooseGoodsList,offset,limit} = this.state
        const idx_new = (offset - 1) * limit + index
        let newArr = _.concat([],chooseGoodsList)
        let selectedRowKeysArr = _.concat([],selectedRowKeys)
        newArr.forEach((item) =>{
            if(item.id === record.id) {
                newArr.splice(idx_new,1)
            }
        })
        if(selectedRowKeysArr.length){
            selectedRowKeysArr.map((item) =>{
                if(item === record.id){
                    let idx = _.indexOf(selectedRowKeysArr,record.id)
                    selectedRowKeysArr.splice(idx,1)
                    this.setState({
                        selectedRowKeys:selectedRowKeysArr
                    })
                }
            }) 
        }
        this.setState({
            chooseGoodsList:newArr,
        },()=>{
            this.props.form.validateFields(['chooseGood'], { force: true })
        })
    }
    // 点击pageSize
    handleChangeSize = (offset, limit) => {
        this.setState({
            offset: offset,
            limit: limit
        })
    }
    // 点击分页
    changeTablePage = (offset, key) => {
        this.setState({
            offset: offset
        })
    }
    // 点击领取限制 - 领取次数
    handleDrawTimeChange = (e) =>{
        this.setState({
            draw_time:e.target.value
        },()=>{
            this.props.form.validateFields(['available_times'], { force: true })
        })
    }
    // 批量删除
    batchRemove = () =>{
        const {selectedRowKeys,chooseGoodsList} = this.state
        let newArr = _.concat([],chooseGoodsList)
        let selected_Key = []
        selectedRowKeys.map(item =>{
            selected_Key.push({
                id:item
            })
        })
        let remain_goodsList = _.pullAllBy(newArr,selected_Key,'id')
        this.setState({
            chooseGoodsList:remain_goodsList,
            offset:1,
            selectedRowKeys:[]
        },()=>{
            this.props.form.validateFields(['chooseGood'], { force: true })
        })
    }
    // 选择商品校验
    validateChooseBtn = (rule,value,callback) =>{
        const {getFieldValue} = this.props.form
        if(getFieldValue('goods_relation') === 2 && !this.state.chooseGoodsList.length){
            callback('请选择商品！')
            return
        }
        callback()
    }
    // 校验领取次数
    validateDrawtimeValue = (rule,value,callback) =>{
        const {draw_time} = this.state
        if(draw_time === 2){
            if(!value){
                callback('请输入领取次数！')
                return
            }
        }

        callback()
    }
    // 限制可以选择的时间
    disabledDate = (current) => {
        // 不能选择今天以后的日期
        return current && current < moment().subtract(1, 'days')
    }
    // 保存
    handleSubmit = (e) =>{
        this.props.form.validateFields((err,values) =>{
            if(!err){
                const createForm = {
                    title:values.title,
                    type:1,
                    full_amount:values.full_amount*100,
                    reduce_amount:values.reduce_amount*100,
                    count:values.count,
                    begin_at : values.rangePicker[0].format('YYYY-MM-DD HH:mm')+':00',
                    end_at : values.rangePicker[1].format('YYYY-MM-DD HH:mm')+':00',
                    available_times:this.state.draw_time === 1 ? 0 : values.available_times,
                    goods_relation:values.goods_relation
                }
                let goods_skus = []
                if(values.goods_relation === 2){
                    const {chooseGoodsList} = this.state
                    let arr = [].concat(chooseGoodsList)
                    arr.map(item => {
                        goods_skus.push({[item.goods_id]:item.id})
                    })
                }else{
                    goods_skus = []
                }
                let postData = {
                    ...createForm,
                    goods_skus:goods_skus
                }
                this.createSave(postData)
            }
        })
    }
    createSave = (data) =>{
        this.setState({
            saveLoading:true
        })
        this.props.dispatch({
            type:'mall_discount_coupon/createCoupon',
            payload:data,
            callback:(data) =>{
                this.setState({
                    saveLoading:false
                })
                if(data.data && data.meta.code === 200){
                    message.success('优惠券创建成功！')
                    router.push('/mall/discount_coupon')
                }
            }
            
        })
    }
    // 取消
    handleCreateCancel = () =>{
        router.push('/mall/discount_coupon')
    }
    showItemText = (text) =>{
        return (
            <div className={styles.itemTitle}>
                <span className={styles.titleBar}></span>
                <span className={styles.titleText}>{text}</span>
            </div>
        )
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
                // return <span className={`${styles.tag} ${styles.isRecommend}`}>推荐</span>
            default: 
                return ''
        }
    }
    formatterPromote = (value) => {
        const reg = /[^\d]/g
        if (typeof value === 'string' && (Number(value) >= 1 && Number(value) <= 100000)) {
            return !isNaN(Number(value)) ? value.replace(reg, '') : ''
        } else if ((typeof value === 'number') && (value >= 1 && value <= 100000)) {
            return !isNaN(value) ? String(value).replace(reg, '') : ''
        } else {
            return ''
        }
    }

    formatterAvailable = (value) =>{
        const reg = /[^\d]/g
        const {getFieldValue} = this.props.form
        let max = ''
        if(getFieldValue('count') && this.state.draw_time === 2){
            max = getFieldValue('count')
        }else{
            max = 100000
        }
        if (typeof value === 'string' && (Number(value) >= 1 && Number(value) <= max)) {
            return !isNaN(Number(value)) ? value.replace(reg, '') : ''
        } else if ((typeof value === 'number') && (value >= 1 && value <= max)) {
            return !isNaN(value) ? String(value).replace(reg, '') : ''
        } else {
            return ''
        }
    }
    formatterReduce = (value) =>{
        const reg = /[^\d]/g
        const {getFieldValue} = this.props.form
        let max = ''
        if(getFieldValue('full_amount')){
            max = getFieldValue('full_amount')
        }else{
            max = 100000
        }
        if (typeof value === 'string' && (Number(value) >= 1 && Number(value) <= max)) {
            return !isNaN(Number(value)) ? value.replace(reg, '') : ''
        } else if ((typeof value === 'number') && (value >= 1 && value <= max)) {
            return !isNaN(value) ? String(value).replace(reg, '') : ''
        } else {
            return ''
        }
    }
    render (){
        const { getFieldDecorator, getFieldValue } = this.props.form
        const { addgoodsVisible , chooseGoodsList,selectedRowKeys,offset,limit,saveLoading} = this.state
        const { RangePicker } = DatePicker
        const RadioGroup = Radio.Group
        const FormItem = Form.Item
        const formItemLayout = {
            labelCol: {
                span: 6,
                style: { width: '100px' }
            },
            wrapperCol: {
                span: 12
            }
        }
        const tableFormLayout = {
            labelCol: {span: 0},
            wrapperCol: {
                span: 24,
            },
        }
        const radioLimitStyle = {
            display: 'block',
            height: '30px',
            lineHeight: '39px',
        }
        const columns = [
            {
                title: '商品',
                dataIndex: 'goods',
                width: 280,
                render:(text,record) =>{
                    let string = this.showSpecs(record)
                    return (
                        <div className={styles.goodsInfoWrap}>
                            <div className={styles.goodsImgWrap}>
                                <img src={ record.cover_url ? getImageAbsoulteUrl(record.cover_url, { thumbnail: { width: 60, height: 60 } }) : ''} alt="" />
                            </div>
                            <div className={styles.goodsInfo}>
                                <Tooltip placement="top" title={record.goods.name} arrowPointAtCenter>
                                    <div className={styles.goodsName}>{record.goods.name}</div>
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
            },{
                title: '操作',
                width: 120,
                dataIndex: 'action',
                render:(text,record,index) =>{
                    return(
                        <a href="javascript:;" onClick={()=>this.deleteGoodsItem(record,index)}>删除</a>
                    )
                }
            }
        ]
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
        }
        const text = (<div>
            1. 因为系统商品默认为分销商品，分销提成以券后价格计算，会造成分销佣金减少。
            <br />
            2. 拼团、特价商品设置后是否影响利润，请根据自身情况设置。
        </div>) 
        return(
            <DocumentTitle title="创建优惠券">
                <Page>
                    <Page.ContentHeader
                        hasGutter={false}
                        breadcrumbData={[{
                            name: '优惠券',
                            path: '/mall/discount_coupon'
                        },{
                            name: '创建优惠券'
                        }]}
                    />
                    <Row>
                        <Col span={13} style={{paddingTop:16}}>
                            <Page.ContentDescription label='温馨提示：' text={text}/>
                            <Form>
                                {this.showItemText('基础设置')}
                                <div>
                                    <FormItem {...formItemLayout} label="优惠券名称">
                                        {getFieldDecorator('title', {
                                            rules: [
                                                { required: true, message:'请输入优惠券名称！' }]
                                        })(
                                            <HzInput placeholder="请输入优惠券名称" maxLength={12} style={{width:400}}/>
                                        )}
                                    </FormItem>
                                    <FormItem label="优惠内容" {...formItemLayout} required={true}>
                                        <div style={{ display: 'flex' }}>
                                            <span className='hz-margin-small-right'>满</span>
                                            <FormItem style={{ marginBottom: '0' }}>
                                                {getFieldDecorator('full_amount', {
                                                    rules:[
                                                        {required: true,message:'请输入金额！'} 
                                                    ]
                                                })(
                                                    <InputNumber
                                                        style={{width:161}}
                                                        formatter={this.formatterPromote}
                                                        parser={this.formatterPromote}
                                                        min={2} max={100000}
                                                        placeholder='2-100000'
                                                    />
                                                )}
                                            </FormItem>
                                            <span className='hz-margin-small-left-right' style={{ marginBottom: '0' }}>减</span>
                                            <FormItem style={{ marginBottom: '0' }}>
                                                {getFieldDecorator('reduce_amount', {
                                                    rules:[
                                                        {
                                                            required: true,message:'请输入金额！'
                                                        }
                                                    ]
                                                })(
                                                    <InputNumber
                                                        style={{width:161}}
                                                        formatter={this.formatterReduce}
                                                        parser={this.formatterReduce}
                                                        min={1} max={getFieldValue("full_amount") ? getFieldValue("full_amount")-1 : 99999}
                                                        placeholder={getFieldValue("full_amount") ? `1-${getFieldValue("full_amount")-1}` : '1-99999'}
                                                    />
                                                )}
                                            </FormItem>
                                            <span className='hz-margin-small-left' style={{ marginBottom: '0' }}>元</span>
                                        </div>
                                    </FormItem>
                                    <FormItem {...formItemLayout} label="有效期">
                                        {getFieldDecorator('rangePicker', {
                                            rules: [{
                                                required: true, message: '请选择有效期!',
                                            }],
                                        })(
                                            <RangePicker
                                                // showTime={{ format: 'HH:mm' }}
                                                showTime={{
                                                    hideDisabledOptions: true,
                                                    defaultValue: [moment('00:00', 'HH:mm'), moment('00:00', 'HH:mm')],
                                                }}
                                                format="YYYY-MM-DD HH:mm"
                                                placeholder={['起始时间', '结束时间']}
                                                disabledDate={this.disabledDate}
                                                style={{width:400}}
                                                className={styles.timeCheck}
                                            />
                                        )}
                                    </FormItem>
                                    <FormItem {...formItemLayout} label="优惠券数量">
                                        {getFieldDecorator('count', {
                                            rules:[
                                                {required: true, message: '请输入优惠券数量！'} 
                                            ]
                                        })(
                                            <InputNumber
                                                formatter={this.formatterPromote}
                                                parser={this.formatterPromote}
                                                min={1} max={100000}
                                                style={{width:161}}
                                                placeholder='1-100000'
                                            />
                                        )}
                                        <span className='hz-margin-small-left' style={{ marginBottom: '0' }}>张</span>
                                    </FormItem>
                                </div>
                                {this.showItemText('领取规则')}
                                <div>
                                    <FormItem {...formItemLayout} label="领取次数" required={true}>
                                        <RadioGroup onChange={this.handleDrawTimeChange} value={this.state.draw_time}>
                                            <Radio value={1} style={radioLimitStyle}>不限</Radio>
                                            <Radio style={radioLimitStyle} value={2} className={classnames("hz-margin-base-bottom", styles.radiolineformitem)}>
                                                <span className={styles.radiolineformitemcontain}>
                                                    <span>最多领取</span>
                                                    <span >
                                                        <FormItem>
                                                            {getFieldDecorator('available_times', {
                                                                rules: [
                                                                    { validator: this.validateDrawtimeValue }
                                                                ],
                                                            })(
                                                                <InputNumber formatter={this.formatterAvailable} parser={this.formatterAvailable} placeholder={getFieldValue('count') ? `1-${getFieldValue('count')}` : '1-100000'}  className='hz-margin-small-left-right' disabled={this.state.draw_time === 1 ? true : false} min={1} max={getFieldValue('count')} />
                                                            )}
                                                        </FormItem>
                                                    </span>
                                                    <span>次</span>
                                                    <span className={styles.availableTip}>不能超过优惠券数量</span>
                                                </span>
                                            </Radio>
                                        </RadioGroup>
                                    </FormItem>
                                </div>
                                {this.showItemText('可用商品')}
                                <div>
                                    <FormItem {...formItemLayout} label="可用商品">
                                        {getFieldDecorator('goods_relation', {
                                            rules:[
                                                {required: true} 
                                            ],
                                            initialValue:1
                                        })(
                                            <RadioGroup>
                                                <Radio value={1}>全部商品</Radio>
                                                <Radio value={2}>指定商品</Radio>
                                            </RadioGroup>
                                        )}
                                    </FormItem>
                                </div>
                                {
                                    getFieldValue('goods_relation') === 2 ? <div>
                                        <FormItem {...formItemLayout}
                                            style={{ display: 'flex' }}
                                            label="添加商品">
                                            {getFieldDecorator('chooseGood', {
                                                rules: [
                                                    { required: true, validator: this.validateChooseBtn }
                                                ]
                                            })(
                                                <Button type="primary" ghost onClick={() =>this.chooseGoods()}>
                                                    <Icon type="plus" /> 选择商品 </Button>
                                            )}
                                            <Button type="primary" ghost style={{marginLeft: '16px'}} onClick={() =>this.batchRemove()} disabled={selectedRowKeys.length ? false : true}>
                                                批量删除（<span style={{fontWeight:'bold'}}>{selectedRowKeys.length}</span>）
                                            </Button>

                                            
                                        </FormItem>
                                        {
                                            chooseGoodsList && chooseGoodsList.length ? <FormItem {...tableFormLayout}>
                                                <Table
                                                    columns={columns}
                                                    dataSource={chooseGoodsList.slice(limit * (offset - 1), limit * offset)}
                                                    pagination={false}
                                                    rowSelection={rowSelection}
                                                    rowKey="id"
                                                /> 
                                                <Pagination
                                                    size="small"
                                                    style={{ float: 'none', textAlign: 'right' }}
                                                    className="ant-table-pagination"
                                                    showQuickJumper
                                                    total={chooseGoodsList.length}
                                                    current={offset}
                                                    showTotal={(rows_found) => `共 ${rows_found} 条`}
                                                    pageSize={limit}
                                                    onShowSizeChange={this.handleChangeSize}
                                                    onChange={this.changeTablePage}
                                                />
                                            </FormItem>
                                                : ''

                                        }
                                    </div>
                                        : ''
                                }
                                
                                
                                <div className='hz-margin-base-bottom'>
                                    <Button type="primary" htmlType="submit" disabled={saveLoading} onClick={() => this.handleSubmit()} >保存</Button>
                                    <Button style={{ marginLeft: 16 }} onClick={() => this.handleCreateCancel()}>取消</Button>
                                </div>
                            </Form>
                        </Col>
                        <Col span={11}>
                            <div className={styles.phoneWrap}>
                                <div className={styles.phoneBgWrap}>
                                    {/* <div className={styles.discountBg}>
                                        <p className={styles.title}>优惠券</p>
                                        <div className={styles.ticketBg}>
                                            <Row type="flex" justify="space-between" align="middle" style={{height:'100%'}}>
                                                <Col>
                                                    <Row type="flex" justify="start" align="middle">
                                                        <div className={styles.shhowRmb}>￥<span className={styles.RMB}>10</span></div>
                                                        <div>
                                                            <p>双11优惠券</p>
                                                            <p>指定商品可用满128减10</p>
                                                        </div>
                                                    </Row>
                                                    <div>2019.1.21 00:00-2019.3.23 23:59</div>
                                                </Col>
                                                <Col style={{marginRight:6}}>
                                                    立即使用
                                                </Col>
                                            </Row>
                                        </div>                                        
                                    </div>
                                    <div className={styles.btn}>确定</div> */}
                                </div>
                                {/* <div className={styles.previewTxt}>小程序效果示例图</div> */}
                            </div>
                        </Col>
                    </Row>
                    <AddGoods
                        visible={addgoodsVisible}
                        onClose={this.addgoodsClose}
                        onOk={this.addgoodsOk}
                        key={this.state.goodsKeyRandom}
                        deliveryGoodsList={chooseGoodsList}
                    >

                    </AddGoods>
                </Page>
            </DocumentTitle>
        )
    }
}
