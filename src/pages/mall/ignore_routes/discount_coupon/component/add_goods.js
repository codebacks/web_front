/**
 **@Description:创建优惠券-添加商品
 **@author: yecuilin
 */
import React,{ Component } from 'react'
import Page from '@/components/business/Page'
import {connect} from 'dva'
import { Form, Input, Row, Col, Pagination, Button, Icon, Modal, Table, Badge ,Tooltip} from 'antd'
import { getImageAbsoulteUrl } from '../../../../../utils/resource'
import styles from '../index.less'
import _ from 'lodash'
import numeral from 'numeral'
@Form.create()
@connect(({ mall_discount_coupon, base }) => ({
    mall_discount_coupon,
    base,
}))

export default class Goods extends Component {
    /**
     * @param {arr} deliveryGoodsList 父组件传递给子组件的已选择的商品
     * @param {arr} displayGoodsdList 子组件渲染父组件已选择的商品
     * @param {arr} selectedRowKeys 已选择的商品id集合
     * @param {arr} goodsPagerAddUp 点击分页时 所有请求接口商品的集合
     */
    constructor(props) {
        super(props)
        this.state = {
            offset: 1,
            limit: 10,
            goodsName:"",
            selectedRowKeys:[],
            deliveryGoodsList:[],
            // displayGoodsdList:[],
            goodsPagerAddUp:[],
        }
    }
    componentDidMount(){
        const {visible,deliveryGoodsList} = this.props
        if(visible){
            this.getGoodsList(this.state.offset, this.state.limit)
        }
        if(deliveryGoodsList){
            this.setState({
                // displayGoodsdList:deliveryGoodsList,
                selectedRowKeys:deliveryGoodsList.map(item =>item.id)
            })
        }
        
        
    }
    getGoodsList = (offset,limit) =>{
        const {goodsPagerAddUp} = this.state
        this.props.dispatch({
            type:'mall_discount_coupon/goods',
            payload:{
                page: offset -1,
                per_page: limit,
                goods_name:this.state.goodsName,  // 商品名称
                source:'coupon'
            },
            callback:(data) =>{
                if(data && data.length){
                    const flag = goodsPagerAddUp.some((item, i) => goodsPagerAddUp[i].id === data[0].id)
                    if(!flag){
                        this.setState({
                            goodsPagerAddUp:goodsPagerAddUp.concat(data)
                        })
                    }
                }else{
                    this.setState({
                        goodsPagerAddUp:data
                    })
                }
            }
        })

    }
    handleCancel = () =>{
        this.props.form.resetFields()
        const { onClose } = this.props
        onClose && onClose()
    }
    // 点击确定
    handleOk= () =>{
        const { selectedRowKeys , goodsPagerAddUp} = this.state
        // const {deliveryGoodsList} = this.props
        let total = [] 
        goodsPagerAddUp.forEach((item,idx) =>{
            selectedRowKeys.forEach((v,i) =>{
                if(item.id === v){
                    total.push(goodsPagerAddUp[idx])
                }
            })
        })
        // console.log(selectedRowKeys,total)
        // let filterArr = _.uniqBy([].concat(total,deliveryGoodsList),'id')
        // this.setState({
        //     deliveryGoodsList:filterArr
        // })
        // console.log(filterArr)
        this.props.onOk && this.props.onOk(total)
    }
    // 点击pageSize
    handleChangeSize = (offset, limit) => {
        this.setState({
            offset: offset,
            limit: limit
        }, () => {
            this.getGoodsList(offset, limit)
        })
    }
    // 点击分页
    changeTablePage = (offset, key) => {
        this.setState({
            offset: offset
        }, () => {
            this.getGoodsList(offset, this.state.limit)
        })
    }
    // 搜索
    searchSubmitHandle = () =>{
        this.props.form.validateFields((err,values) =>{
            let name = values.name || ''
            this.setState({
                goodsName:name,
                offset:1
            },() =>{
                this.getGoodsList(this.state.offset, this.state.limit)
            })
        })
    }
    // 点击多选框
    onSelectChange = (selectedRowKeys) => {
        this.setState({ selectedRowKeys })
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
    render(){
        const { selectedRowKeys ,offset ,limit } = this.state
        const { visible } = this.props
        const FormItem = Form.Item
        const {getFieldDecorator} = this.props.form
        const {goodsList,goods_rows_found} = this.props.mall_discount_coupon
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
                                <div>{record.goods.name}</div>
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

            },
            {
                title: '状态',
                dataIndex: 'status',
                width:120,
                render:(value,{goods})=>{
                    if(goods.status === 1 ){
                        return <Badge status="success" text="上架中" />
                    }else{
                        return <Badge status="default" text="已下架" />
                    }
                }
            }
            
        ]
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
        }
        return (
            <Modal
                title="选择商品"
                visible={visible}
                width={900}
                onCancel={this.handleCancel}
                onOk={this.handleOk}
            >
                <Page.ContentAdvSearch multiple={false}>
                    <Form layout="horizontal" className="hz-from-search">
                        <Row>
                            <Col span={15}>
                                <FormItem label="商品名称" {...formItemLayout}>
                                    {getFieldDecorator('name', {})(
                                        <Input placeholder='请输入商品名称' />
                                    )}
                                </FormItem>
                            </Col>
                            <Col>
                                <FormItem>
                                    <Button className="hz-btn-width-default" type="primary" htmlType="submit" onClick={this.searchSubmitHandle}>
                                        <Icon type="search" />
                                        搜索
                                    </Button>
                                </FormItem>
                            </Col>
                        </Row>
                    </Form>
                </Page.ContentAdvSearch>
                <div className={styles.choseNumWrap}>已选择<span className={styles.choseNum}>{selectedRowKeys.length > 0 ? selectedRowKeys.length : 0}</span>款商品</div>
                <Table
                    columns={columns}
                    dataSource={goodsList}
                    pagination={false}
                    rowSelection={rowSelection}
                    scroll={{ y: 400 }}
                    rowKey="id"
                />
                {
                    goodsList && goodsList.length > 0 ?
                        <Pagination
                            size="small"
                            style={{ float: 'none', textAlign: 'right' }}
                            className="ant-table-pagination"
                            showQuickJumper
                            total={goods_rows_found}
                            current={offset}
                            showTotal={(rows_found) => `共 ${rows_found} 条`}
                            pageSize={limit}
                            onShowSizeChange={this.handleChangeSize}
                            onChange={this.changeTablePage}
                        />
                        : ''
                }
            </Modal>
        )
    }
}
