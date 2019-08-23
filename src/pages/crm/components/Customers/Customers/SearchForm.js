'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: liyan [zhanghedong@gmail.com]
 * 创建日期: 18/08/20
 */
import React from 'react'
import {
    Row,
    Col,
    Input,
    InputNumber,
    Form,
    Button,
    Icon,
    Select,
    Checkbox,
    Popover,
} from 'antd'
import moment from 'moment'
import numeral from 'numeral'
import _ from 'lodash'
import config from 'crm/common/config'
import styles from './SearchForm.scss'
import {province as provinceData} from 'crm/components/ChinaRegions/province'
import {city as cityData} from 'crm/components/ChinaRegions/city'
import 'moment/locale/zh-cn'
import DateRange from "components/DateRange"
import DepartmentSelect from 'components/business/DepartmentSelect'
import UserSelect from 'components/business/UserSelect'
import WeChatSelectSingle from 'components/business/WeChatSelectSingle'
import TagSelect from 'components/business/TagSelect'
moment.locale('zh-cn')

const Option = Select.Option
const FormItem = Form.Item

const {DateFormat} = config

class SearchForm extends React.Component {
    constructor(props) {
        super()
        this.state = {
            showSearch: false,
            numErrorMsg: '',
            amountErrorMsg: '',
        }
    }

    componentDidMount() {
    }

    componentWillUnmount() {
        this.resetParams({})
    }

    handleSearch = (e) => {
        e.preventDefault()
        let {numErrorMsg, amountErrorMsg} = this.state
        if(numErrorMsg || amountErrorMsg){
            return
        }
        let params = {...this.props.crm_customers.params}
        params.province = params.province_id && params.province_id !=='0'
            ? provinceData.find((item)=>{return item.id === params.province_id }).name : params.province_id === '0' ? undefined : ''
        params.city = params.city === '0' ? undefined : params.city
        this.props.dispatch({
            type: 'crm_customers/setParams',
            payload: params,
        })
        setTimeout(() => {
            this.props.onSearch()
        }, 100)
    };

    handleChange = (key, e) => {
        let val = ''
        if (e && e.target) {
            val = e.target.value
        } else {
            val = e
        }

        let params = {...this.props.crm_customers.params}
        if (key === 'province_id') {
            //切换省份清除地市
            if (val !== params.province_id) {
                if(val === ''){ // 未知
                    params.city = ''
                }else { // 全部
                    params.city = '0'
                }
            }
            params['province_id'] = val
        }else if(key === 'wechat'){
            let wechat = {...params.wechat} || {}
            wechat['query'] = val
            params[key] = wechat
        } else {
            params[key] = val
            if (key === 'department_id') {
                params['user_id'] = undefined
                params['service_wx_id'] = undefined
            } else if (key === 'user_id') {
                params['service_wx_id'] = undefined
            }
        }
        this.props.dispatch({
            type: 'crm_customers/setParams',
            payload: params,
        })
    };

    handleChangeCreateDate = (startValue, endValue) => {
        let params = {...this.props.crm_customers.params}
        if (startValue) {
            params.create_time_from = moment(startValue).format(DateFormat) + ' 00:00:00'
        } else {
            params.create_time_from = ''
        }
        if (endValue) {
            params.create_time_to = moment(endValue).format(DateFormat) + ' 23:59:59'
        } else {
            params.create_time_to = ''
        }
        this.props.dispatch({
            type: 'crm_customers/setParams',
            payload: params
        })
    }

    handleMemberChange = (key, idx, val) => {
        let params = {...this.props.crm_customers.params}
        let _member = {...params.member}
        val = val && val.target ? val.target.value : val
        if (idx === '') {
            _member[key] = val
        } else {
            let t = _member[key].split(',')
            t[idx] = val
            _member[key] = t.join(',')
        }
        params.member = _member
        this.props.dispatch({
            type: 'crm_customers/setParams',
            payload: params,
        })
    };

    handleTimeChange = (key, startValue, endValue) => {
        let params = {...this.props.crm_customers.params}
        startValue = startValue ? moment(startValue).format(DateFormat) + ' 00:00:00' : ''
        endValue = endValue ? moment(endValue).format(DateFormat) + ' 23:59:59' : ''
        let value = `${startValue},${endValue}`
        if(key === 'order_create_time'){
            let _order = {...params.order}
            _order[key] = value
            params.order = _order
        }else if(key === 'create_time'){
            params[key] = value
        }
        this.props.dispatch({
            type: 'crm_customers/setParams',
            payload: params,
        })
    }

