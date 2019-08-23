import React, {Component, Fragment} from 'react'
import Page, { DEFAULT_PAGER, DEFAULT_PAGER_FILTER } from '../../../../components/business/Page'
import documentTitleDecorator from 'hoc/documentTitle'
import { Button, Icon, Form, Row, Col, Input, DatePicker, Table, InputNumber, Pagination, Badge, Cascader,Modal,Upload,message } from 'antd'
import { connect } from 'dva'
import numeral from 'numeral'
import styles from './index.less'
import { SHOP_TYPE } from '../../../../common/shopConf'
import {datetime} from '../../../../utils/display'
import moment from 'moment'
import DownloadSvg from '../../../../assets/font_icons/upload.svg'

const { RangePicker } = DatePicker
const warnIcon = require('../../assets/images/icon_attention@2x.png')
const formModalLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 },
        style:{
            paddingLeft: 10
        }
    },
}


const DEFAULT_CONDITION = {
    type: '',
    shop_id: '',
    outer_number: '',
    name: '',
    begin_price: '',
    end_price: '',
    modified_begin_at: '',
    modified_end_at: ''
}

@documentTitleDecorator()
@Form.create()
@connect(({ setting_shop_goods, setting_ordersImport,base }) => ({
    setting_shop_goods, setting_ordersImport,base
}))
export default class extends Page.ListPureComponent {
    state = {
        loading: true,
        condition: { ...DEFAULT_CONDITION },
        pager: { ...DEFAULT_PAGER },
        importVisible:false,
        confirmLoading:false,
    }

