'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [吴明]
 * 创建日期: 16/12/27
 */
import React ,{Fragment} from 'react'
import {connect} from 'dva'
import Page, { DEFAULT_PAGER , DEFAULT_PAGER_FILTER} from '../../../../components/business/Page'
import { Form, Row,Cascader, DatePicker,Modal, Select, Col, Input, Button,InputNumber, Icon} from 'antd'
import 'moment/locale/zh-cn'
import moment from 'moment'
import styles from './index.less'
import router from 'umi/router'
import {stringify} from 'qs'
import { SHOP_TYPE, getMappingPlatformByType, getMappingFromByType, getMappingDecByOri } from '../../../../common/shopConf'
import { number } from '@/utils/display';

moment.locale('zh-cn')


const DEFAULT_CONDITION = {
    is_wechat_binded:undefined,
    begin_time:'',
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


export default class extends React.Component{
    constructor(props) {
        super(props)
        this.state = {
            text:'',
            visible:false,
            index:'',
            id:'',
            isUpload:false,
            condition: {...DEFAULT_CONDITION}
        }
    }
    initPage = () => {
        const { is_wechat_binded,
                remark_include,
                order_amount_begin,
                order_amount_end,
                average_amount_begin,
                average_amount_end,
                begin_time,
                end_time,
                shop_id,
                type
        } = this.props.query
        if(type){
            this.props.form.setFieldsValue({
                'shop_id': [parseInt(type, 10), parseInt(shop_id, 10) || ''],
            })
        }
        this.props.form.setFieldsValue({
                'is_wechat_binded':is_wechat_binded?Number(is_wechat_binded):undefined,
                'remark_include':remark_include,
                'order_amount_begin':order_amount_begin,
                'order_amount_end':order_amount_end,
                'average_amount_begin':average_amount_begin,
                'average_amount_end':average_amount_end,
                'rangePicker': begin_time && end_time ? [moment(begin_time),moment(end_time)] : [],
        })
        
    }
    getPageData = (condition) => {
        condition.platform_type = getMappingPlatformByType(condition.type) || ''
        condition.data_from= condition.type === 999 ? '1' : getMappingFromByType(condition.type) || ''
        this.setState({
            condition:{...condition} 
        })
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
                    this.history({...condition,steps:1})
                }else{
                    this.history(condition)
                    Modal.error({
                        title: '提示',
                        content: '本次共选中0位用户，无法发送短信',
                        okText:'确定'
                    });
                }
                
            }
        })
    }
    getParamForObject = (param, source, paramFilter)  => {
        let result = {...param}
        Object.keys(result).forEach(key => {
            const filter = paramFilter ? paramFilter[key] : null
            const value = source[key]
            if(value !== undefined) {
                result[key] = filter ? filter(value, result[key]) : value
            }
        })
        return result
    }
    history = (condition,filter) => {
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
        router.push("?" + params)
    }
    componentDidMount() {
        this.getShops()
        this.initPage()
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
                        end_time: end_time ,
                        remark_include: value.remark_include,
                        order_amount_begin: value.order_amount_begin,
                        order_amount_end: value.order_amount_end,
                        average_amount_begin: value.average_amount_begin,
                        average_amount_end: value.average_amount_end,
                        shop_id:shop_id,
                        type:type,
                        is_wechat_binded: value.is_wechat_binded,
                    }
                }
                this.getPageData(condition)
            }
        })   
    }
    getShops = () => {
        this.props.dispatch({
            type: 'crm_customerPool/getShops'
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
    render() {
        const { RangePicker } = DatePicker
        const FormItem = Form.Item
        const Option = Select.Option
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

        return (
            <Fragment>
                <Page.ContentAdvSearch  hasGutter={false}>
                <Form layout="horizontal" className="hz-from-search"  className={styles.customerPool} >
                        <Row>
                            <Col span={8}>
                                <FormItem label="所属店铺" {...formItemLayout}>
                                     {getFieldDecorator("shop_id",{})(
                                        <Cascader placeholder='选择店铺' options={type} popupClassName={styles.userCascader}></Cascader>
                                    )} 
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem label="是否加粉" {...formItemLayout}>
                                     {getFieldDecorator("is_wechat_binded",{})(
                                        <Select placeholder='请选择' allowClear>
                                            <Option value={0}>全部</Option>
                                            <Option value={2}>未加粉</Option>
                                            <Option value={1}>已加粉</Option>
                                        </Select>
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
                                <FormItem label="备注信息" {...formItemLayout}>
                                    {getFieldDecorator('remark_include')(
                                        <Input placeholder="用户池备注"  maxLength={10}  />
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
                    </Form>
                    
                </Page.ContentAdvSearch>
                <Button className="hz-btn-width-default" type="primary"  style={{marginTop:24}}   onClick={this.handleSearch}  >
                    下一步
                </Button>
            </Fragment>
        )
    }
}
