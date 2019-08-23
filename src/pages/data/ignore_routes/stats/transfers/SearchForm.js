'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 16/12/27
 */
import React, {Component} from 'react'
import {Row, Col, Form, Button, Select, Radio} from 'antd'
import moment from 'moment'
import 'moment/locale/zh-cn'
import config from 'data/common/config'
import styles from './SearchForm.scss'
import DateRange from 'components/DateRange'
import DepartmentSelect from 'components/business/DepartmentSelect'
import UserSelect from 'components/business/UserSelect'
import WeChatSelectSingle from 'components/business/WeChatSelectSingle'

moment.locale('zh-cn')

const FormItem = Form.Item
const Option = Select.Option
const {DateFormat} = config


class SearchForm extends Component {
    constructor(props) {
        super(props)
        this.state = {

        }
    }

    handleSearch = (e) => {
        e.preventDefault()
        this.props.onSearch()
    };

    componentDidMount() {
    }

    componentWillUnmount() {
        this.resetParams()
    }

    resetParams = () => {
        this.props.dispatch({
            type: 'data_transfer/resetParams'
        })
        this.props.dispatch({
            type: 'data_transfer/resetRange',
        })
        this.changeTimeRange('week')
    }

    handleChange = (key, e) =>{
        let val = ''
        if (key === 'keyword' || key === 'outer_order_id') {
            val = e.target.value.trim()
        } else {
            val = e
        }
        let params = {...this.props.data_transfer.params}
        if (key === 'type') {
            // delete params['is_sender'];
            params.transfer_type = ''
            params.is_sender = ''
            params.amount = ''
            params.source = ''
            switch (val) {
                case  '1':
                    params.transfer_type = 2000
                    break
                case  '2':
                    params.transfer_type = 2001
                    break
                case  '3':
                    params.is_sender = 1
                    break
                case  '4':
                    params.is_sender = 0
                    break
                case  '5':
                    params.transfer_type = 2001
                    params.is_sender = 1
                    break
                case  '6':
                    params.transfer_type = 2001
                    params.is_sender = 0
                    break
                case  '7':
                    params.transfer_type = 2001
                    params.amount = 0
                    break
                case  '8':
                    params.source = '客服录入'
                    break
                default:
            }
        }else if (key === 'department_id') {
            params['user_id'] = undefined
            params['uin'] = undefined
        } else if (key === 'user_id') {
            params['uin'] = undefined
        }
        params[key] = val
        this.props.dispatch({
            type: 'data_transfer/setParams',
            payload: params,
        })
    }

    handleChangeDate = (startValue, endValue) => {
        let params = {...this.props.data_transfer.params}
        if (startValue && endValue) {
            params.start_time = moment(startValue).format(DateFormat) + ' 00:00:00'
            params.end_time = moment(endValue).format(DateFormat) + ' 23:59:59'
        } else {
            params.start_time = ''
            params.end_time = ''
        }
        this.setTimeRange(startValue, endValue)
        this.props.dispatch({
            type: 'data_transfer/setParams',
            payload: params,
        })
    };

    setTimeRange = (startValue, endValue) => {
        let range = ''
        if(moment().subtract(1, 'days').isSame(startValue, 'day')
            && moment().subtract(1, 'days').isSame(endValue, 'day')){
            range = 'yesterday'
        }else if(moment().subtract(6, 'days').isSame(startValue, 'day')
            && moment().isSame(endValue, 'day')){
            range = 'week'
        }else if(moment().subtract(29, 'days').isSame(startValue,'day')
            && moment().isSame(endValue, 'day')){
            range = 'month'
        }
        this.props.dispatch({
            type: 'data_transfer/setProperty',
            payload: {range: range}
        })
    }

    handleChangeTimeRange = (e) => {
        const value = e.target.value
        this.changeTimeRange(value)
        this.props.dispatch({
            type: 'data_transfer/setProperty',
            payload: {
                range: value
            }
        })
    }

    changeTimeRange = (value) => {
        switch (value) {
            case 'yesterday':
                this.setTimeParams(1)
                break
            case 'week':
                this.setTimeParams(6)
                break
            case 'month':
                this.setTimeParams(29)
                break
            default:
        }
    }

    setTimeParams = (days) => {
        const startTime = moment().subtract(days, 'days').format(DateFormat) + ' 00:00:00'
        let endTime = ''
        if (days === 1) {
            endTime = moment().subtract(days, 'days').format(DateFormat) + ' 23:59:59'
        } else {
            endTime = moment().format(DateFormat) + ' 23:59:59'
        }
        this.props.dispatch({
            type: 'data_transfer/setParams',
            payload: {
                start_time: startTime,
                end_time: endTime
            }
        })
        const endDay = days === 1 ? moment().subtract(days, 'days') : moment()
        this.transferTime.setDate(moment().subtract(days, 'days'), endDay)
    }

    resetSearch = () => {
        this.resetParams()
        setTimeout(() => {
            this.props.onSearch()
        }, 0)
    }