    handleOrderChange = (key, idx, val) => {
        let params = {...this.props.crm_customers.params}
        let _order = {...params.order}

        if (key === 'buy_count') {
            val = this.checkBuyCount(key, idx, val)
        }
        if (key === 'buy_amount') {
            val = this.checkBuyAmount(key, idx, val)
        }

        if (key === 'buy_count' || key === 'buy_amount' || key === 'total_amount' || key === 'average_amount') {
            let t = _order[key].split(',')
            t[idx] = val
            if(t.join(',').indexOf(',') === -1){
                _order[key] = `${t.join(',')},`
            }else {
                _order[key] = t.join(',')
            }
        } else if (key === 'is_not') {
            _order[key] = val.target.checked
        } else {
            if (val && val.target) {
                _order[key] = val.target.value
            } else {
                _order[key] = val
            }
        }
        params.order = _order
        this.props.dispatch({
            type: 'crm_customers/setParams',
            payload: params,
        })
    };

    checkBuyCount = (key, idx, val) => {
        const numReg = /^[1-9]\d{0,5}$/ // 1 ~ 999999
        let params = {...this.props.crm_customers.params}
        let _order = {...params.order}
        let numErrorMsg = ''
        if (!val) {
            this.setState({
                numErrorMsg: ''
            })
            return val
        }
        if (!numReg.test(val)) {
            val = ''
        } else {
            let nums = _order[key].split(',')
            if (idx === 0) {
                if (nums[1]) {
                    let end = parseInt(nums[1], 10)
                    if (val > end) {
                        numErrorMsg = '需小于等于结束数量'
                    }
                }
            } else if (idx === 1) {
                if (nums[0]) {
                    let start = parseInt(nums[0], 10)
                    if (val < start) {
                        numErrorMsg = '需大于等于开始数量'
                    }
                }
            }
            this.setState({
                numErrorMsg: numErrorMsg
            })
        }
        return val
    }

    checkBuyAmount = (key, idx, val) => {
        const amountReg = /^(([1-9]\d{0,8})|0)(\.\d{0,2})?$/ // 0.00 ~ 999999999.99
        let params = {...this.props.crm_customers.params}
        let _order = {...params.order}
        let amountErrorMsg = ''
        if (val === '') {
            this.setState({
                amountErrorMsg: ''
            })
            return val
        }
        let nums = _order[key].split(',')
        if (!amountReg.test(val)) {
            val = nums[idx]
        } else {
            if (idx === 0) {
                if (nums[1]) {
                    let end = nums[1]
                    if (numeral(val).subtract(end).value() > 0) {
                        amountErrorMsg = '需小于等于结束金额'
                    }
                }
            } else if (idx === 1) {
                if (nums[0]) {
                    let start = nums[0]
                    if (numeral(start).subtract(val).value() > 0) {
                        amountErrorMsg = '需大于等于开始金额'
                    }
                }
            }
            this.setState({
                amountErrorMsg: amountErrorMsg
            })
        }
        return val
    }