    initPage = (isSetHistory = false) => {
        const condition = this.getParamForObject(DEFAULT_CONDITION, this.props.location.query)
        const pager = this.getParamForObject(DEFAULT_PAGER, this.props.location.query, DEFAULT_PAGER_FILTER)
        this.getPageData(condition, pager, isSetHistory)

        this.props.dispatch({
            type: 'setting_shop_goods/getShopListOauth',
        })

        const {
            outer_number,
            name,
            begin_price,
            end_price,
            modified_begin_at,
            modified_end_at,
            type,
            shop_id
        } = condition
        this.props.form.setFieldsValue({
            'merchantInput': outer_number,
            'priceInputLow': begin_price,
            'priceInputHigh': end_price,
            'rangePicker': modified_begin_at && modified_end_at ? [moment(modified_begin_at), moment(modified_end_at)] : [],
            'goodsnameInput': name,
            'platformCas': type ? [parseFloat(type),shop_id ? parseFloat(shop_id) : ''] : ''
        })
        this.getShopList()
        this.getImportGoods()
    }
    getShopList = () =>{
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
            type: 'setting_shop_goods/getGoodsList',
            payload: {
                limit: pager.pageSize,
                offset: (pager.current - 1) * pager.pageSize,
                type: condition.type,
                shop_id: condition.shop_id,
                outer_number: condition.outer_number,
                name: condition.name,
                begin_price: condition.begin_price ? condition.begin_price * 100 : '',
                end_price: condition.end_price ? condition.end_price * 100 : '',
                modified_begin_at: condition.modified_begin_at,
                modified_end_at: condition.modified_end_at
            },
            callback: (data) => {
                this.setState({
                    loading: false
                })

                callback && callback(data)
            }
        })
    }

    /**根据搜索条件搜索数据 */
    searchData = () => {
        this.props.form.validateFields((error, value) => {
            if (error) return
            let beginAt = '', endAt = ''

            if (value.rangePicker && value.rangePicker.length !== 0) {
                beginAt = value.rangePicker[0].format('YYYY-MM-DD')
                endAt = value.rangePicker[1].format('YYYY-MM-DD')
            }

            const condition = {
                ...this.state.condition,
                ...{
                    name: value.goodsnameInput,
                    type: value.platformCas && value.platformCas.length > 0 ? value.platformCas[0] : '',
                    shop_id: value.platformCas && value.platformCas.length > 0 ? value.platformCas[1] : '',
                    outer_number: value.merchantInput,
                    modified_end_at: endAt,
                    modified_begin_at: beginAt,
                    begin_price: value.priceInputLow,
                    end_price: value.priceInputHigh
                }
            }

            const pager = {
                pageSize: this.state.pager.pageSize,
                current: DEFAULT_PAGER.current
            }

            this.getPageData(condition, pager)
        })
    }

    /**表单验证 */

    priceLowValidator = (rules,value,callback) => {
        const form = this.props.form
        if (value && form.getFieldValue('priceInputHigh')) {
            form.validateFields(['priceInputHigh'], { force: true })
        }
        callback()
    }

    priceHighValidator = (rules, value, callback) => {
        const form = this.props.form
        const lowPrice = form.getFieldValue('priceInputLow')
        if (lowPrice !== undefined && value && value < lowPrice) {
            callback('不能小于初始商品价格')
        } else {
            callback()
        }
    }

    speceValidate = (rules, value, callback) => {
        if (value && /^[\s　]|[ ]$/.test(value)) {
            callback('请勿以空格开头或结束')
        }
        callback()
    }

    onSubmit = (e) => {
        e.preventDefault()

        this.searchData()
    }

    onReset = () => {
        this.props.form.resetFields()

        this.searchData()
    }
    importGoods = () =>{        
        this.setState({
            importVisible:true
        })
    }
    getImportGoods = () =>{
        this.props.dispatch({
            type:'setting_shop_goods/getImportList',
        })
    }
    handleOk = () =>{
        this.formContent.validateFields((err,values) =>{
            if(!err){
                const { shopDataOrder } = this.props.setting_ordersImport
                let name = shopDataOrder.filter(item=> item.id === values.shop_id)
                let type = name[0] && name[0].type === 2 ? '淘宝' : '天猫'
                Modal.confirm({
                    title:'确认导入',
                    content:`确认 "${values.fileName}" 商品报表导入${type}店铺 "${name[0] && name[0].name}" 吗？若导入错误，商品无法删除`,
                    okText: '确定',
                    cancelText: '取消',
                    onOk:()=>{
                        this.setState({
                            confirmLoading: true
                        })
                        this.props.dispatch({
                            type:'setting_shop_goods/importGoods',
                            payload:{
                                shop_id: values.shop_id,
                                file_name:values.fileName,
                                goods_file_url:values.goodsFileUrl
                            },
                            callback:(val) =>{
                                this.setState({
                                    confirmLoading: false,
                                    importVisible:false
                                })
                                if(!val.error){
                                    message.success(`导入成功！`)
                                    this.getImportGoods()
                                }
                            }
                        })
                    },
                    onCancel:()=> {
                    },
                })
               
            }
        })
    }
    
    handleCancel = () =>{
        this.setState({
            importVisible:false
        })
    }
    checkImportStatus = (status) =>{
        let txt = ''
        if(status === 1){
            txt = '导入中'
        }else if(status === 2){
            txt = '导入已完成'
        }else{
            txt = '导入失败'
        }
        return (<span>{txt}</span>)
    } 
    render () {
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
        const formLongItemLayout = {
            labelCol: {
                span: 6,
                style: {
                    width: '98px',
                    textAlign: 'right',
                },
            },
            wrapperCol: {
                span: 16,
            },
        }
        const columns = [
            {
                title: '类型',
                dataIndex: 'type',
                width: 100,
                render: (value, { shop }) => {
                    return <span>{shop && shop.type === 2 ? '淘宝' : '天猫'}</span>
                }
            },
            {
                title: '店铺',
                dataIndex: 'merchant',
                width: 200,
                render: (value, { shop }) => {
                    return <span>{shop && shop.name}</span>
                }
            },
            {
                title: '平台ID',
                width: 100,
                dataIndex: 'number'
            },
            {
                title: '主图',
                width: 150,
                dataIndex: 'pic_url',
                render: (value) => {
                    return <img src={value} alt='' className={styles.img}></img>
                }
            },
            {
                title: '商品名称',
                width: 300,
                dataIndex: 'name'
            },
            {
                title: '价格(元)',
                width: 100,
                dataIndex: 'price',
                align: 'right',
                render: (value) => {
                    return <span style={{ whiteSpace: 'nowrap' }}>{numeral(value / 100).format('0,0.00')}</span>
                }
            },
            {
                title: '商家编码',
                width: 100,
                dataIndex: 'outer_number'
            },
            {
                title: '商品修改时间',
                width: 200,
                dataIndex: 'modified_at',
                render: (value) => {
                    return value&&datetime(value)
                }
            },
            {
                title: '商品状态',
                width: 150,
                dataIndex: 'status',
                render: (value) => {
                    if (value === 1) {
                        return <Badge status='processing' text='在售' style={{ whiteSpace: 'nowrap' }}></Badge>
                    } else {
                        return <Badge status='default' text='已下架' style={{ whiteSpace: 'nowrap' }}></Badge>
                    }
                }
            },
        ]

        const { getFieldDecorator } = this.props.form
        const { current, pageSize } = this.state.pager
        const { list, totalCount, shops ,importGoodsList} = this.props.setting_shop_goods
        const {  photoToken,  shopDataOrder } = this.props.setting_ordersImport
        let type = []
        const arr = SHOP_TYPE.filter((item) => {
            return item.name === 'TaoBao' || item.name === 'TianMao'
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
        shops.forEach((val, key) => {
            type.forEach((v, k) => {
                if (val.type === v.value) {
                    v.children.push({
                        value: val.id,
                        label: val.name,
                    })
                }
            })
        })
        return (
            <Page>
                {/*头部面包屑*/}
                <Page.ContentHeader
                    title={this.props.documentTitle}
                    helpUrl="http://newhelp.51zan.cn/manual/content/%E8%90%A5%E9%94%80%E5%B9%B3%E5%8F%B0/%E5%95%86%E5%93%81%E6%8E%A8%E8%8D%90.md"
                    action={(
                        <div className={styles.alert}>
                            <div style={{marginBottom: 8}}>温馨提示：</div>
                            <div style={{marginBottom: 8}}>1. 受接口限制，店铺商品暂停自动同步，支持手动导入商品，已同步到系统的存量商品及导入的商品支持查看、推荐；</div>
                            <div>2. 手动导入商品时，请确认导入的商品报表与选择的店铺名称对应正确。</div>
                        </div>
                    )}
                />
                <Row type="flex" justify="start" align="middle" style={{marginBottom:16}}>
                    <Col>
                        <Button type='primary' onClick={this.importGoods} disabled={(importGoodsList && importGoodsList.status === 1) ? true : false}>手动导入商品</Button>
                        {
                            importGoodsList ? <span style={{marginLeft:8,color:'#9EA8B1',fontSize:12}}>{importGoodsList.file_name}文件{this.checkImportStatus(importGoodsList.status)}</span> : ''           
                        }   
                    </Col>
                </Row>
                {/*搜索条件框*/}
                <Page.ContentAdvSearch>
                    <Form onSubmit={this.onSubmit}>
                        <Row>
                            <Col span={8}>
                                <Form.Item label='店铺' {...formItemLayout}>
                                    {getFieldDecorator('platformCas',{})(
                                        <Cascader 
                                            placeholder='不限' 
                                            options={type} 
                                            popupClassName={styles.userCascader}
                                            getPopupContainer={triggerNode=>triggerNode.parentNode}
                                        ></Cascader>
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label='商品名称' {...formLongItemLayout}>
                                    {getFieldDecorator('goodsnameInput',{
                                        rules: [
                                            {
                                                validator: this.speceValidate
                                            }
                                        ]
                                    })(
                                        <Input placeholder='商品名称'/>
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label='商家编码' {...formItemLayout}>
                                    {getFieldDecorator('merchantInput', {
                                        rules: [
                                            {
                                                validator: this.speceValidate
                                            }
                                        ]
                                    })(
                                        <Input placeholder='商家编码' />
                                    )}
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={8}>
                                <Row>
                                    <Col span={6} style={{ 'width':' 70px','textAlign': 'right','lineHeight':'39px',color: '#333'}}>
                                        商品价格：
                                    </Col>
                                    <Col span={16}>
                                        <Row>
                                            <Col span={10}>
                                                <Form.Item>
                                                    {getFieldDecorator('priceInputLow',{
                                                        rules: [
                                                            {
                                                                validator: this.priceLowValidator
                                                            }
                                                        ]
                                                    })(
                                                        <InputNumber
                                                            min={0}
                                                            formatter={value => `￥${value}`}
                                                            parser={value => value.replace('￥', '')}
                                                            style={{width: '100%'}}
                                                        />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            <Col span={4} style={{'textAlign':'center','lineHeight':'39px'}}>至</Col>
                                            <Col span={10}>
                                                <Form.Item>
                                                    {getFieldDecorator('priceInputHigh',{
                                                        rules: [
                                                            {
                                                                validator: this.priceHighValidator
                                                            }
                                                        ]
                                                    })(
                                                        <InputNumber
                                                            min={0}
                                                            formatter={value => `￥${value}`}
                                                            parser={value => value.replace('￥', '')}
                                                            style={{width: '100%'}}
                                                        />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </Col>
                            <Col span={8}>
                                <Form.Item label='商品修改时间' {...formLongItemLayout}>
                                    {getFieldDecorator('rangePicker',{})(
                                        <RangePicker
                                            format="YYYY-MM-DD"
                                            style={{width: '100%'}}
                                        />
                                    )}
                                </Form.Item>
                            </Col>
                        </Row>
                        <Button type='primary' style={{marginLeft: '70px'}} htmlType='submit'>
                            <Icon type="search"/>
                            搜索
                        </Button>
                        <Button style={{marginLeft: '20px'}} onClick={this.onReset}>重置</Button>
                    </Form>
                </Page.ContentAdvSearch>
                {/*表格数据*/}
                <Table
                    columns={columns}
                    pagination={false}
                    dataSource={list}
                    loading={this.state.loading}
                    rowKey='id'
                />
                {totalCount > 0 && <Pagination 
                    className="ant-table-pagination"
                    current={current}
                    total={totalCount}
                    showTotal={(total) => `共 ${total} 条`} 
                    showQuickJumper={true} 
                    showSizeChanger={true}  
                    pageSize={pageSize} 
                    pageSizeOptions= {['10', '20', '50', '100']}
                    onShowSizeChange={this.handleListPageChangeSize}
                    onChange={this.handleListPageChange}
                />}
                <Modal
                    width={480}
                    title="手动导入商品"
                    visible={this.state.importVisible}
                    cancelText="取消"
                    okText='导入'
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    confirmLoading= { this.state.confirmLoading }
                    maskClosable={false}
                    destroyOnClose
                >
                    <FormComponent 
                        photoToken={photoToken} 
                        shopDataOrder={shopDataOrder}
                        changeFileName = {this.changeFileName}
                        ref={node => this.formContent = node}
                        shopChange={this.shopChange}
                    ></FormComponent>
                </Modal>
            </Page>
        )
    }
}

class FormContent extends Component{
    constructor(props){
        super(props)
        this.state={
            goodsFileList:[],
        }
    }
    componentDidMount(){
        this.props.form.setFieldsValue({
            'shop_id': '',
        })    
       
    }  


    orderChange=(info) => {
        let fileList = info.fileList.slice(-1)
        this.setState({
            goodsFileList: fileList
        })
        if (info.file.status === 'done') {
            message.success(`${info.file.name} 上传成功`)
            this.props.form.setFieldsValue({
                goodsFileUrl: info.file.response.key,
                fileName: info.file.name
            }) 
        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} 上传失败`)
            this.props.form.setFieldsValue({
                goodsFileUrl: ''
            }) 
        }
    }
    removeOrder = (file)=>{
        this.props.form.setFieldsValue({
            goodsFileUrl: '',
            fileName: '',
        })
    }
    shopChange = (val) =>{
        this.props.form.setFieldsValue({
            'shop_id': val[1],
            'goodsFileUrl': '',
            'fileName': '',
        })
        this.setState({
            goodsFileList: []
        })
        
        
    }
    validatorGood =  (rule, value, callback)=>{
        const data = this.state.goodsFileList
        if(data.length === 0){
            callback('请导入商品报表！')
            return
        }
        callback()
    }
    render(){
        const { getFieldDecorator } = this.props.form
        const {goodsFileList} = this.state
        const  uploadProps = {
            name: 'file',
            accept:'.csv',
            action: '//upload.qiniup.com/',
            headers: {
                authorization: 'authorization-text',
            },
            data: {
                token: this.props.photoToken,
            },
            beforeUpload: (file, fileList)=>{
                // 当上传的问题的类型为空的时候，判断文件后缀是否为csv
                let isCSV
                if(file.type){
                    isCSV = file.type === 'application/vnd.ms-excel' || file.type === 'text/csv'
                }else{
                    let name = file.name
                    const arr = name.split('.')
                    isCSV = arr.length>1 && arr[arr.length-1].toLowerCase() === 'csv'
                }
                if (!isCSV) {
                    message.error('文件限制.csv!')
                    fileList.pop()
                }
                const isLt100M = file.size / 1024 / 1024 < 100
                if (!isLt100M) {
                    message.error('大小限制100MB!')
                    fileList.pop()
                }
                return isCSV && isLt100M
            },
        }
        const shopDataOrder = this.props.shopDataOrder
        let type = []
        // 显示淘宝天猫类型的店铺的导入
        const arr =SHOP_TYPE.filter((item) => { 
            return item.name === 'TaoBao' || item.name === 'TianMao'
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
        return(
            <Fragment>
                <Form className="hz-from-edit hz-from-label-left">
                    <Form.Item label='选择店铺' {...formModalLayout} required= {true}>
                        {getFieldDecorator('shop_id',{
                            rules: [{required: true, message: '请选择店铺！' }],
                            // rules: [{ validator: this.validatorShops }],
                        })(
                            <div>
                                <Cascader placeholder='选择店铺' options={type} onChange={this.shopChange}></Cascader>
                            </div>
                            
                        )}
                    </Form.Item>
                    <Form.Item label="订单名称" {...formModalLayout} style={{display: 'none'}}>
                        {getFieldDecorator('fileName',{
                        })(
                            <div title="" style={{width: 180 }}>
                                <Input></Input>
                            </div>
                        )}
                    </Form.Item>
                    <Form.Item label='商品报表' {...formModalLayout}  required= {true} 
                        style={{ alignContent:'flex-start',alignItems:'flex-start'}}
                    >
                        {getFieldDecorator('goodsFileUrl',{
                            rules: [{ validator: this.validatorGood }],
                        })(
                            <div>
                                <Upload 
                                    {...uploadProps}
                                    onChange={this.orderChange}
                                    onRemove={this.removeOrder} 
                                    fileList={goodsFileList}
                                >
                                    <Button style={{width:150}}>
                                        <Icon component={DownloadSvg} style={{ fontSize: '16px' }} />上传文件
                                    </Button>

                                </Upload>
                                
                            </div>
                        )}
                        <div style={{fontSize:12,color:'#9EA8B1',lineHeight:'22px'}}>只支持.csv格式，文件大小100MB以内</div>
                    </Form.Item>
                    
                </Form>
            </Fragment>
        )
    }
}

const FormComponent = Form.create()(FormContent)
