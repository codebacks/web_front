'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [吴明]
 * 创建日期: 16/12/27
 */
import React from 'react'
import {connect} from 'dva'
import Page, { DEFAULT_PAGER , DEFAULT_PAGER_FILTER} from '../../../../components/business/Page'
import {Table, Pagination, Form, Row,Modal,Cascader, DatePicker,Upload, Popover, message, Tabs, Select, Col, Input, Button,InputNumber, Icon} from 'antd'
import documentTitleDecorator from 'hoc/documentTitle'
import 'moment/locale/zh-cn'
import moment from 'moment'
import styles from './index.less'
import {Link} from 'dva/router'
import { SHOP_TYPE, getMappingPlatformByType, getMappingFromByType, getMappingDecByOri } from '../../../../common/shopConf'
import config from 'crm/common/config'
import { stringify } from 'qs'
import router from 'umi/router'

moment.locale('zh-cn')
const {pageSizeOptions} = config

const DEFAULT_CONDITION = {
    is_wechat_binded:'0',
    begin_time:'',
    keyword:'',
    end_time:'' ,
    remark_include:'',
    order_amount_begin:'',
    order_amount_end:'',
    average_amount_begin:'',
    average_amount_end:'',
    shop_id:'',
    type:'',
    platform_type:'',
    data_from:''
}


@connect(({ base, crm_customerPool }) => ({
    base, crm_customerPool
}))
@Form.create()

@documentTitleDecorator({
    title:'用户池'
})

export default class extends Page.ListPureComponent {
    constructor(props) {
        super()
        this.state = {
            text:'',
            visible:false,
            index:'',
            id:'',
            isUpload:false,
            condition: {...DEFAULT_CONDITION},
            pager: {...DEFAULT_PAGER}
        }
    }
    initPage = (isSetHistory = false) => {
        const condition = this.getParamForObject(DEFAULT_CONDITION, this.props.location.query)
        const pager = this.getParamForObject(DEFAULT_PAGER, this.props.location.query, DEFAULT_PAGER_FILTER)

        const { is_wechat_binded,
                keyword,
                remark_include,
                order_amount_begin,
                order_amount_end,
                average_amount_begin,
                average_amount_end,
                begin_time,
                end_time,
                shop_id,
                type
            } = condition
        this.getPageData(condition, pager, isSetHistory)
        if(type){
            this.props.form.setFieldsValue({
                'shop_id': [parseInt(type, 10), parseInt(shop_id, 10) || ''],
            })
        }
        this.props.form.setFieldsValue({
                'is_wechat_binded':is_wechat_binded,
                'keyword':keyword,
                'remark_include':remark_include,
                'order_amount_begin':order_amount_begin,
                'order_amount_end':order_amount_end,
                'average_amount_begin':average_amount_begin,
                'average_amount_end':average_amount_end,
                'rangePicker': begin_time && end_time ? [moment(begin_time),moment(end_time)] : [],
        })
    }
    getPageData = (condition, pager, isSetHistory = true,callback) => {
        if( isSetHistory ){
            this.history(condition, pager)
        }
        condition.platform_type = getMappingPlatformByType(condition.type) || ''
        condition.data_from= condition.type === 999 ? '1' : getMappingFromByType(condition.type) || ''
        this.setState({
            condition:{...condition} ,
            pager: pager,
            loading: true
        })
        this.props.dispatch({
            type: 'crm_customerPool/userPoolList',
            payload: {
                offset: (pager.current - 1)*pager.pageSize,
                limit: pager.pageSize,
                is_wechat_binded: condition.is_wechat_binded,
                begin_time: condition.begin_time,
                keyword: condition.keyword,
                end_time: condition.end_time ,
                remark_include: condition.remark_include,
                order_amount_begin: condition.order_amount_begin,
                order_amount_end: condition.order_amount_end,
                average_amount_begin: condition.average_amount_begin,
                average_amount_end: condition.average_amount_end,
                shop_id: condition.shop_id,
                type:condition.type,
                platform_type:condition.platform_type,
                data_from:condition.data_from
            },
            callback:()=>{
                
            }
        })
    }

