import React from 'react'
import {connect} from "dva/index"
import {Form, Select, Checkbox, Input, Button, InputNumber} from 'antd'
import numeral from 'numeral'
import moment from 'moment'
import config from 'crm/common/config'
import styles from './index.scss'
import DateRange from "components/DateRange"
import ProvinceCity from 'crm/components/ChinaRegions/ProvinceCity'
import FilterCondition from 'crm/components/MassMsg/FilterCondition'

const FormItem = Form.Item
const CheckboxGroup = Checkbox.Group
const Option = Select.Option

const {DateFormat} = config

@connect(({loading}) => ({
    loading,
}))
export default class Search extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            numErrorMsg: '',
            countErrorMsg: '',
            amountErrorMsg: '',
        }
    }

    componentDidMount() {
        this.loadTags()
    }

    componentWillUnmount() {
        this.props.dispatch({
            type: 'crm_mass_msg_group/resetFilterParams',
        })
    }

    loadTags = () => {
        this.props.dispatch({
            type: 'crm_mass_msg_group/queryTags',
            payload: {},
        })
    };

    handleChange = (key, e, name) => {
        let val = ''
        if (e && e.target) {
            val = e.target.value
        } else {
            val = e
        }
        let params = {...this.props.crm_mass_msg_group.filterParams}
        params[key] = val
        this.props.dispatch({
            type: 'crm_mass_msg_group/setProperty',
            payload: {
                filterParams: params
            },
        })
    }

    handleWeChatChange = (key, e) => {
        let val = ''
        if (e && e.target) {
            val = e.target.value
        } else {
            val = e
        }
        let params = {...this.props.crm_mass_msg_group.filterParams}
        params[key] = val
        if(key === 'province') {
            if(val === ''){
                params.city = ''
            }else {
                if(params.city || params.city === ''){
                    params.city = undefined
                }
            }
        }
        this.props.dispatch({
            type: 'crm_mass_msg_group/setProperty',
            payload: {
                filterParams: params
            },
        })
    }

    handleOrderChange = (key, idx, val) => {
        let params = {...this.props.crm_mass_msg_group.filterParams}
        let _order = {...params.order}

        if (key === 'buy_amount') {
            val = this.checkAmount(key, idx, val)
        }

        // if (key === 'total_num' || key === 'total_count' ) {
        //     val = this.checkCount(key, idx, val)
        // }

        if (key === 'buy_amount') {
            let t = _order[key].split(',')
            t[idx] = val
            if (t.join(',').indexOf(',') === -1) {
                _order[key] = `${t.join(',')},`
            } else {
                _order[key] = t.join(',')
            }
        } else if (key === 'is_not') {
            _order[key] = val.target.checked ? 1 : 0
        } else {
            if (val && val.target) {
                _order[key] = val.target.value
            } else {
                _order[key] = val
            }
        }
        params.order = _order
        this.props.dispatch({
            type: 'crm_mass_msg_group/setProperty',
            payload: {
                filterParams: params
            },
        })
    }

    checkAmount = (key, idx, val) => {
        const amountReg = /^(([1-9]\d{0,8})|0)(\.\d{0,2})?$/ // 0.00 ~ 999999999.99
        let params = {...this.props.crm_mass_msg_group.filterParams}
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

    checkCount = (key, idx, val) => {
        const countReg = /^([1-9]\d{0,4}|0)$/ // 0 ~ 99999
        let params = {...this.props.crm_mass_msg_group.filterParams}
        let _order = {...params.order}
        let errMsg = ''

        if (val === '') {
            if(key === 'total_num'){
                this.setState({
                    numErrorMsg: ''
                })
            }else if(key === 'total_count'){
                this.setState({
                    countErrorMsg: ''
                })
            }
            return val
        }
        let nums = _order[key].split(',')
        if (!countReg.test(val)) {
            val = nums[idx]
        } else {
            let nums = _order[key].split(',')
            if (idx === 0) {
                if (nums[1]) {
                    let end = parseInt(nums[1], 10)
                    if (val > end) {
                        errMsg = '需小于等于结束数量'
                    }
                }
            } else if (idx === 1) {
                if (nums[0]) {
                    let start = parseInt(nums[0], 10)
                    if (val < start) {
                        errMsg = '需大于等于开始数量'
                    }
                }
            }
            if (key === 'total_num') {
                this.setState({
                    numErrorMsg: errMsg
                })
            } else if (key === 'total_count') {
                this.setState({
                    countErrorMsg: errMsg
                })
            }
        }
        return val
    }

    handleTimeChange = (key, startValue, endValue) => {
        let params = {...this.props.crm_mass_msg_group.filterParams}
        startValue = startValue ? moment(startValue).format(DateFormat) + ' 00:00:00' : ''
        endValue = endValue ? moment(endValue).format(DateFormat) + ' 23:59:59' : ''
        params[key] = `${startValue},${endValue}`
        this.props.dispatch({
            type: 'crm_mass_msg_group/setProperty',
            payload: {
                filterParams: params
            },
        })
    }

    handleOrderTimeChange = (key, startValue, endValue) => {
        let params = {...this.props.crm_mass_msg_group.filterParams}
        startValue = startValue ? moment(startValue).format(DateFormat) + ' 00:00:00' : ''
        endValue = endValue ? moment(endValue).format(DateFormat) + ' 23:59:59' : ''
        let value = `${startValue},${endValue}`
        let _order = {...params.order}
        _order[key] = value
        params.order = _order
        this.props.dispatch({
            type: 'crm_mass_msg_group/setProperty',
            payload: {
                filterParams: params
            },
        })
    }

    handleFilter = () => {
        this.props.dispatch({
            type: 'crm_mass_msg_group/setProperty',
            payload: {
                step: 2
            },
        })
    }

    render() {
        const formItemLayout = {
            labelCol: {span: 7},
            wrapperCol: {span: 14},
        }

        const {style} = this.props
        const {filterParams: params, tags } = this.props.crm_mass_msg_group

        const {numErrorMsg, countErrorMsg, amountErrorMsg} = this.state

        const getTagsOptions = () => {
            let options = []
            tags.forEach((item) => {
                options.push(<Option value={item.name} key={item.id}>{item.name}</Option>)
            })
            return options
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

        const createTime = params.create_time.split(',')
        const orderCreateTime = params.order.order_create_time.split(',')

        return (
            <div className={styles.filterWrap} style={style}>
                <div className={styles.condition}>
                    <h2 className={styles.title}>筛选条件</h2>
                    <Form>
                        <div className={styles.box}>
                            <h3 className={styles.subTitle}>客户信息</h3>
                            <FormItem {...formItemLayout} label="创建时间：" colon={false}>
                                <DateRange
                                    {...this.props}
                                    maxToday={true}
                                    style={{display: 'inline-flex', alignItems: 'center'}}
                                    startValue={createTime[0] ? moment(createTime[0], DateFormat) : ''}
                                    endValue={createTime[1] ? moment(createTime[1], DateFormat) : ''}
                                    onChange={(startValue, endValue) => {
                                        this.handleTimeChange('create_time', startValue, endValue)
                                    }}
                                />
                            </FormItem>
                            <FormItem {...formItemLayout} label="地区：" colon={false}>
                                <ProvinceCity
                                    provinceName={params.province}
                                    cityName={params.city}
                                    handleChange={(key, e) => this.handleWeChatChange(key, e)}
                                />
                            </FormItem>
                            <FormItem {...formItemLayout} label="客户性别：" colon={false}>
                                <CheckboxGroup value={params.sexes}
                                    onChange={(e)=>{this.handleWeChatChange('sexes', e)}}
                                >
                                    <Checkbox value={0}>未知</Checkbox>
                                    <Checkbox value={1}>男</Checkbox>
                                    <Checkbox value={2}>女</Checkbox>
                                </CheckboxGroup>
                            </FormItem>
                            <FormItem {...formItemLayout} label="备注包含：" colon={false}>
                                <Input placeholder="包含备注"
                                    value={params.remark}
                                    onChange={(e)=>{this.handleWeChatChange('remark', e)}}
                                />
                            </FormItem>
                            <FormItem {...formItemLayout} label="备注不包含：" colon={false}>
                                <Input placeholder="不包含备注"
                                    value={params.exclude_remark}
                                    onChange={(e)=>{this.handleWeChatChange('exclude_remark', e)}}
                                />
                            </FormItem>
                            <FormItem {...formItemLayout} label="包含标签：" colon={false} className={styles.tagForm}>
                                <Select
                                    optionFilterProp="children"
                                    onChange={(e) => {
                                        this.handleChange('tag', e)
                                    }}
                                    placeholder="包含标签"
                                    mode="multiple"
                                    value={params.tag && params.tag || []}
                                    tokenSeparators={[',']}
                                >
                                    {getTagsOptions()}
                                </Select>
                            </FormItem>
                            <FormItem {...formItemLayout} label="不包含标签：" colon={false} className={styles.tagForm}>
                                <Select
                                    optionFilterProp="children"
                                    onChange={(e) => {
                                        this.handleChange('exclude_tag', e)
                                    }}
                                    placeholder="不包含标签"
                                    mode="multiple"
                                    value={params.exclude_tag && params.exclude_tag || []}
                                    tokenSeparators={[',']}
                                >
                                    {getTagsOptions()}
                                </Select>
                            </FormItem>
                        </div>
                        <h3 className={styles.subTitle}>订单信息</h3>
                        <Checkbox
                            className={styles.not}
                            checked={!!params.order.is_not}
                            onChange={(e)=>{this.handleOrderChange('is_not', '', e)}}>
                            排除以下订单条件
                        </Checkbox>
                        <FormItem  {...formItemLayout} label="商品名称：" colon={false}>
                            <Input placeholder="请输入商品名称"
                                value={params.order.product_name}
                                onChange={(e) => {
                                    this.handleOrderChange('product_name', '', e)
                                }}
                            />
                        </FormItem>
                        <FormItem  {...formItemLayout} label="订单金额：" colon={false}>
                            <InputNumber className={styles.ipt}
                                min={0.00}
                                max={999999999.99}
                                step={0.1}
                                placeholder="元"
                                onChange={(e) => {
                                    this.handleOrderChange('buy_amount', 0, e)
                                }}
                                value={getVal('order', 'buy_amount', 0)}
                            />
                            <span className={styles.sp}>~</span>
                            <InputNumber className={styles.ipt}
                                min={0.00}
                                max={999999999.99}
                                step={0.1}
                                placeholder="元"
                                onChange={(e) => {
                                    this.handleOrderChange('buy_amount', 1, e)
                                }}
                                value={getVal('order', 'buy_amount', 1)}
                            />
                            {getVal('order', 'buy_amount', 0) || getVal('order', 'buy_amount', 1) && amountErrorMsg ?
                                <span className={styles.errMsg}>{amountErrorMsg}</span> : ''}
                        </FormItem>
                        <FormItem {...formItemLayout} label="订单时间：" colon={false}>
                            <DateRange
                                {...this.props}
                                maxToday={true}
                                style={{display: 'inline-flex', alignItems: 'center'}}
                                startValue={orderCreateTime[0] ? moment(orderCreateTime[0], DateFormat) : ''}
                                endValue={orderCreateTime[1] ? moment(orderCreateTime[1], DateFormat) : ''}
                                onChange={(startValue, endValue) => {
                                    this.handleOrderTimeChange('order_create_time', startValue, endValue)
                                }}
                            />
                        </FormItem>
                        {/*<FormItem  {...formItemLayout} label="累计交易次数：" colon={false}>*/}
                        {/*<InputNumber className={styles.ipt}*/}
                        {/*min={0}*/}
                        {/*max={99999}*/}
                        {/*parser={value => value.replace(/\D/g, '')}*/}
                        {/*placeholder="次"*/}
                        {/*onChange={(e)=>{this.handleOrderChange('total_num', 0, e)}}*/}
                        {/*value={getVal('order', 'total_num', 0)}*/}
                        {/*/>*/}
                        {/*<span className={styles.sp}>~</span>*/}
                        {/*<InputNumber className={styles.ipt}*/}
                        {/*min={0}*/}
                        {/*max={99999}*/}
                        {/*parser={value => value.replace(/\D/g, '')}*/}
                        {/*placeholder="次"*/}
                        {/*onChange={(e)=>{this.handleOrderChange('total_num', 1, e)}}*/}
                        {/*value={getVal('order', 'total_num', 1)}*/}
                        {/*/>*/}
                        {/*{  getVal('order', 'total_num', 0) || getVal('order', 'total_num', 1) && numErrorMsg ? <span className={styles.errMsg}>{numErrorMsg}</span> : ''}*/}
                        {/*</FormItem>*/}
                        {/*<FormItem {...formItemLayout} label="累计购买商品数" colon={false}>*/}
                        {/*<InputNumber className={styles.ipt}*/}
                        {/*min={0}*/}
                        {/*max={99999}*/}
                        {/*parser={value => value.replace(/\D/g, '')}*/}
                        {/*placeholder="件"*/}
                        {/*onChange={(e)=>{this.handleOrderChange('total_count', 0, e)}}*/}
                        {/*value={getVal('order', 'total_count', 0)}*/}
                        {/*/>*/}
                        {/*<span className={styles.sp}>~</span>*/}
                        {/*<InputNumber className={styles.ipt}*/}
                        {/*min={0}*/}
                        {/*max={99999}*/}
                        {/*parser={value => value.replace(/\D/g, '')}*/}
                        {/*placeholder="件"*/}
                        {/*onChange={(e)=>{this.handleOrderChange('total_count', 1, e)}}*/}
                        {/*value={getVal('order', 'total_count', 1)}*/}
                        {/*/>*/}
                        {/*{  getVal('order', 'total_count', 0) || getVal('order', 'total_count', 1) && countErrorMsg ? <span className={styles.errMsg}>{countErrorMsg}</span> : ''}*/}
                        {/*</FormItem>*/}
                        <FormItem {...formItemLayout} label=" " colon={false}>
                            <Button type="primary" onClick={this.handleFilter}>筛选好友</Button>
                        </FormItem>
                    </Form>
                </div>
                <div className={styles.result}>
                    <h2 className={styles.title}>已选条件</h2>
                    <FilterCondition {...this.props} params={params}/>
                </div>
            </div>
        )
    }
}
