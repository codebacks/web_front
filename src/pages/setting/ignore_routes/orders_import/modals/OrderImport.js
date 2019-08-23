import React, {Component, Fragment} from 'react'
import { Modal, Form, Upload, Button, message, Icon, Input, Cascader } from 'antd'
import { SHOP_TYPE, getShopValByName } from '../../../../../common/shopConf'
import {connect} from 'dva'
import _ from 'lodash'
import styles from './../index.less'
const FormItem = Form.Item
const limitSize = 100
const formItemLayout = {
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

@connect(({setting_ordersImport, base}) => ({
    setting_ordersImport,
    base,
}))
export default class OrderImport extends Component{
    constructor(){
        super()
        this.state= {
            confirmLoading: false,
            showGood: true,
        }
    }
    shopChange = (value) => { 
        // 京东或者自营店铺只导入一个文件
        let type = Array.isArray(value) && value[0]
        let status
        if (type === getShopValByName('JD') || type === getShopValByName('ZiYing')) {
            status = false
        } else { 
            status = true
        }
        this.setState({
            showGood: status,
        })
    }
    saveOrdersImport = ()=> {
        this.formContent.validateFields((err, values)=>{
            if(!err){
                this.setState({
                    confirmLoading: true
                })
                this.props.dispatch({
                    type: 'setting_ordersImport/saveOrder',
                    payload: { 
                        shop_id: values.shop_id,
                        file_name: {
                            order_name: values.fileName || '',
                            item_name: values.goodName || '',
                        },
                        order_file_url: values.orderFileUrl || '',
                        order_items_file_url: values.orderGoodUrl || '',
                    },
                    callback: (data)=>{
                        this.setState({
                            confirmLoading: false
                        })
                        if(!data.error){
                            message.success(`导入成功`)
                            this.cancelOrdersImport()
                            this.props.dispatch({
                                type: 'setting_ordersImport/getOrderList',
                                payload:{}
                            })
                        }
                    }
                })  
            }
        })
    }
    cancelOrdersImport = ()=> {
        this.props.onChange()
    }
    render(){
        const { confirmLoading, showGood } = this.state
        const {  photoToken,  shopDataOrder } = this.props.setting_ordersImport
        return (
            <Modal 
                title='导入订单'
                visible={ this.props.visiable }
                cancelText="关闭"
                okText='导入'
                onOk={this.saveOrdersImport}
                onCancel={this.cancelOrdersImport}
                width={600}
                confirmLoading= { confirmLoading }
            >
                <FormComponent 
                    {...this.props}
                    photoToken={photoToken} 
                    shopDataOrder={shopDataOrder}
                    changeFileName = {this.changeFileName}
                    ref={node => this.formContent = node}
                    showGood={showGood}
                    shopChange={this.shopChange}
                ></FormComponent>
            </Modal>
        )
    }
}


class FormContent extends Component{
    constructor(props){
        super(props)
        this.state={
            orderFileSize: 0,
            orderGoodSize: 0,
            orderFileList: [],
            orderGoodList: [],
        }
    }
    componentDidMount(){
        this.props.form.setFieldsValue({
            shop_id: '',
        })    
    }
    shopChange = (value) => {
        this.props.shopChange(value)
        //切换店铺的时候，更新
        this.props.form.setFieldsValue({
            shop_id: value[1],
            orderFileUrl: '',
            orderGoodUrl: '',
            fileName: '',
            goodName: '',
        }) 
        this.setState({
            orderFileSize: 0,
            orderGoodSize: 0,
            orderFileList: [],
            orderGoodList: [], 
        })
    }
    orderChange=(info) => {
        let fileList = info.fileList.slice(-1)
        this.setState({
            orderFileList: fileList
        })
        if (info.file.status === 'done') {
            message.success(`${info.file.name} 上传成功`)
            this.props.form.setFieldsValue({
                orderFileUrl: info.file.response.key,
                fileName: info.file.name
            }) 
            const size = parseInt(info.file.size/1024/1024,10)
            this.setState({
                orderFileSize: size > 1 ? size : 1 
            })
        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} 上传失败`)
            this.props.form.setFieldsValue({
                orderFileUrl: ''
            }) 
        }
    }
    validatorOrder =  (rule, value, callback)=>{
        const data = this.state.orderFileList
        if(data.length === 0){
            callback('请导入订单报表')
            return
        }
        callback()
    }
    removeOrder = (file)=>{
        this.props.form.setFieldsValue({
            orderFileUrl: '',
            fileName: '',
        })
    }
    goodsChange=(info) => {
        let fileList = info.fileList.slice(-1)
        this.setState({
            orderGoodList: fileList
        })
        if (info.file.status === 'done') {
            message.success(`${info.file.name} 上传成功`) 
            this.props.form.setFieldsValue({
                orderGoodUrl: info.file.response.key,
                goodName: info.file.name
            })
            const size = parseInt(info.file.size/1024/1024,10)
            this.setState({
                orderGoodSize: size > 1 ? size : 1 
            }) 
        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} 上传失败`)
            this.props.form.setFieldsValue({
                orderGoodUrl: ''
            }) 
        } 
    }
    validatorGood =  (rule, value, callback)=>{
        const data = this.state.orderGoodList
        if(data.length === 0){
            callback('请导入宝贝报表')
            return
        }
        callback()
    }
    removeGood = (file)=>{
        this.props.form.setFieldsValue({
            orderGoodUrl: '',
            goodName: '',
        })    
    } 
    downLoad = () => {
        // href='http://document.51zan.com/2018/12/14/FvP53PKH1AkasHlAAJosKCAcR8jE.csv'
        // download='模板' 
        this.linkRefa.click()
    }
    render(){
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
        const {initData} = this.props.base
        const version_id = _.get(initData, 'company.product_version.id', '')
        const { getFieldDecorator } = this.props.form
        const { orderFileSize, orderGoodSize, orderFileList, orderGoodList } = this.state
        const shopDataOrder = this.props.shopDataOrder
        let type = []
        // 显示淘宝天猫类型的店铺的导入
        const arr =SHOP_TYPE.filter((item) => { 

            return    version_id ===10 ||version_id ===0 ?item.name === 'ZiYing': item.name === 'TaoBao' || item.name === 'TianMao' || item.name === 'ZiYing'
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
                <Form>
                    <FormItem label="选择店铺" {...formItemLayout} required= {true}>
                        {getFieldDecorator('shop_id',{
                            rules: [{ required: true, message: '请选择店铺' }],
                        })(
                            <div style={{width: 180 }} >
                                <Cascader placeholder='选择店铺' options={type} onChange={this.shopChange}></Cascader>
                            </div>
                        )}
                    </FormItem>
                    <FormItem label="订单报表" {...formItemLayout} required= {true}>
                        {getFieldDecorator('orderFileUrl',{
                            //rules: [{ required: true, message: '请导入订单报表' }],
                            rules: [{ validator: this.validatorOrder }],
                        })(
                            <div title="">
                                <div>
                                    <Upload 
                                        style={{width: 180 }} 
                                        {...uploadProps}
                                        onChange={this.orderChange}
                                        onRemove={this.removeOrder} 
                                        fileList={orderFileList}
                                        className={styles.upLoad}
                                    >
                                        <Button><Icon type="upload" />上传文件</Button>
                                    </Upload>
                                    {
                                        this.props.showGood !== true &&(
                                            <Button
                                                className={styles.downLoad + ' ant-btn'}
                                                onClick={this.downLoad}
                                            >
                                                <Icon type="download"/>
                                                订单模板下载
                                            </Button>
                                        )
                                    }
                                </div>
                                {
                                    this.props.showGood !== true &&(<div style={{fontSize: 12, lineHeight: 2}}>自营或其他店铺请下载模板，且只能上传csv格式文件</div>)
                                }
                                <div style={{fontSize: 12, lineHeight: 2}}>
                                    <Icon type="exclamation-circle" style={{marginRight: 10, color: '#FA8C16'}} />
                                    {`上传大小限${limitSize}MB，已上传${orderFileSize}MB`}
                                </div>
                            </div>
                        )}
                    </FormItem>
                    <FormItem label="订单名称" {...formItemLayout} style={{display: 'none'}}>
                        {getFieldDecorator('fileName',{
                        })(
                            <div title="" style={{width: 180 }}>
                                <Input></Input>
                            </div>
                        )}
                    </FormItem>
                    {
                        this.props.showGood === true && (
                            <Fragment>
                                <FormItem label="宝贝报表" {...formItemLayout} required= {true}>
                                    {getFieldDecorator('orderGoodUrl',{
                                        //rules: [{ required: true, message: '请导入宝贝报表' }],
                                        rules: [{ validator: this.validatorGood }],
                                    })(
                                        <div title="">
                                            <Upload 
                                                style={{width: 180 }} 
                                                {...uploadProps}
                                                onChange={this.goodsChange}
                                                fileList={orderGoodList}
                                                onRemove={this.removeGood} 
                                            >
                                                <Button><Icon type="upload" />上传文件</Button>
                                            </Upload>
                                            <div style={{fontSize: 12, lineHeight: 2 }}>
                                                <Icon type="exclamation-circle" style={{marginRight: 10, color: '#FA8C16'}} />
                                                {`上传大小限${limitSize}MB，已上传${orderGoodSize}MB`}
                                            </div>
                                        </div>
                                    )}
                                </FormItem>
                                <FormItem label="宝贝名称" {...formItemLayout} style={{display: 'none'}}>
                                    {getFieldDecorator('goodName',{
                                    })(
                                        <div title="" style={{width: 180 }}>
                                            <Input></Input>
                                        </div>
                                    )}
                                </FormItem>
                            </Fragment>
                        )
                    }
                </Form>
                <a href='https://document.51zan.com/retial/setting/20190122/%E8%AE%A2%E5%8D%95%E5%AF%BC%E5%85%A5.csv' download="模板" ref={node => this.linkRefa=node} style={{display: 'none'}}>下载</a>
            </Fragment>
        )
    }
}
const FormComponent = Form.create()(FormContent)
