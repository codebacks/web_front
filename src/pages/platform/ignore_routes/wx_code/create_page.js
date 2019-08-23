/**
 **@Description:
 **@author: AmberYe
 */

import React, {Component} from 'react'
import {connect} from 'dva'
import { Row,Col,Button,Table,Form,Radio,Switch,Icon,Upload,message,Popover,Pagination,InputNumber ,Divider} from 'antd'
import HzInput from '@/components/HzInput'
import TextAreaCount from '@/components/TextAreaCount'
import styles from './index.scss'
import Page from 'components/business/Page'
import _ from 'lodash'
import {objToAntdForm} from 'platform/utils'
import documentTitleDecorator from 'hoc/documentTitle'
import baseConfig from 'config'
import WeChatSelectMulti from '@huzan/hz-wechat-select'
import '@huzan/hz-wechat-select/style/index'
import { parse } from 'qs'
import router from 'umi/router'
import config from 'platform/common/api/config'
import AdddefinedWx from './component/defined_qrcode'

const FormItem = Form.Item
const RadioGroup = Radio.Group
const transformArr = ['name', 'type', 'subject','description','status','wxAccountCopy','choseWxList','addChildQrcodeType','chosedefineWxList',{ name: 'status', convert(value){ return value === 1 }},{name:'wxAccountCopy',convert(value){ return value === 2 }}]
const {pageSizeOptions} = config
@connect(({platform_create,loading,base}) =>({
    platform_create,
    // tableLoading:loading.effects['platform_create/wxdetail'],
    base
}))
@Form.create({
    mapPropsToFields(props) {
        return objToAntdForm(_.get(props, 'platform_create.createForm', {}), transformArr)
    },
    onFieldsChange(props, field, fields) {
        props.dispatch({
            type: 'platform_create/setCreateForm',
            payload: field,
        })
    }
})
@documentTitleDecorator({
    title: '新码'
})
export default class Create_page extends Component {
    constructor(props) {
        super(props)
        this.state = {
            type:false,
            visible:false,
            choseWxList:[],
            newChoseWxList:[],
            token:'',
            totalList:[],
            bgImagePath:'',
            current: 1,
            limit: 10,
            currentShowNum:'',
            addtype:1,
            visible_definde:false,
            definedAddwx:[], // 自定义二维码集合
            hostname:'//image.51zan.com',
            current_define: 1,
            limit_define:10,
            qrcodeModalKeyRandom:0,
            definedWxFormInfo:{},
            tableLoading:false,
        }
    }
    componentDidMount(){
        const {query} = this.props.location
        if(query.id){
            this.setState({
                id:query.id
            },() =>{
                this.props.dispatch({
                    type:'platform_create/wxdetail',
                    payload:{
                        id:this.state.id
                    },
                    callback:() =>{
                        const {createForm} = this.props.platform_create
                        this.setState({
                            bgImagePath:createForm.bgImagePath,
                            addtype:createForm.addChildQrcodeType
                        })
                        console.log(this.props.form.getFieldValue('wxAccountCopy'),this.props.form.getFieldValue('status'))
                    }
                })
                this.getWxlistData(0)
            })
        }else{
            this.props.dispatch({
                type:'platform_create/resetCreateForm'
            })
            this.setState({
                choseWxList:[],
                bgImagePath:'',
                addtype:this.props.form.getFieldValue('addChildQrcodeType')
            })
        }
        this.setState({
            newChoseWxList:[],
            totalList:[],
            
        })
    }
    //获取微信号列表
    getWxlistData = (page) => {
        this.setState({
            tableLoading:true
        })
        let id
        if(this.state.id){
            id = this.state.id
        }else{
            id = 0
        }
        this.props.dispatch({
            type:'platform_create/getWxlistData',
            payload:{
                id:id,
                params: {
                    limit: 500,
                    offset:page
                }
            },
            callback:() =>{
                const {choseWxList,createForm} = this.props.platform_create
                if(createForm.addChildQrcodeType === 1){
                    this.setState({
                        totalList:choseWxList,
                        definedAddwx:[]
                    },() =>{
                        this.props.form.validateFields(['choseWxList'], { force: true })
                    })
                }else{
                    let max = choseWxList[0].id
                    for(var i = 0;i<choseWxList.length;i++){
                        if(max<choseWxList[i].id){
                            max = choseWxList[i].id
                        }
                    }
                    this.setState({
                        totalList:[],
                        definedAddwx:choseWxList,
                        qrcodeModalKeyRandom:max
                    },() =>{
                        this.props.form.validateFields(['chosedefineWxList'], { force: true })
                    })
                }
                this.setState({
                    tableLoading:false
                })
            }
        })


    }
    //点击确认
    handleSubmit = (e) => {
        e.preventDefault()
        const {getFieldValue} = this.props.form
        const {totalList,definedAddwx} = this.state
        this.props.form.validateFields((err, values) => {
            if (!err) {
                let createForm = parse(values)

                createForm = {...createForm,
                    id:this.state.id,
                    status: createForm.status ? 1: 2,
                    addChildQrcodeType:createForm.addChildQrcodeType,
                    qrcodeWechatInfos:createForm.addChildQrcodeType === 1 ? totalList : definedAddwx,
                    wxAccountCopy: (getFieldValue('type') === 2 && createForm.wxAccountCopy && getFieldValue('addChildQrcodeType') === 1) ? 2 : 1,
                    bgImagePath:getFieldValue('type') === 1 ? '' : this.state.bgImagePath,
                    subject:getFieldValue('type') === 1 ? this.props.form.getFieldValue('subject') : '',
                    description:getFieldValue('type') === 1 ? this.props.form.getFieldValue('description') : ''
                }
                if(getFieldValue('type') === 2 && !this.state.bgImagePath){
                    message.error('请上传自定义背景图片！')
                    return false
                }
                if(!this.state.totalList){
                    return false
                }
                if(this.state.id){
                    this.updateCreateForm(createForm)
                }else{
                    this.createWxcode(createForm)
                }
            }
        })
    }
    //点击取消
    cancleCreate = () => {
        router.push('/platform/wx_code')
    }
    //新建新码
    createWxcode = (data) =>{
        const {initData} = this.props.base
        this.props.dispatch({
            type:'platform_create/createWxcode',
            payload:{
                createForm:{
                    ...data,
                    productVersionId:initData.company.product_version.id
                }
            },
            callback:(data) =>{
                if(data.code === 200){
                    message.success('新码创建成功！')
                    router.push('/platform/wx_code')
                }
            }
        })
    }
    //编辑新码
    updateCreateForm = (data) =>{
        this.props.dispatch({
            type:'platform_create/updateCreateObj',
            payload:{
                createForm:data
            },
            callback:(data) =>{
                if(data.code === 200){
                    message.success('编辑新码成功！')
                    setTimeout(() => {
                        router.push('/platform/wx_code')
                    }, 100)
                }
            }
        })
    }
    //删除微信号
    deletConfirm = (data,idx) =>{
        const {totalList,current,limit} = this.state
        const idx_new = (current - 1) * limit + idx
        totalList.forEach((item) =>{
            if(item.id === data.id){
                totalList.splice(idx_new,1)
            }
        })
        this.setState({
            totalList:totalList
        },()=>{
            this.props.form.validateFields(['choseWxList'], { force: true })
        })
    }
    //点击选择微信
    showAddWxModal = () => {
        this.setState({
            visible:true
        })
    }
    handleCancel = () => {
        this.setState({
            visible: false,
        })
    }
    //点击Modal确定
    handleOk = (wechats) => {
        const {totalList} = this.state
        let ids = this.handleWxData(wechats)
        let newlist = []
        let total = _.uniqBy(newlist.concat(totalList,ids),'uin')
        if(total.length > 500){
            message.warning('微信号数量上限500个，您已达到上限！')
            return false
        }
        this.setState({
            visible:false,
            totalList:total
        },() =>{
            this.props.form.validateFields(['choseWxList'], { force: true })
        })
    }
    handleWxData = (data) => {
        return data.map((item,i) => {
            return {
                account:item.username,
                remark:item.remark,
                depts:item.user.departments,
                authImagePath:item.qrcode_url,
                name:item.nickname,
                uin:item.uin,
                id:item.id,
                sign:3,
                addNum:-1,
                isOpenChange:false
            }
        })
    }
    //分页-limit
    handleChangeSize = (current, size) => {
        this.setState({
            current: 1,
            limit: size,
        })
        this.skipPage(1)
    }
    handleDefineChangeSize = (current, size) =>{
        this.setState({
            current_define: 1,
            limit_define: size,
        })
        this.skipdefinePage(1)
    }
    //分页-offset
    skipPage = (page) => {
        this.setState({
            current: page
        })
    }
    skipdefinePage = (page) =>{
        this.setState({
            current_define: page
        })
    }
    //是否添加微信号
    checkWxList = (rule, value, callback) => {
        const {totalList} = this.state
        const {getFieldValue} = this.props.form
        if(getFieldValue('addChildQrcodeType') === 1 && !totalList.length){
            callback('请选择微信号！')
        }else{
            callback()
        }
    }
    checkdefineWxList = (rule, value, callback) =>{
        const {definedAddwx} = this.state
        const {getFieldValue} = this.props.form
        if(getFieldValue('addChildQrcodeType') === 2 && !definedAddwx.length){
            callback('请上传二维码！')
        }else{
            callback()
        }
    }
    //推广模式是否是模板
    checkDescription = (rule, value, callback) => {
        const {getFieldValue} = this.props.form
        if(getFieldValue('type') !== 2 && !value){
            callback(rule.message)
        }else{
            callback()
        }
    }
    //上传背景图片
    uploadChange = (img) =>{
        const { file } = img
        if(file.status === 'done'){
            this.setState({
                bgImagePath: '//image.51zan.com/'+file.response.key
            })
        }
    }
    changeShowNum = (data,idx) =>{
        const totalData = this.state.totalList
        const {current,limit} = this.state

        const idx_new = (current -1)*limit + idx
        totalData[idx_new].isOpenChange = true
        totalData.forEach(function(v,i){
            if(i !== idx_new){
                totalData[i].isOpenChange = false
            }
        })
        this.setState({
            totalList:totalData,
            currentShowNum:parseInt(data.addNum) === -1 ? "" : parseInt(data.addNum)
        })

    }
    onChangeShowNum = (value) =>{
        const numReg = /^[1-9]\d*$/
        if(!numReg.test(value)){
            value = ''
        }
        var text = parseInt(value)
        this.setState({
            currentShowNum:text || ''
        })
    }
    setCurrentShownNum = (e) =>{
        var text = parseInt(e.target.value)
        let idx = parseInt(e.target.getAttribute("data-index"))
        const totalData = this.state.totalList
        const {current,limit} = this.state
        const idx_new = (current -1)*limit + idx
        if(text){

            totalData[idx_new].addNum = text
        }else{
            totalData[idx_new].addNum = -1
        }
        totalData[idx_new].isOpenChange = false
        this.setState({
            totalList:totalData,
            currentShowNum:''
        },() =>{
            this.showDisplayNum(this.state.totalList[idx_new],idx)
        })
    }
    showDisplayNum = (record,index) =>{
        if(record.isOpenChange){
            if(record.addNum){
                return <InputNumber min={0} data-index={index} value={this.state.currentShowNum} onChange={this.onChangeShowNum.bind(this)} onBlur={this.setCurrentShownNum}  placeholder="请输入每日被添加数"  style={{width:'100%'}} maxLength={8}/>
            }else{
                return <InputNumber min={0} data-index={index} onBlur={this.setCurrentShownNum} onChange={this.onChangeShowNum.bind(this)} placeholder="请输入每日被添加数"  style={{width:'100%'}} maxLength={8}/>
            }
        }else{
            return <a href="javascript:void(0)" onClick={this.changeShowNum.bind(this,record,index)}>
                {
                    record.addNum === -1 ? '不限':record.addNum
                }
                <Icon type="edit" style={{color:'#4391FF',fontSize:14,marginLeft:8}}/>
            </a>
        }

    }
    // 点击自定义添加
    showdefineAddWxModal = () =>{
        const {qrcodeModalKeyRandom,definedAddwx} = this.state
        if(definedAddwx.length >= 30){
            message.warning('自定义上传二维码数量上限30个，您已达到上限！')
            return false
        }
        let idx = qrcodeModalKeyRandom
        idx++
        this.setState({
            visible_definde:true,
            qrcodeModalKeyRandom: idx,
            definedWxFormInfo:{}
        })
    }
    // 点击添加方式
    changeAddType = (e) =>{
        this.setState({
            addtype:e.target.value
        })
    }
    // 点击Modal 取消
    handledefinedClose = () =>{
        this.setState({
            visible_definde:false
        })
    }
    // 点击Modal 确定
    handledefinedOk = (data) =>{
        const {definedAddwx,qrcodeModalKeyRandom} = this.state
        let arr = [].concat(definedAddwx)
        if(data.id){
            let index = _.findIndex(arr,v => v.id === data.id)      
            arr[index].authImagePath = typeof(data.authImagePath) === 'string' ? data.authImagePath : data.authImagePath.file.response.key
            arr[index].name = data.name
            arr[index].displayNum = data.displayNum === -1 ? -1 : data.displayNum
        }else{
            arr.push({
                account:'',
                remark:'',
                depts:[],
                uin:'',
                addNum:-1,
                authImagePath:data.authImagePath.file.response.key,
                name:data.name,
                displayNum:data.displayNum === -1 ? -1 : data.displayNum,
                id:qrcodeModalKeyRandom,
                sign:3,//新增数据标识
            })
        }
        this.setState({
            visible_definde:false,
            definedAddwx:arr
        },()=>{
            this.props.form.validateFields(['chosedefineWxList'], { force: true })
        })
    }
    // 自定义上传二维码删除
    deletdefinedwxConfirm = (data,idx) =>{
        const{definedAddwx,current_define,limit_define} = this.state
        const idx_new = (current_define - 1) * limit_define + idx
        definedAddwx.forEach((item) =>{
            if(item.id === data.id){
                definedAddwx.splice(idx_new,1)
            }
        })
        this.setState({
            definedAddwx:definedAddwx
        },()=>{
            this.props.form.validateFields(['chosedefineWxList'], { force: true })
        })
    }
    // 自定义上传编辑
    defineWxEditor = (data) =>{
        this.setState({
            visible_definde:true,
            definedWxFormInfo:data
        })
    }
    //点击复制按钮
    checkCopyBtn = (val) =>{
        console.log(val)
    }
    render(){
        const {totalList,current, limit,definedAddwx,definedWxFormInfo,id,current_define,limit_define,tableLoading} = this.state
        const {loading,subloading} = this.props.platform_create
        const { getFieldDecorator,getFieldValue } = this.props.form
        const formItemLayout = {
            labelCol: {
                span: 6,
                style : { width: '80px'}
            },
            wrapperCol: {
                span: 16,
            },
        }
        const formItemLayout_defined = {
            labelCol: {
                span: 6,
                style : { width: '100px'}
            },
            wrapperCol: {
                span: 16,
            },
        }
        const tableFormLayout = {
            labelCol: {span: 0},
            wrapperCol: {
                span: 24,
            },
        }
        const columns = [
            {
                title:'微信昵称',
                dataIndex: 'name',
                key: 'name',
            },{
                title:'微信号',
                dataIndex: 'account',
                key: 'account',
            },
            {
                title:'备注',
                dataIndex: 'remark',
                render:(text,record,index) =>{
                    if(text) {
                        let newText
                        if(text.length > 20){
                            newText = _.truncate(text,{
                                'length':23,
                                'separator':'...'
                            })
                            return <Popover placement="topLeft" content={text}>
                                {newText}
                            </Popover>
                        }else{
                            return <span>{text}</span>
                        }
                    }else{
                        return '-'
                    }
                }

            },
            {
                title:'部门',
                dataIndex: 'deptName',
                key: 'deptName',
                render: (text, record, index) => {
                    let departments = record.depts
                    let names = []
                    if(departments.length){
                        departments.forEach((item) => {
                            return names.push(item.name)
                        })
                        return names.join(',')
                    }else{
                        return '-'
                    }
                }
            },
            {
                title:()=>{
                    return (
                        <span>
                            每日被添加数
                            <Popover
                                placement="top"
                                content={<div>当前微信号当天被添加数达到设置的限额后，当天将不会再展示该微信号二维码</div>}
                                title={null}
                            >
                                <Icon style={{color: '#4391FF',marginLeft:'5px'}} type="question-circle-o"/>
                            </Popover>
                        </span>
                    )
                },
                dataIndex: 'addNum',
                key: 'addNum',
                width:'200px',
                render:(text,record,index)=>(
                    this.showDisplayNum(record,index)
                )
            },
            {
                title:'操作',
                key: 'actions',
                render:(text,record,index)=>(
                    <a href="#" onClick={this.deletConfirm.bind(this,record,index)}>删除</a>
                )
            }
        ]

        const columns_defined = [
            {
                title:'二维码',
                dataIndex: 'authImagePath',
                render:(text,record) =>{
                    return (
                        <img src={this.state.hostname+'/'+text} alt="" width={40} height={40}/>
                    )
                }
            },{
                title:'二维码名称',
                dataIndex: 'name',
            },{
                title:'展示次数',
                dataIndex: 'displayNum',
                align:'center',
                render:(text) =>{
                    return (
                        <span>{ text === -1 ? '不限' : text}</span>
                    )
                }
            },{
                title:'操作',
                dataIndex: 'action',
                render:(text,record,index) =>{
                    return (
                        <div>
                            <a href="javascript:;" onClick={() =>this.defineWxEditor(record)}>编辑</a>
                            <Divider type="vertical"/>
                            <a href="javascript:;" onClick={() =>this.deletdefinedwxConfirm(record,index)}>删除</a>
                        </div>
                    )
                }
            }
        ]
        //上传
        const UploadProps = {
            accept:'image/*',
            beforeUpload: () => {
                var that = this
                return new Promise(function(resolve, reject)  {
                    that.props.dispatch({
                        type:'platform_create/uploadBg',
                        payload:{
                            type:'image'
                        },
                        callback:(data,meta)=>{
                            that.setState({
                                token:that.props.platform_create.token
                            },() => {
                                if(data && meta.code === 200){
                                    resolve()
                                }else {
                                    reject()
                                }
                            })
                        }
                    })
                })
            },
            data:{
                token: this.state.token
            },
            action:'//upload.qiniup.com/',
            showUploadList:false,
            disabled:this.props.platform_create.loading,
            onChange:this.uploadChange
        }
        return(
            <Page>
                <Page.ContentHeader
                    hasGutter={false}
                    breadcrumbData={[{
                        name: '新码',
                        path: '/platform/wx_code'
                    }, {
                        name: id ? '编辑新码' : '创建新码'
                    }]}
                />
                <Row>
                    <Col span={15} style={{paddingTop:'10px'}}>
                        {/* onSubmit={this.handleSubmit} */}
                        <Form  className="hz-from-edit hz-from-label-left">
                            <FormItem
                                label='新码名称'
                                {...formItemLayout}
                            >
                                {getFieldDecorator('name',{
                                    rules:[
                                        {required:true,message:'请输入新码名称！'},
                                        {pattern: /^[a-zA-Z0-9\u4E00-\u9FA5\uF900-\uFA2D]{1,16}$/, message: '中文、英文、数字, 1-16'},
                                    ]
                                })(
                                    <HzInput placeholder="例：旗舰店售后客服（16个字内）" maxLength={16}/>
                                )}
                            </FormItem>
                            <FormItem
                                label="推广模式"
                                {...formItemLayout}
                            >
                                {getFieldDecorator('type',{
                                    rules:[
                                        {required:true,message:'请输入推广模式！'}
                                    ]
                                })(
                                    <RadioGroup>
                                        <Radio value={1}>使用模板</Radio>
                                        <Radio value={2}>自定义模板</Radio>
                                    </RadioGroup>
                                )}
                            </FormItem>
                            {
                                getFieldValue('type') === 1 ? 
                                    <div>
                                        <FormItem
                                            label='推广主题'
                                            required= {true}
                                            {...formItemLayout}
                                        >
                                            {getFieldDecorator('subject',{
                                                rules:[
                                                    {validator:this.checkDescription,message:'请输入推广主题！'}
                                                ]
                                            })(
                                                <HzInput placeholder="例：扫码有惊喜（8个字以内）" maxLength={8}/>
                                            )}
                                        </FormItem>
                                        <FormItem
                                            label='推广描述'
                                            required= {true}
                                            className={styles.textareaWrap}
                                            {...formItemLayout}
                                        >
                                            {getFieldDecorator('description',{
                                                rules:[
                                                    {validator:this.checkDescription,message:'请输入推广描述！'}
                                                ]
                                            })(
                                                <TextAreaCount
                                                    style={{ width: '100%' }}
                                                    placeholder="例：长按二维码添加店长微信获得私密好礼（140个字以内）"
                                                    rows={4}
                                                    limitSize={140}
                                                />
                                                //<TextArea placeholder="例：长按二维码添加店长微信获得私密好礼（140个字以内）" autosize={{ minRows: 1, maxRows: 6 }} maxLength={140}/>
                                            )}
                                        </FormItem>
                                    </div>
                                    : ''
                            }
                            <FormItem
                                label='使用状态'
                                {...formItemLayout}
                            >
                                {getFieldDecorator('status',{
                                    valuePropName:'checked',
                                    rules:[{required:true}]
                                })(
                                    <Switch checkedChildren="开" unCheckedChildren="关"/>
                                )}
                            </FormItem>


                            <FormItem
                                label="添加方式"
                                {...formItemLayout}
                            >
                                {getFieldDecorator('addChildQrcodeType',{
                                    rules:[
                                        {required:true}
                                    ],
                                    initialValue:this.state.addtype
                                })(
                                    <RadioGroup onChange={this.changeAddType}>
                                        <Radio value={1}>添加客服微信</Radio>
                                        <Radio value={2}>自定义上传二维码</Radio>
                                    </RadioGroup>
                                )}
                            </FormItem>
                            {
                                (getFieldValue('type') === 2 &&  getFieldValue('addChildQrcodeType') === 1) ? <div>
                                    <FormItem
                                        label='复制按钮'
                                        {...formItemLayout}
                                    >
                                        {getFieldDecorator('wxAccountCopy',{
                                            valuePropName:'checked',
                                            rules:[{required:true}]
                                        })(
                                            <Switch checkedChildren="开" unCheckedChildren="关"/>
                                        )}
                                        <span className={styles.formItemTip}>开启后启用微信号复制按钮</span>
                                    </FormItem>
                                </div> : ''
                            }
                            {
                                getFieldValue('addChildQrcodeType') === 1 ? <div>
                                    <FormItem
                                        style={{ alignContent:'flex-start',alignItems:'flex-start'}}
                                        label={(
                                            <span className={styles.alert}>选择微信</span>
                                        )}
                                        {...formItemLayout}
                                    >
                                        {getFieldDecorator('choseWxList',{
                                            rules:[
                                                {validator:this.checkWxList}
                                            ]
                                        })(
                                            <div>
                                                <Button type="primary" onClick={() =>this.showAddWxModal('visible')} ghost>
                                                    <Icon type="plus" />
                                                    添加
                                                </Button>
                                                <span className={styles.formItemTip}>
                                                    
                                                    当前最多可添加<i className={styles.fontWeight}>500</i>个个人微信号
                                                </span>
                                            </div>
                                        )}
                                    </FormItem>
                                    {
                                        totalList.length ? <FormItem {...tableFormLayout}
                                        >
                                            <Table
                                                columns={columns}
                                                dataSource={totalList.slice(limit * (current - 1), limit * current)}
                                                rowKey={record => record.uin}
                                                loading={tableLoading}
                                                bordered={false}
                                                style={{marginTop:'10px'}}
                                                pagination={false}
                                            />
                                            <Pagination
                                                className={styles.wxPagination + ' ant-table-pagination'}
                                                total={totalList.length}
                                                current={current}
                                                showQuickJumper={true}
                                                pageSizeOptions={pageSizeOptions}
                                                showTotal={total => `共 ${total} 条`}
                                                pageSize={limit}
                                                showSizeChanger={true}
                                                onShowSizeChange={this.handleChangeSize}
                                                onChange={this.skipPage}
                                            />
                                        </FormItem> : ''
                                    }
                                </div> : <div>
                                    <FormItem
                                        style={{ alignContent:'flex-start',alignItems:'flex-start'}}
                                        label={(
                                            <span className={styles.alert}>上传二维码</span>
                                        )}
                                        {...formItemLayout_defined}
                                    >
                                        {getFieldDecorator('chosedefineWxList',{
                                            rules:[
                                                {validator:this.checkdefineWxList}
                                            ]
                                        })(
                                            <div>
                                                <Button type="primary" onClick={this.showdefineAddWxModal} ghost>
                                                    <Icon type="plus" />
                                                    添加
                                                </Button>
                                                <span style={{marginLeft:'20px'}}>
                                                    
                                                    当前最多可上传30个二维码
                                                </span>
                                            </div>
                                        )}
                                    </FormItem>
                                    {
                                        definedAddwx.length ?  <FormItem {...tableFormLayout}>
                                            <Table
                                                columns={columns_defined}
                                                dataSource={definedAddwx.slice(limit_define * (current_define - 1), limit_define * current_define)}
                                                rowKey={record => record.id}
                                                loading={tableLoading}
                                                bordered={false}
                                                style={{marginTop:'10px'}}
                                                pagination={false}
                                            />
                                            <Pagination
                                                className={styles.wxPagination + ' ant-table-pagination'}
                                                total={definedAddwx.length}
                                                current={current_define}
                                                showQuickJumper={true}
                                                pageSizeOptions={pageSizeOptions}
                                                showTotal={total => `共 ${total} 条`}
                                                pageSize={limit_define}
                                                showSizeChanger={true}
                                                onShowSizeChange={this.handleDefineChangeSize}
                                                onChange={this.skipdefinePage}
                                            />
                                        </FormItem> : ''
                                    }
                                </div>
                            }
                            
                            <FormItem
                                style={{marginTop:'24px'}}
                                {...formItemLayout}
                            >
                                {/* htmlType="submit" */}
                                <Button type="primary" onClick={this.handleSubmit.bind(this)}  loading={subloading} disabled={subloading} className={styles.mr16}>
                                    {subloading ? ('提交中...') : ('提交')}
                                </Button>
                                <Button onClick={this.cancleCreate.bind(this)}>取消</Button>
                            </FormItem>
                        </Form>
                    </Col>
                    <Col span={9} style={{textAlign:'center',padding:'10px 0 0'}}>
                        <div className={styles.phoneWrap}>

                            {
                                getFieldValue('type') === 1 && (
                                    <div className={`${styles.phoneBg} ${styles.phoneBgDefault}`}>

                                        <div className={styles.phoneEQRcodeBg}>
                                            <div className={styles.phoneEQRcode} style={{bottom:'74px'}}>
                                                
                                                <div className={styles.phoneEQRWrap} style={{marginBottom:15}}>
                                                    <img src={require('../../assets/images/erweima1.png')} alt=""/>
                                                </div>
                                                <div className={styles.phoneShareTitle}>
                                                    {this.props.form.getFieldValue('subject')}
                                                </div>
                                                <div className={styles.description}>
                                                    <pre className={styles.showDescription}>
                                                        {this.props.form.getFieldValue('description')}
                                                    </pre>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                            {
                                getFieldValue('type') === 2 && (
                                    <div className={`${styles.phoneBg} ${styles.phoneBgCustom}`}>
                                        <div className={styles.phoneEQRcodeBg} style={{backgroundImage: `url(${this.state.bgImagePath})`}}>

                                            <div className={styles.phoneEQRcode} style={{bottom:'98px'}}>

                                                <div className={styles.phoneEQRWrap}>
                                                    <img src={require('../../assets/images/erweima2.png')} alt=""/>
                                                </div>
                                            </div>
                                        </div>
                                        {
                                            getFieldValue('wxAccountCopy') && getFieldValue('addChildQrcodeType') === 1 ? 
                                                <div className={styles.copyBtn}>
                                                    <span>复制微信号</span>
                                                </div> : ''
                                        }
                                        
                                    </div>

                                )
                            }
                        </div>
                        {
                            getFieldValue('type') === 2 && (
                                <Upload {...UploadProps}>
                                    <Button style={{width:'130px'}} type="primary" loading={loading} ghost>
                                        {loading ? ('上传中...') : (
                                            '上传图片'
                                        )}
                                    </Button>
                                </Upload>
                            )
                        }
                    </Col>
                </Row>
                <WeChatSelectMulti
                    visible={this.state.visible}
                    apiHost={`${baseConfig.apiHost}/api`}
                    accessToken={this.props.base.accessToken}
                    searchOption={['query', 'group_id', 'online']}
                    onCancel={this.handleCancel}
                    onOk={this.handleOk}
                    disableByQrCode={true}
                />
                <AdddefinedWx 
                    visible_definde={this.state.visible_definde}
                    onClose={this.handledefinedClose}
                    onOk={this.handledefinedOk}
                    key={this.state.qrcodeModalKeyRandom}
                    definedWxFormInfo={definedWxFormInfo}
                />
            </Page>
        )
    }
}