    render() {
        const {params, range} = this.props.data_transfer
        const formItemLayout = {
            labelCol: {span: 8},
            wrapperCol: {span: 16},
        }
        const timeFormItemLayout = {
            labelCol: {span: 4},
            wrapperCol: {span: 20},
        }
        return (<div className={styles.searchWrap}>
            <Form
                className={"ant-advanced-search-form " + styles.SearchForm}
                onSubmit={this.handleSearch}>
                <Row gutter={20}>
                    {/*<Col span={6}>*/}
                    {/*<Input placeholder="请输入手机号或者订单号" value={params.keyword}*/}
                    {/*onChange={this.handleChange.bind(this, 'keyword')}/>*/}
                    {/*</Col>*/}
                    {/*<Col span={6}>*/}
                    {/*<Select placeholder="店铺" value={params.store_id + ''}*/}
                    {/*onChange={this.handleChange.bind(this, 'store_id')}>*/}
                    {/*<Option value="">全部【店铺】</Option>*/}
                    {/*{_stores.map((item) => {*/}
                    {/*return <Option value={item.id + ''} key={item.id}>{item.name}</Option>*/}
                    {/*})}*/}
                    {/*</Select>*/}
                    {/*</Col>*/}
                    <Col span={7}>
                        <FormItem {...formItemLayout} label="所属部门：" colon={false}>
                            <DepartmentSelect
                                departmentId={params.department_id}
                                onChange={(value)=>{this.handleChange('department_id', value)}}
                            />
                        </FormItem>
                    </Col>
                    <Col span={7}>
                        <FormItem {...formItemLayout} label="所属员工：" colon={false}>
                            <UserSelect
                                departmentId={params.department_id}
                                userId={params.user_id}
                                onChange={(value)=>{this.handleChange('user_id', value)}}
                            />
                        </FormItem>
                    </Col>
                    <Col span={7}>
                        <FormItem {...formItemLayout} label="所属微信：" colon={false}>
                            <WeChatSelectSingle
                                departmentId={params.department_id}
                                userId={params.user_id}
                                uin={params.uin}
                                onChange={(value)=>{this.handleChange('uin', value)}}
                            />
                        </FormItem>
                    </Col>
                </Row>
                <Row gutter={20}>
                    <Col span={7}>
                        <FormItem {...formItemLayout} label="类型：" colon={false}>
                            <Select placeholder="全部(类型)" value={params.type + ''}
                                onChange={(e)=>{this.handleChange('type', e)}}>
                                <Option value="">全部(类型)</Option>
                                <Option value="1">只看转账</Option>
                                <Option value="2">只看红包</Option>
                                <Option value="3">只看转出</Option>
                                <Option value="4">只看转入</Option>
                                <Option value="5">只看发红包</Option>
                                <Option value="6">只看收红包</Option>
                                <Option value="7">只看无金额红包</Option>
                                <Option value="8">只看人工录入</Option>
                            </Select>
                        </FormItem>
                    </Col>
                    <Col span={7}>
                        <FormItem {...formItemLayout} label="状态：" colon={false}>
                            <Select placeholder="全部(状态)" value={(params.status || '') + ''}
                                onChange={(e)=>{this.handleChange('status', e)}}>
                                <Option value="">全部(状态)</Option>
                                <Option value="1">待收</Option>
                                <Option value="3">已收</Option>
                                <Option value="-1">退回</Option>
                                <Option value="5">非实时已收</Option>
                                <Option value="7">非实时待收</Option>
                                <Option value="0">未知</Option>
                            </Select>
                        </FormItem>
                    </Col>
                </Row>
                <Row gutter={20}>
                    <Col span={11} style={{marginLeft: '19px'}}>
                        <FormItem {...timeFormItemLayout}
                            label="日期："
                            colon={false}
                        >
                            <DateRange {...this.props}
                                ref={(ref)=>{ this.transferTime = ref}}
                                startValue={moment(params.start_time, DateFormat)}
                                endValue={moment(params.end_time, DateFormat)}
                                onChange={this.handleChangeDate}
                                maxToday={true}
                            />
                        </FormItem>
                    </Col>
                    <Radio.Group className={styles.range}
                        value={range}
                        onChange={this.handleChangeTimeRange}
                    >
                        <Radio.Button value="yesterday" className={styles.item}>昨日</Radio.Button>
                        <Radio.Button value="week" className={styles.item}>近7日</Radio.Button>
                        <Radio.Button value="month" className={styles.item}>近30日</Radio.Button>
                    </Radio.Group>
                </Row>
                <Row gutter={20} className={styles.btns}>
                    <Col span={7}>
                        <Col offset={8}>
                            <Button type="primary" icon="search" onClick={this.handleSearch}>搜索</Button>
                            <Button onClick={this.resetSearch}>重置</Button>
                        </Col>
                    </Col>
                </Row>
            </Form>
        </div>)
    }
}

export default Form.create()(SearchForm)