    componentDidMount() {
        super.componentDidMount()
        this.getShops()
        this.props.dispatch({
            type: 'crm_customerPool/getUploadToken',
            payload: {
                type:'document'
            }
        })
    }
    handleSearch = (e) => {
        if(e){
            e.preventDefault()
        }
        this.props.form.validateFields((err, value) => {
            if(!err){
                let begin_time = '', end_time = '', shop_id='',type=''
                if (value.rangePicker && value.rangePicker.length !== 0) {
                    begin_time = value.rangePicker[0].format('YYYY-MM-DD')
                    end_time = value.rangePicker[1].format('YYYY-MM-DD')
                }
                if(value.shop_id){
                    shop_id = value.shop_id[1]
                    type = value.shop_id[0]
                }
                const condition = {
                    ...this.state.condition,
                    ...{    
                        begin_time: begin_time,
                        keyword: value.keyword,
                        end_time: end_time ,
                        remark_include: value.remark_include,
                        order_amount_begin: value.order_amount_begin,
                        order_amount_end: value.order_amount_end,
                        average_amount_begin: value.average_amount_begin,
                        average_amount_end: value.average_amount_end,
                        shop_id:shop_id,
                        type:type
                    }
                }

                const pager = {
                    pageSize : this.state.pager.pageSize,
                    current : DEFAULT_PAGER.current
                }
                
                this.getPageData(condition, pager)
            }
        })   
    }
    getShops = () => {
        this.props.dispatch({
            type: 'crm_customerPool/getShops'
        })
    }
    handleChangeTabs = (e) =>{
        let {condition, pager} = this.state
        condition.is_wechat_binded = e.toString() || '0'

        pager.current = DEFAULT_PAGER.current
        this.getPageData(condition, pager)

    }
    editRemark = (e) =>{
        this.setState({
            text:e.target.value
        })  
    }
    cancelEdit = () =>{
        this.setState({
            visible:false
        })  
    }
    confirmEdit = () =>{
        const {dispatch} = this.props
        dispatch({
            type:'crm_customerPool/editRemark',
            payload:{
                id:this.state.id,
                remark:this.state.text
            },
            callback:()=>{
                const {detailList} = this.props.crm_customerPool
                const {index} = this.state
                detailList[index].remark = this.state.text
                dispatch({
                    type:'crm_customerPool/setProperty',
                    payload:{
                        detailList:detailList
                    }
                })
                this.setState({
                    visible:false
                })     
            }
        })
    }
    handleReset = () =>{
        this.props.form.resetFields()
        this.handleSearch()
    }
    editClick = (record,index) => {
        this.setState({
            text:record.remark,
            visible:true,
            id:record.id,
            index:index
        })
    }
    orderAmountBegin =  (rule, value, callback) => {
        const form = this.props.form
        if(value && value>99999999){
            callback('金额最大数是99999999')
        }else if (value &&(/^(\d{1,8}\.\d{3,})$/.test(value))){
            callback('请输入2位小数')
        }else if(value && form.getFieldValue('order_amount_end')){
            form.validateFields(['order_amount_end'], { force: true });
        }
        callback()
    }
    orderAmountEnd =  (rule, value, callback) => {
        const form = this.props.form
        if(value < (form.getFieldValue('order_amount_begin')-0) && form.getFieldValue('order_amount_begin')){
            callback('不能小于初始订单总额')
        }else if(value && value>99999999){
            callback('金额最大数是99999999')
        }else if(value && (/^(\d{1,8}\.\d{3,})$/.test(value))){
            callback('请输入2位小数')
        }else{
            callback()
        }
    }
    averageBegin = (rule, value, callback) => {
        const form = this.props.form
        if(value && value>99999999){
            callback('金额最大数是99999999')
        }else if ( value && (/^(\d{1,8}\.\d{3,})$/.test(value))){
            callback('请输入2位小数')
        }
        else if(value && form.getFieldValue('average_amount_end')){
            form.validateFields(['average_amount_end'], { force: true });
        }
        callback()
    }
    averageEnd = (rule, value, callback) => {
        const form = this.props.form
        if(value < (form.getFieldValue('average_amount_begin') -0)  && form.getFieldValue('average_amount_begin')){
            callback('不能小于初始平均单价')
        }else if(value && value>99999999){
            callback('金额最大数是99999999')
        }else if(value &&(/^(\d{1,8}\.\d{3,})$/.test(value))){
            callback('请输入2位小数')
        }else{
            callback()
        }
    }
    sendMessage = ()=>{
        const { condition } = this.state
        this.props.dispatch({
            type: 'crm_customerPool/filterUserPool',
            payload: {
                is_wechat_binded: condition.is_wechat_binded,
                begin_time: condition.begin_time,
                end_time: condition.end_time ,
                remark_include: condition.remark_include,
                order_amount_begin: condition.order_amount_begin,
                order_amount_end: condition.order_amount_end,
                average_amount_begin: condition.average_amount_begin,
                average_amount_end: condition.average_amount_end,
                shop_id: condition.shop_id,
                type:condition.type,
                platform_type:condition.platform_type,
                data_from:condition.data_from
            },
            callback:(value)=>{
                if(value.unique_mobile_count>0){
                    this.getParams({...condition,steps:1,come_from:'userpool'})
                }else{
                    Modal.error({
                        title: '提示',
                        content: '本次共选中0位用户，无法发送短信',
                        okText:'确定'
                    });
                }
                
            }
        })
    }
    getParams = (condition,filter) => {
        const params = stringify({
            ...condition,
        }, {
            filter: (prefix, value) => {
                const itemFilter = filter? filter[prefix] : null

                if(itemFilter) {
                    return itemFilter(value)
                }

                if(value === ''){
                    return
                }
                return value
            }
        })
        router.push(`/crm/hand_send?${params}`)
    }
    render() {
        const { RangePicker } = DatePicker
        const TabPane = Tabs.TabPane
        const FormItem = Form.Item
        const Option = Select.Option
        const { TextArea } = Input
        const { getFieldDecorator } = this.props.form
        const formItemLayout = {
            labelCol: {
                span: 6,
                style: {
                    width: '70px',
                    textAlign: 'right'
                },
            },
            wrapperCol: {
                span: 16,
            },
        }
        const data = this.props.crm_customerPool.shops
        let type = []
        const arr =SHOP_TYPE.filter((item) => { 
            return  item.name !== 'Mendian'
        })
        // 导入数据
        arr.push({
            value:999,
            type:'导入'
        })
        arr.forEach((item, index) => { 
            type.push({
                value: item.value,
                label: item.type,
                children: [{
                    value:'',
                    label:'不限'
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
        const {isUpload} = this.state
        const { current, pageSize } = this.state.pager
        const {params, detailList, total, loading,uploadToken} = this.props.crm_customerPool
        const columns = [
            {
                title: '姓名',
                className: 'hz-table-column-width-80',
                dataIndex: 'name'
            },
            {
                title: '手机号',
                className: 'hz-table-column-width-130',
                dataIndex: 'phone',
            },
            {
                title: '购物账号',
                className: 'hz-table-column-width-140',
                dataIndex: 'buyer_username',
            },
            {
                title: '所属店铺',
                className: 'hz-table-column-width-100',
                dataIndex: 'shop_name',
            },
            {
                title: '微信加粉',
                className: 'hz-table-column-width-100',
                dataIndex: 'is_wechat_binded',
                render: (text, record, index) => {
                    return  text ==1 ? <div className={styles.yes}>已加粉</div>:<div className={styles.no}>未加粉</div>
                }   
            },
            {
                title: '用户来源',
                className: 'hz-table-column-width-100',
                dataIndex: 'data_from',
                render: (text, record, index) => {
                    if(text == 1){
                        return <div>导入</div>
                    }else{
                        let tex = getMappingDecByOri(text) || ''
                        return <div>{tex}</div>
                    }
                } 
            },
            {
                title: '创建时间',
                className: 'hz-table-column-width-160',
                dataIndex: 'created_at',
            },
            {
                title: '订单总量',
                className: 'hz-table-column-width-80',
                dataIndex: 'order_count',
            },
            {
                title: '订单总额（￥）',
                className: 'hz-table-column-width-80',
                dataIndex: 'amount',
                render: (text,record,index) => {
                    return <div>{(text/100).toFixed(2)}</div>
                }
            },
            {
                title: '平均单价（￥）',
                className: 'hz-table-column-width-80',
                dataIndex: 'average_amount',
                render: (text,record,index) => {
                    return <div>{(text/100).toFixed(2)}</div>
                }
            },
            {
                title: '最后更新时间',
                className: 'hz-table-column-width-120',
                dataIndex: 'updated_at',
            },
            {
                title: '短信发送数',
                className: 'hz-table-column-width-80',
                dataIndex: 'message_count',
            },
            {
                title: '加粉次数',
                className: 'hz-table-column-width-80',
                dataIndex: 'add_fans_count',
            },
            {
                title: '最后加粉时间',
                className: 'hz-table-column-width-120',
                dataIndex: 'last_add_fans_at',
            },
            {
                title: '备注',
                dataIndex: 'remark',
                className: 'hz-table-column-width-100',
                render: (text, record, index) => {
                    return text? <p   onClick={()=>{this.editClick(record,index)}}  className={styles.edit}>{text}</p>:<a onClick={()=>{this.editClick(record,index)}}>设置备注</a>
                }
            },
        ]
        const action = (
            <div>
                用户池即所有潜在客户<br/>
                包括同步自各平台的用户数据、导入的自定义用户数据<br/>
                可根据条件筛选出高价值“潜在客户”加为微信好友
            </div>
        )
        const props = {
            name: 'file',
            action: '//upload.qiniup.com/',
            accept: 'Comma Separated Values',
            showUploadList:false,
            data: {
                token: uploadToken,
            },
            disabled: isUpload ? true : false,
            beforeUpload: (file) => {
                return new Promise(function (resolve, reject) {
                    const fileName = file.name
                    if(fileName.endsWith('.csv') ){
                        resolve(file)          
                    }else{
                        message.error('请导入正确格式的文档(.csv)')
                        reject(file)
                    }  
                })
            },
            onChange:(info)=>{
                if (info.file.status === 'uploading') {
                    this.setState({
                        isUpload:true
                    })
                }else if (info.file.status === 'done') {
                    this.props.dispatch({
                        type:'crm_customerPool/importData',
                        payload:{
                            url:info.file.response.key
                        },
                        callback:()=>{
                            this.setState({
                                isUpload:false
                            })
                            const condition = {
                                ...{
                                    is_wechat_binded:'0',
                                    begin_time:'',
                                    keyword:'',
                                    end_time:'' ,
                                    remark_include:'',
                                    order_amount_begin:'',
                                    order_amount_end:'',
                                    average_amount_begin:'',
                                    average_amount_end:'',
                                    shop_id:'',
                                    type:''
                                }
                            }
            
                            const pager = {
                                pageSize : 10,
                                current :1
                            }
                            
                            this.getPageData(condition, pager)
                            
                            message.success(`${info.file.name}导入成功`)
                        }
                    })
                } else if (info.file.status === 'error') {
                    this.setState({
                        isUpload:false
                    })
                    message.error(`${info.file.name}导入失败`)
                }
            }
          }
        return (
            <Page className={styles.formSearch}>
                <Page.ContentHeader
                    title="用户池"
                    titleHelp = {<Popover placement="bottomLeft" content={action}>
                        <Icon className="hz-text-primary hz-icon-size-default hz-icon-popover" type="question-circle-o"/>
                    </Popover>}
                    action={<Button type="primary" onClick={()=>{this.sendMessage()}}>批量发送短信</Button>}
                    helpUrl="http://newhelp.51zan.cn/manual/content/%E5%AE%A2%E6%88%B7%E7%AE%A1%E7%90%86/%E5%8A%A0%E7%B2%89.md"
                />
                <Page.ContentAdvSearch  hasGutter={false}>
                <Form layout="horizontal" className="hz-from-search"  className={styles.customerPool}  onSubmit={this.handleSearch} >
                        <Row>
                            <Col span={8}>
                                <FormItem label="所属店铺" {...formItemLayout}>
                                     {getFieldDecorator("shop_id",{})(
                                        <Cascader placeholder='选择店铺' options={type} popupClassName={styles.userCascader}></Cascader>
                                    )} 
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem label="关键字" {...formItemLayout}>
                                    {getFieldDecorator('keyword')(
                                        <Input placeholder="电话、姓名或购物账号"  maxLength={30}  />
                                    )}
                                    
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem label="创建日期" {...formItemLayout}>
                                    {getFieldDecorator('rangePicker')(
                                        <RangePicker style={{width:'100%'}}  />
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={8}>
                                <FormItem label="备注包含" {...formItemLayout}>
                                    {getFieldDecorator('remark_include')(
                                        <Input placeholder="请输入关键字"  maxLength={10}  />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <Row>
                                    <Col span={6} style={{    'width':' 70px','textAlign': 'right','lineHeight':'39px'}}>订单总额：</Col>
                                    <Col span={16}>
                                        <Row>
                                            <Col span={10}> 
                                                <FormItem >
                                                    {getFieldDecorator('order_amount_begin', {
                                                        rules: [{
                                                            validator: this.orderAmountBegin,
                                                        }],
                                                    })(
                                                        <InputNumber
                                                        min={0}
                                                        max={99999999}
                                                        formatter={value => `￥${value}`.substr(0,12)}
                                                        parser={value => value.replace('￥', '')}
                                                        />
                                                    )}
                                                </FormItem>
                                            </Col>
                                            <Col span={4} style={{'textAlign':'center','lineHeight':'39px'}}> 
                                                至
                                            </Col>
                                            <Col span={10}> 
                                                <FormItem>
                                                    {getFieldDecorator('order_amount_end', {
                                                        rules: [{
                                                            validator: this.orderAmountEnd,
                                                        }],
                                                    })(
                                                        <InputNumber
                                                        min={0}
                                                        max={99999999}
                                                        formatter={value => `￥${value}`.substr(0,12)}
                                                        parser={value => value.replace('￥', '')}
                                                        />
                                                    )}
                                            </FormItem>
                                            </Col>
                                        </Row> 
                                    </Col>
                                </Row>
                            </Col>
                            <Col span={8}>
                                <Row>
                                    <Col span={6} style={{    'width':' 70px','textAlign': 'right','lineHeight':'39px'}}>平均单价：</Col>
                                    <Col span={16}>
                                        <Row>
                                            <Col span={10}> 
                                                <FormItem>
                                                    {getFieldDecorator('average_amount_begin', {
                                                        rules: [{
                                                            validator: this.averageBegin,
                                                        }],
                                                    })(
                                                        <InputNumber
                                                        min={0}
                                                        max={99999999}
                                                        formatter={value => `￥${value}`.substr(0,12)}
                                                        parser={value => value.replace('￥', '')}
                                                        />
                                                    )}
                                                </FormItem>
                                            </Col>
                                            <Col span={4} style={{'textAlign':'center','lineHeight':'39px'}}> 
                                                至
                                            </Col>
                                            <Col span={10}> 
                                                <FormItem>
                                                    {getFieldDecorator('average_amount_end', {
                                                        rules: [ {
                                                            validator: this.averageEnd,
                                                        }],
                                                    })(
                                                        <InputNumber
                                                        min={0}
                                                        max={99999999}
                                                        formatter={value => `￥${value}`.substr(0,12)}
                                                        parser={value => value.replace('￥', '')}
                                                        />
                                                    )}
                                                </FormItem>
                                            </Col>
                                        </Row>              
                                    </Col>
                                </Row>                     
                            </Col>
                        </Row>
                        <Row>
                            <Col span={8}>
                                <Col span={3} style={{width: '70px'}}></Col>
                                <Col span={16}>
                                    <Button className="hz-btn-width-default" type="primary" htmlType="submit"  >
                                        <Icon type="search"/>
                                        搜索
                                    </Button>
                                    <Button className="hz-btn-width-default hz-margin-small-left" style={{marginLeft:'16px'}} onClick={this.handleReset}>
                                        重置
                                    </Button>
                                </Col>
                            </Col>
                        </Row>
                    </Form>
                </Page.ContentAdvSearch>
                <div className={styles.poolflex}>
                    <Tabs activeKey={params.is_wechat_binded}   onChange={this.handleChangeTabs}>
                        <TabPane tab="全部" key="0"></TabPane>
                        <TabPane tab="已加粉" key="1"></TabPane>
                        <TabPane tab="未加粉" key="2"></TabPane>  
                    </Tabs>
                    <div className={styles.import}>
                        <Upload {...props}>
                            <Button>
                                <Icon type={isUpload?'loading':'upload'} /> {isUpload?'导入中':'导入用户'}
                            </Button>
                        </Upload>
                        <a  className={styles.download} onClick={this.downLoadAccounts} href='https://document.51zan.com/userPoolTemplate.csv'>下载模板</a>
                        <Link to='/crm/customerpool/importRecord'>导入记录</Link>                        
                    </div>
                </div> 
                <div className={styles.poollist}>
                    <Table
                        columns={columns}
                        dataSource={detailList}
                        loading={loading}
                        scroll={{ x: 1900}}
                        rowKey={record => record.id}
                        pagination={false}
                    />
                    { total>0 ?  <Pagination
                        className="ant-table-pagination"
                        total={total}
                        current={current}
                        showQuickJumper={true}
                        pageSizeOptions={pageSizeOptions}
                        showTotal={total => `共${total}条`}
                        pageSize={pageSize}
                        showSizeChanger={true}
                        onShowSizeChange={this.handleListPageChangeSize}
                        onChange={this.handleListPageChange}
                    /> : ''
                    }
                </div>
                <Modal visible={this.state.visible}
                    title='修改备注'
                    onCancel={this.cancelEdit}
                    onOk={this.confirmEdit}
                    okText="确定"
                    cancelText="取消">
                    <Form >
                        <Row>
                            <Col span={24}>
                                <FormItem label="修改备注" {...formItemLayout}>
                                    <TextArea rows={6}  value={this.state.text} style={{'resize':'none'}}  maxLength={100} onChange={(e)=>{this.editRemark(e)}}/>
                                    <p style={{'textAlign':'right','marginBottom':'0'}}>{this.state.text?this.state.text.length+'/100':'0/100'}</p>
                                </FormItem>  
                            </Col>
                        </Row>
                    </Form>
                </Modal>
            </Page>
        )
    }
}
