'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 2017/8/13
 */

import React from 'react'
import {Form, Input, Button, Row, Col, Select, DatePicker, InputNumber} from 'antd'
import styles from './index.scss'
import config from 'crm/common/config'

const FormItem = Form.Item
const Option = Select.Option
const {RangePicker} = DatePicker

const {DateTimeFormat} = config

class Search extends React.Component {
    constructor(props) {
        super()
        this.state = {}

    }

    handleSearch = (e) => {
        e.preventDefault()
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const rangeTimeValue = values['range_time']
                values.start_time = ''
                values.end_time = ''
                if(rangeTimeValue.length === 1){
                    values.start_time = rangeTimeValue[0].format('YYYY-MM-DD HH:mm:ss')
                }
                if(rangeTimeValue.length === 2){
                    values.start_time = rangeTimeValue[0].format('YYYY-MM-DD HH:mm:ss')
                    values.end_time = rangeTimeValue[1].format('YYYY-MM-DD HH:mm:ss')
                }
                let params = {...this.props.crm_members.params, ...values}
                this.props.dispatch({
                    type: 'crm_members/setParams',
                    payload: params
                })
                setTimeout(() => {
                    this.props.search()
                }, 0)
            }
        })
    };

    handleRangeChange = (key,idx, val) =>{
        let params = {...this.props.crm_members.params}
        let t = params[key].split(',')
        t[idx] = val
        params[key] = t.join(',')
        this.props.dispatch({
            type: 'crm_members/setParams',
            payload: params,
        })
    }

    getVal = (key, idx) => {
        let params = {...this.props.crm_members.params}
        if (params[key]) {
            let t = params[key].split(',')
            if (t.length > idx) {
                return t[idx]
            } else {
                return ''
            }
        } else {
            return ''
        }
    };
    componentDidMount() {
    }

    render() {
        const {getFieldDecorator} = this.props.form
        let {initData: config} = this.props.base
        let {params} = this.props.crm_members
        const formItemLayout = {
            labelCol: {span: 0},
            wrapperCol: {span: 24},
        }
        const formItemLayout1 = {
            labelCol: {span: 6},
            wrapperCol: {span: 18},
        }
        // const getStoreTypeName = (id) => {
        //     let _item = config.store_types.filter((item) => {
        //         return item.id === id
        //     })
        //     return _item[0].name
        //
        // }
        const getStoreTypeOptions = () => {
            let options = [<Option key="all" value="" label="全部[来源]">全部[来源]</Option>]
            let _types = config.store_types || []
            _types.forEach((item) => {
                options.push(<Option key={item.id + ''} value={item.id + ''}
                    label={item.name}>{item.name}</Option>)
            })
            return options
        }
        return (
            <div className={styles.searchWrap}>
                <Form className="ant-advanced-search-form"
                    onSubmit={this.handleSearch}>
                    <Row gutter={14}>
                        <Col span={5}>
                            <FormItem {...formItemLayout} label="" className="resetIpt" colon={false}>
                                {getFieldDecorator('query',
                                    {
                                        initialValue: params.query
                                    }
                                )(
                                    <Input className="vam" size="default" placeholder="请输入电话号码、名字或会员名搜索"/>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={5}>
                            <FormItem {...formItemLayout} label="" colon={false}>
                                {getFieldDecorator('store_type',
                                    {
                                        initialValue: params.store_type + ''
                                    }
                                )(
                                    <Select placeholder="请选择来源" className="vam" size="default" style={{width: '100%'}}>
                                        {getStoreTypeOptions()}
                                    </Select>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={5}>
                            <FormItem {...formItemLayout} label="" colon={false}>
                                {getFieldDecorator('bind_status',
                                    {
                                        initialValue: params.bind_status + ''
                                    }
                                )(
                                    <Select placeholder="微信绑定状态" size="default">
                                        <Option value="">全部[微信关联状态]</Option>
                                        <Option value="1">已关联微信</Option>
                                        <Option value="0">未关联微信</Option>
                                    </Select>
                                )}
                            </FormItem>
                        </Col>

                        <Col span={9}>
                            <FormItem {...formItemLayout} label="" className="resetIpt" colon={false}>
                                {getFieldDecorator('range_time',
                                    {
                                        initialValue: params.range_time
                                    }
                                )(
                                    <RangePicker
                                        showTime
                                        format={DateTimeFormat}
                                        style={{width:'100%'}}
                                        placeholder={['开始时间', '结束时间']}/>
                                )}
                            </FormItem>
                        </Col>

                    </Row>

                    <Row gutter={14}>

                        <Col span={5}>
                            <FormItem {...formItemLayout} label="" className="resetIpt" colon={false}>
                                {getFieldDecorator('remark',
                                    {
                                        initialValue: params.remark
                                    }
                                )(
                                    <Input className="vam" size="default" placeholder="备注包含"/>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={5}>
                            <FormItem {...formItemLayout} label="" className="resetIpt" colon={false}>
                                {getFieldDecorator('exclude_remark',
                                    {
                                        initialValue: params.exclude_remark
                                    }
                                )(
                                    <Input className="vam" size="default" placeholder="备注不包含"/>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={5}>
                            <FormItem {...formItemLayout} label="" colon={false}>
                                {getFieldDecorator('sms_status',
                                    {
                                        initialValue: params.sms_status + ''
                                    }
                                )(
                                    <Select placeholder="短信发送状态" size="default">
                                        <Option value="">全部[短信状态]</Option>
                                        <Option value="1">已发短信</Option>
                                        <Option value="0">未发短信</Option>
                                    </Select>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={5}>
                            <FormItem {...formItemLayout} label="" colon={false}>
                                {getFieldDecorator('issue_status',
                                    {
                                        initialValue: params.issue_status + ''
                                    }
                                )(
                                    <Select placeholder="加粉状态" size="default">
                                        <Option value="">全部[加粉状态]</Option>
                                        <Option value="0">未派发</Option>
                                        <Option value="1">已派发</Option>
                                    </Select>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={4}>
                            <Button type="primary" htmlType="submit" icon="search">搜索</Button>
                        </Col>
                    </Row>
                    <Row gutter={14}>
                        <Col span={7} className={styles.rangeIpt}>
                            <FormItem  {...formItemLayout1} label="订单总量">
                                <InputNumber className="ipt" size="default" placeholder="个"
                                    value={this.getVal('total_count', 0)}
                                    onChange={this.handleRangeChange.bind(this,'total_count',0)}/>
                                <span className={styles.sp}>~</span>
                                <InputNumber className="ipt" size="default" placeholder="个"
                                    value={this.getVal('total_count', 1)}
                                    onChange={this.handleRangeChange.bind(this,'total_count',1)}/>
                            </FormItem>
                        </Col>
                        <Col span={7} className={styles.rangeIpt}>
                            <FormItem  {...formItemLayout1} label="订单金额">
                                <InputNumber className="ipt" size="default" placeholder="元"
                                    value={this.getVal('total_amount', 0)}
                                    onChange={this.handleRangeChange.bind(this,'total_amount',0)}/>
                                <span className={styles.sp}>~</span>
                                <InputNumber className="ipt" size="default" placeholder="元"
                                    value={this.getVal('total_amount', 1)}
                                    onChange={this.handleRangeChange.bind(this,'total_amount',1)}/>
                            </FormItem>
                        </Col>
                        <Col span={7} className={styles.rangeIpt}>
                            <FormItem  {...formItemLayout1} label="平均单价">
                                <InputNumber className="ipt" size="default" placeholder="元"
                                    value={this.getVal('average_amount', 0)}
                                    onChange={this.handleRangeChange.bind(this,'average_amount',0)}/>
                                <span className={styles.sp}>~</span>
                                <InputNumber className="ipt" size="default" placeholder="元"
                                    value={this.getVal('average_amount', 1)}
                                    onChange={this.handleRangeChange.bind(this,'average_amount',1)}/>
                            </FormItem>
                        </Col>
                    </Row>
                </Form>
            </div>)
    }
}

export default Form.create()(Search)