    getVal = (key, idx) => {
        let params = {...this.props.crm_customers.params}
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

    handleToggleSearch = () => {
        this.setState({showSearch: !this.state.showSearch})
    }

    resetParams = (payload) => {
        this.props.dispatch({
            type: 'crm_customers/resetParams',
            payload: payload
        })
        this.refs.customerCreateTime.setDate(null, null)
        this.refs.customerOrderTime.setDate(null, null)
    };

    resetSearch = () => {
        const payload = {
            limit: this.props.crm_customers.params.limit
        }
        this.resetParams(payload)
        setTimeout(() => {
            this.props.onSearch()
        }, 0)
    }

    render() {
        const {initData: config} = this.props.base
        const {params} = this.props.crm_customers
        const formItemLayout = {
            labelCol: {span: 8},
            wrapperCol: {span: 16},
        }
        const getVal = (_type, key, idx) => {
            if (params[_type][key]) {
                let t = params[_type][key].split(',')
                if (t.length > idx) {
                    return t[idx]
                } else {
                    return ''
                }
            } else {
                return ''
            }
        }
        // const {endOpen} = this.state
        //////////省市////////
        let provinceOptions = []
        provinceData.map((province) => {
            provinceOptions.push(<Option key={province.id}
                                         value={province.id}>{province.name}</Option>)
        })
        let cityOptions = [], _cities = []
        if (params.province_id && params.province_id !== '0') {
            _cities = cityData[params.province_id]
        }
        _cities.map(city => {
            return cityOptions.push(<Option key={city.name} value={city.name}>{city.name}</Option>)
        })
        ///////////
        const getStoreTypeOptions = () => {
            let options = [<Option key="all" value="" label="全部[商城类型]">全部[商城类型]</Option>]
            let _types = config.store_types || []
            _types.forEach((item) => {
                options.push(<Option key={item.id + ''} value={item.id + ''}
                                     label={item.name}>{item.name}</Option>)
            })
            return options
        }

        const orderCreateTime = _.get(params, 'order.order_create_time', '').split(',')
        const createTime = params.create_time.split(',')

        const {numErrorMsg, amountErrorMsg} = this.state

        const reverseContent = <div className={styles.reverseContent}>
            <img src={require('crm/assets/images/customer_desc.png')} alt="说明"/>
        </div>

        return (<div className={styles.searchWrap}>
            <Form className={"ant-advanced-search-form " + styles.SearchForm}>
                <Row gutter={20}>
                    <Col span={8}>
                        <FormItem {...formItemLayout} label="搜索微信信息：" colon={false}>
                            <Input placeholder="昵称、微信备注" value={params.wechat.query}
                                   onPressEnter={this.handleSearch}
                                   onChange={(e)=>{this.handleChange('wechat', e)}}/>
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem {...formItemLayout} label="搜索客户信息：" colon={false}>
                            <Input placeholder="输入姓名、手机号" value={params.query}
                                   onPressEnter={this.handleSearch}
                                   onChange={(e)=>{this.handleChange('query', e)}}/>
                        </FormItem>
                    </Col>
                    <Col span={8} className={styles.timeItem}>
                        <FormItem {...formItemLayout} label="创建时间：" colon={false}>
                            <DateRange
                                ref="customerCreateTime"
                                {...this.props}
                                maxToday={true}
                                style={{display: 'inline-flex', alignItems: 'center'}}
                                startPlaceholder="创建时间"
                                endPlaceholder="创建时间"
                                startValue={createTime[0] ? moment(createTime[0], DateFormat) : ''}
                                endValue={createTime[1] ? moment(createTime[1], DateFormat) : ''}
                                onChange={(startValue, endValue)=>{this.handleTimeChange('create_time', startValue, endValue)}}
                            />
                        </FormItem>
                    </Col>
                </Row>
                <Row gutter={20}>
                    <Col span={8}>
                        <FormItem {...formItemLayout} label="所属部门：" colon={false}>
                            <DepartmentSelect
                                departmentId={params.department_id}
                                onChange={(value)=>{this.handleChange('department_id', value)}}
                            />
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem {...formItemLayout} label="所属员工：" colon={false}>
                            <UserSelect
                                departmentId={params.department_id}
                                userId={params.user_id}
                                onChange={(value)=>{this.handleChange('user_id', value)}}
                            />
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem {...formItemLayout} label="所属微信：" colon={false}>
                            <WeChatSelectSingle
                                departmentId={params.department_id}
                                userId={params.user_id}
                                field="username"
                                username={params.service_wx_id}
                                onChange={(value)=>{this.handleChange('service_wx_id', value)}}
                            />
                        </FormItem>
                    </Col>
                </Row>
                <Row gutter={20}>
                    <Col span={8}>
                        <FormItem {...formItemLayout} label="包含标签：" colon={false} className={styles.tagForm}>
                            <TagSelect placeholder="包含标签"
                                       values={params.tag && params.tag || []}
                                       onChange={(e)=>this.handleChange('tag', e)}
                            />
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem {...formItemLayout} label="不包含标签：" colon={false} className={styles.tagForm}>
                            <TagSelect placeholder="不包含标签"
                                       values={params.exclude_tag && params.exclude_tag || []}
                                       onChange={(e)=>{this.handleChange('exclude_tag', e)}}
                            />
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem {...formItemLayout} label="备注：" colon={false}>
                            <Col span={11}>
                                <Input placeholder="包含备注" value={params.remark}
                                       onPressEnter={this.handleSearch}
                                       onChange={(e)=>{this.handleChange('remark', e)}}/>
                            </Col>
                            <Col span={2}/>
                            <Col span={11}>
                                <Input placeholder="不包含备注" value={params.exclude_remark}
                                       onPressEnter={this.handleSearch}
                                       onChange={(e)=>{this.handleChange('exclude_remark', e)}}/>
                            </Col>
                        </FormItem>
                    </Col>
                </Row>
                <Row gutter={20}>
                    <Col span={8}>
                        <FormItem {...formItemLayout} label="性别：" colon={false}>
                            <Select placeholder="全部[性别]" value={params.gender + ''}
                                    onChange={(e)=>{this.handleChange('gender', e)}}>
                                <Option value="">全部[性别]</Option>
                                <Option value="1">男</Option>
                                <Option value="2">女</Option>
                                <Option value="0">未知</Option>
                            </Select>
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem {...formItemLayout} label="省：" colon={false}>
                            <Select defaultValue="0"
                                    value={params.province_id}
                                    onChange={(e)=>{this.handleChange('province_id', e)}}>
                                <Option value="0">全部[省份]</Option>
                                <Option value="">未知</Option>
                                {provinceOptions}
                            </Select>
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem {...formItemLayout} label="市：" colon={false}>
                            <Select defaultValue="0"
                                    value={params.city === undefined ? '0' : params.city}
                                    onChange={(e)=>{this.handleChange('city', e)}}>
                                {params.province_id !== '' ? <Option value="0">全部[城市]</Option> : ''}
                                {params.province_id !== '0' ? <Option value="">未知</Option> : ''}
                                {cityOptions}
                            </Select>
                        </FormItem>
                    </Col>
                </Row>
                <Row gutter={20}>
                    <Col span={8}>
                        <FormItem {...formItemLayout} label="商城类型：" colon={false}>
                            <Select
                                onChange={(e)=>{this.handleMemberChange('platform', '', e)}}
                                placeholder="商城类型"
                                value={params.member.platform + ''}>
                                {getStoreTypeOptions()}
                            </Select>
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem {...formItemLayout} label="购物账号：" colon={false}>
                            <Input placeholder="购物账号"
                                   value={params.member.name}
                                   onChange={(e) => {
                                       this.handleMemberChange('name', '', e)
                                   }}
                            />
                        </FormItem>
                    </Col>
                </Row>
                <div className={styles.orderFilter} style={{display: this.state.showSearch ? 'block' : 'none'}}>
                    <Row gutter={20}>
                        <Col span={16}>
                            <Col offset={4}>
                                <Checkbox
                                    className={styles.not}
                                    checked={!!params.order.is_not}
                                    onChange={(e)=>{this.handleOrderChange('is_not', '', e)}}>
                                    排除以下订单条件<Popover placement="right" content={reverseContent}>
                                    <Icon type="question-circle-o" className={styles.questionCircle}/>
                                </Popover>
                                </Checkbox>
                            </Col>
                        </Col>
                    </Row>
                    <Row gutter={20}>
                        <Col span={8}>
                            <FormItem  {...formItemLayout} label="交易金额：" colon={false}>
                                <InputNumber className={styles.ipt}
                                             min={0.00}
                                             max={999999999.99}
                                             step={0.1}
                                             onChange={(e)=>{this.handleOrderChange('buy_amount', 0, e)}}
                                             value={getVal('order', 'buy_amount', 0)}
                                             placeholder="元"/>
                                <span className={styles.sp}>~</span>
                                <InputNumber className={styles.ipt}
                                             min={0.00}
                                             max={999999999.99}
                                             step={0.1}
                                             onChange={(e)=>{this.handleOrderChange('buy_amount', 1, e)}}
                                             value={getVal('order', 'buy_amount', 1)}
                                             placeholder="元"/>
                                {  getVal('order', 'buy_amount', 0) || getVal('order', 'buy_amount', 1) && amountErrorMsg ? <span className={styles.errMsg}>{amountErrorMsg}</span> : ''}
                            </FormItem>

                        </Col>
                        <Col span={8}>
                            <FormItem  {...formItemLayout} label="商品名称：" colon={false}>
                                <Input placeholder="输入商品名称" value={params.order.product_name}
                                       onPressEnter={this.handleSearch}
                                       onChange={(e)=>{this.handleOrderChange('product_name', '', e)}}/>
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem  {...formItemLayout} label="订单号：" colon={false}>
                                <Input placeholder="请输入订单号"
                                       onChange={(e)=>{this.handleOrderChange('order_no', '', e)}}
                                       value={params.order.order_no}
                                />
                            </FormItem>
                        </Col>
                        {/*<Col span={8}>*/}
                        {/*<FormItem  {...formItemLayout} label="交易次数：">*/}
                        {/*<InputNumber size="default" className={styles.ipt}*/}
                        {/*onChange={(e)=>{this.handleMemberChange('total_count', 0, e)}}*/}
                        {/*value={getVal('member', 'total_count', 0)}*/}
                        {/*placeholder="次"/>*/}
                        {/*<span className={styles.sp}>~</span>*/}
                        {/*<InputNumber size="default" className={styles.ipt}*/}
                        {/*onChange={(e)=>{this.handleMemberChange('total_count', 1, e)}}*/}
                        {/*value={getVal('member', 'total_count', 1)}*/}
                        {/*placeholder="次"/>*/}
                        {/*</FormItem>*/}
                        {/*</Col>*/}
                        {/*<Col span={8}>*/}
                        {/*<FormItem  {...formItemLayout} label="平均订单金额：">*/}
                        {/*<InputNumber size="default" className={styles.ipt}*/}
                        {/*onChange={(e)=>{this.handleMemberChange('average_amount', 0, e)}}*/}
                        {/*value={getVal('member', 'average_amount', 0)}*/}
                        {/*placeholder="元"/>*/}
                        {/*<span className={styles.sp}>~</span>*/}
                        {/*<InputNumber size="default" className={styles.ipt}*/}
                        {/*onChange={(e)=>{this.handleMemberChange('average_amount', 1, e)}}*/}
                        {/*value={getVal('member', 'average_amount', 1)}*/}
                        {/*placeholder="元"/>*/}
                        {/*</FormItem>*/}
                        {/*</Col>*/}
                    </Row>
                    <Row gutter={20}>
                        <Col span={8}>
                            <FormItem  {...formItemLayout} label="商品数量：" colon={false}>
                                <InputNumber className={styles.ipt}
                                             min={1}
                                             onChange={(e)=>{this.handleOrderChange('buy_count', 0, e)}}
                                             value={getVal('order', 'buy_count', 0)}
                                             placeholder="个"/>
                                <span className={styles.sp}>~</span>
                                <InputNumber className={styles.ipt}
                                             min={1}
                                             onChange={(e)=>{this.handleOrderChange('buy_count', 1, e)}}
                                             value={getVal('order', 'buy_count', 1)}
                                             placeholder="个"/>
                                {  getVal('order', 'buy_count', 0) || getVal('order', 'buy_count', 1) && numErrorMsg ? <span className={styles.errMsg}>{numErrorMsg}</span> : ''}
                            </FormItem>
                        </Col>
                        <Col span={8} className={styles.timeItem}>
                            <FormItem  {...formItemLayout} label="订单时间：" colon={false}>
                                <DateRange
                                    {...this.props}
                                    ref="customerOrderTime"
                                    maxToday={true}
                                    style={{display: 'inline-flex', alignItems: 'center'}}
                                    startPlaceholder="创建时间"
                                    endPlaceholder="创建时间"
                                    startValue={orderCreateTime[0] ? moment(orderCreateTime[0], DateFormat) : ''}
                                    endValue={orderCreateTime[1] ? moment(orderCreateTime[1], DateFormat) : ''}
                                    onChange={(startValue, endValue)=>{this.handleTimeChange('order_create_time', startValue, endValue ) }}
                                />
                                {/*<DatePicker*/}
                                {/*disabledDate={this.disabledStartDate}*/}
                                {/*showTime*/}
                                {/*format="YYYY-MM-DD"*/}
                                {/*placeholder="订单日期开始"*/}
                                {/*onChange={(e)=>{this.handleOrderChange('order_create_time', 0, e)}}*/}
                                {/*onOpenChange={this.handleStartOpenChange}*/}
                                {/*/>*/}
                                {/*<span style={{display: 'inline-block', margin: '0 8px'}}>~</span>*/}
                                {/*<DatePicker*/}
                                {/*disabledDate={this.disabledEndDate}*/}
                                {/*showTime*/}
                                {/*format="YYYY-MM-DD"*/}
                                {/*placeholder="订单结束时间"*/}
                                {/*onChange={(e)=>{this.handleOrderChange('order_create_time', 1, e)}}*/}
                                {/*open={endOpen}*/}
                                {/*onOpenChange={this.handleEndOpenChange}*/}
                                {/*/>*/}
                            </FormItem>
                        </Col>
                    </Row>
                </div>
                <Row gutter={20}>
                    <Col span={8}>
                        <Col offset={8}>
                            <span className={styles.advance}
                                  onClick={this.handleToggleSearch}
                            >
                                高级搜索<Icon type={this.state.showSearch ? 'up' : 'down'}/>
                            </span>
                        </Col>
                    </Col>
                </Row>
                <Row gutter={20} className={styles.searchBtn}>
                    <Col span={8}>
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
