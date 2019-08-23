import React from 'react'
import {connect} from 'dva'
import documentTitleDecorator from 'hoc/documentTitle'
import Page from '../../../../components/business/Page'
import { Icon, Form, Row, Col, Button, Radio, DatePicker, Checkbox, Popover, Spin, message } from 'antd'
import styles from './index.less'
import moment from 'moment'
import ExportRecord from './export_record'
import DepartmentSelect from 'components/business/DepartmentSelect'
import UserSelect from 'components/business/UserSelect'
import WeChatSelectSingle from 'components/business/WeChatSelectSingle'

const RadioButton = Radio.Button
const RadioGroup = Radio.Group
const CheckboxGroup = Checkbox.Group
const { MonthPicker, WeekPicker } = DatePicker
const DEFAULT_PARAMS = {
    department_id: undefined,
    user_id: undefined,
    service_wx_id: undefined, 
}

const DEFAULT_OPTION = {
    customerOptions: [
        { label: '好友总数', value: 'friend_count' },
        { label: '新好友数', value: 'new_friend_count' },
        { label: '好友流失数', value: 'lost_friend_count' },
        { label: '群总数', value: 'group_count' },
        { label: '群成员总数', value: 'group_member_count' },
    ],
    transactionOptions: [
        { label: '客户绑定总数', value: 'member_bind_count' },
        { label: '新绑定客户数', value: 'new_member_bind_count' }
    ],
    relationOptions: [
        { label: '私聊好友（发送）', value: 'chat_member_send_count' },
        { label: '私聊好友（接收）', value: 'chat_member_receive_count' },
        { label: '私聊消息（发送）', value: 'chat_messages_send_count' },
        { label: '私聊消息（接收）', value: 'chat_messages_receive_count' },
        { label: '群消息数', value: 'chat_room_talk_count' },
    ],
    marketOptions: [
        { label: '发圈数', value: 'moment_count' },
        { label: '点赞数', value: 'like_count' },
        { label: '评论数', value: 'comment_count' },
        { label: '小红包笔数', value: 'red_package_count' },
        { label: '小红包金额', value: 'red_package_price_count' },
        { label: '语音红包笔数', value: 'partner_red_package_count' },
        { label: '语音红包金额', value: 'partner_red_package_price_count' }
    ],
    transaction_statOptions: [
        { label: '下单客户数', value: 'customer_count' },
        { label: '下单金额', value: 'customer_price_count' },
        { label: '下单新客数', value: 'new_customer_count' },
        { label: '新客下单金额', value: 'new_customer_price_count' }
    ]
}
const DEFAULT_CHECK = {
    customer: DEFAULT_OPTION.customerOptions.map(i=>i.value),
    transaction: DEFAULT_OPTION.transactionOptions.map(i=>i.value),
    relation: DEFAULT_OPTION.relationOptions.map(i=>i.value),
    market: DEFAULT_OPTION.marketOptions.map(i=>i.value),
    transaction_stat: DEFAULT_OPTION.transaction_statOptions.map(i=>i.value),
    customerInde: false,
    customerCheckAll: true,
    transactionInde: false,
    transactionCheckAll: true,
    relationCheckAll: true,
    relationInde: false,
    marketCheckAll: true,
    marketInde: false,
    transaction_statCheckAll: true,
    transaction_statInde: false,  
}

@documentTitleDecorator()
@Form.create()
@connect(({ base, weixin_analysis }) => ({
    base, weixin_analysis
}))

export default class Index extends React.Component {
    state = {
        iconLoading: false,
        modalVisiable: false,
        type: 'week',   //mouth or week
        params: {...DEFAULT_PARAMS},
        checkParams: {...DEFAULT_CHECK},
    }

    onCheckAllChange = (key, e)=>{
        let val = e.target.checked
        let { checkParams } = this.state
        let arr = []
        const newArr = DEFAULT_OPTION[`${key}Options`]
        newArr.forEach((item, key)=>{
            arr.push(item.value)
        })
        checkParams[key] = [...(val ? arr : [])]
        checkParams[`${key}CheckAll`] = val
        checkParams[`${key}Inde`] = false
        this.setState({
            checkParams: {...checkParams}
        })
    }
    onCheckChange = (key, list)=>{
        let { checkParams } = this.state
        checkParams[key] = list
        if(list.length === DEFAULT_OPTION[`${key}Options`].length){
            checkParams[`${key}Inde`] = false
            checkParams[`${key}CheckAll`] = true
        }else{
            checkParams[`${key}Inde`] = !!list.length ? true : false
            checkParams[`${key}CheckAll`] = false
        }
        this.setState({
            checkParams: {...checkParams}
        })
    }
    handleChange = (key, e)=>{
        let val = ''
        if (e && e.target) {
            val = e.target.value
        } else {
            val = e
        }
        let { params } = this.state
        params[key] = val
        if (key === 'department_id') {
            params['user_id'] = undefined
            params['service_wx_id'] = undefined
        } else if (key === 'user_id') {
            params['service_wx_id'] = undefined
        }
        this.setState({
            params: {...params}
        })
    }
    changeType = (e)=>{
        const val = e.target.value
        this.setState({
            type: val
        },()=>{
            this.props.form.setFieldsValue({
                report_at: val === 'month' ? moment().subtract(1, 'months') : moment().subtract(1, 'weeks')
            })
        })
    }

    getWechatReport = ()=>{
        this.props.form.validateFields((error, values)=>{
            let report_at = ''
            if(values.report_at){
                let val = values.report_at
                let type = values.type
                let year = moment(val).get('year')
                if(type === 'week'){
                    let week = moment(val).week()
                    report_at = `${year}-${week}周`
                }else{
                    let month = moment(val).get('month') + 1
                    report_at = `${year}-${month}月`
                }
            }
            const { params, checkParams } = this.state
            const {customer, market,  relation, transaction, transaction_stat} = checkParams
            console.log(customer, market,  relation, transaction, transaction_stat)
            console.log(customer.length === market.length === relation.length === transaction.length === transaction_stat.length === 0)
            if(customer.length === 0 && market.length ===0 && relation.length ===0 && transaction.length ===0 && transaction_stat.length === 0){
                message.warn('请选择条件后导出')
                return
            }
            const payload = {
                ...checkParams,
                department: {
                    id: params.department_id
                },
                employees: {
                    id: params.user_id
                },
                wx: {
                    id: params.service_wx_id
                },
                report_at: report_at
            } 
            this.setState({iconLoading: true})
            // console.log(payload)
            this.props.dispatch({
                type: 'weixin_analysis/getWechatReport',
                payload: payload,
                callback: ()=>{
                    message.success('导出数据已在队列中，请在导出记录中查看下载 ')
                    this.setState({iconLoading: false})
                }
            })
        })
    }
    resetSearchHandler = ()=>{
        this.props.form.resetFields()
        this.setState({
            type: 'week',
            params: {...DEFAULT_PARAMS},
            checkParams: {...DEFAULT_CHECK},
        })
    }
    showRecord = ()=>{
        this.setState({
            modalVisiable: true
        })
    }
    closeModal = ()=>{
        this.setState({
            modalVisiable: false
        })
    }
    disabledDate = (current, type)=>{
        if(type === 'week'){
            return current && current > moment().subtract(1, 'weeks').endOf('weeks')
        }else{
            return current && current > moment().subtract(1, 'months').endOf('months')
        } 
    }
    render () {
        const { params, checkParams } = this.state
        // console.log(checkParams.customer)
        const { getFieldDecorator } = this.props.form
        const formItemLayout = {
            labelCol: {
                span: 6,
                style: {
                    width: '80px',
                    textAlign: 'right',
                },
            },
            wrapperCol: {
                span: 16,
            },
        }
        const formItemLayouts = {
            labelCol: {
                span: 3,
                style: {
                    width: '100px',
                    textAlign: 'right',
                },
            },
            wrapperCol: {
                span: 21,
            },
        }
        const content = 
            (<div className={styles.popover}>
                <p><span>好友总数：</span>微信好友总数</p>
                <p><span>新好友数：</span>新加好友总数</p>
                <p><span>好友流失数：</span>好友关系解除，流失好友总数</p>
                <p><span>群总数：</span>微信群总数</p>
                <p><span>群成员总数：</span>微信群内成员总数</p>
                <p><span>客户绑定总数：</span>当前绑定的客户总数，单个客户绑定多个平台购物id，计为1</p>
                <p><span>新绑定客户数：</span>新增绑定关系的客户总数，单个客户绑定多个平台购物id，计为1</p>
                <p><span>私聊好友（发送/接收）：</span>通过私聊发送、接收消息的好友总数</p>
                <p><span>私聊消息（发送/接收）：</span>通过私聊发送、接收消息的消息总数</p>
                <p><span>群消息数：</span>微信群内的消息总数</p>
                <p><span>发圈数：</span>发圈总数</p>
                <p><span>点赞数：</span>点赞总数</p>
                <p><span>评论数：</span>发朋友圈的评论总数</p>
                <p><span>小红包笔数：</span>小红包支出成功的总笔数</p>
                <p><span>小红包金额：</span>小红包支出成功的总金额</p>
                <p><span>语音红包笔数：</span>语音红包支出成功的总笔数</p>
                <p><span>语音红包金额：</span>语音红包支出成功的总金额</p>
                <p><span>下单客户数：</span>付款下单的客户总数</p>
                <p><span>下单金额：</span>下单客户的付款订单实付总金额</p>
                <p><span>下单新客数：</span>新加好友且绑定下单的客户总数</p>
                <p><span>新客下单金额：</span>新加好友且绑定下单的客户，付款订单实付总金额</p>
            </div>)
        return (
            <Page>
                <Page.ContentHeader
                    title={this.props.documentTitle}
                />
                <Spin spinning={this.state.iconLoading}>
                    <Form>
                        <Page.ContentBlock title={(
                            <span>
                                选择统计维度
                                <Popover content={content} placement="bottomLeft" title="统计维度字段说明" trigger="hover" overlayStyle={{maxWidth: 500}}>
                                    <Icon className="hz-text-primary hz-icon-size-default hz-icon-popover" style={{color: '#4391FF'}} type='question-circle' />
                                </Popover>
                            </span>
                        )} hasDivider={false} style={{marginTop: '-16px'}}>
                            <div className={styles.searchBar}>
                                <Row>
                                    <Form.Item label="客户增长" {...formItemLayouts}>
                                        <div>
                                            <Checkbox
                                                indeterminate={checkParams.customerInde}
                                                onChange={(e)=>this.onCheckAllChange('customer', e)}
                                                checked={checkParams.customerCheckAll}
                                            >
                                                全选
                                            </Checkbox>
                                            <CheckboxGroup
                                                options={DEFAULT_OPTION.customerOptions}
                                                value={checkParams.customer}
                                                onChange={(val)=>this.onCheckChange('customer', val)}
                                            />
                                        </div>
                                    </Form.Item>
                                </Row>
                                <Row>
                                    <Form.Item label="交易识别" {...formItemLayouts}>
                                        <div>
                                            <Checkbox
                                                indeterminate={checkParams.transactionInde}
                                                onChange={(e)=>this.onCheckAllChange('transaction', e)}
                                                checked={checkParams.transactionCheckAll}
                                            >
                                                全选
                                            </Checkbox>
                                            <CheckboxGroup
                                                options={DEFAULT_OPTION.transactionOptions}
                                                value={checkParams.transaction}
                                                onChange={(val)=>this.onCheckChange('transaction', val)}
                                            />
                                        </div>
                                    </Form.Item>
                                </Row>
                                <Row>
                                    <Form.Item label="客户关系维护" {...formItemLayouts}>
                                        <div>
                                            <Checkbox
                                                indeterminate={checkParams.relationInde}
                                                onChange={(e)=>this.onCheckAllChange('relation', e)}
                                                checked={checkParams.relationCheckAll}
                                            >
                                                全选
                                            </Checkbox>
                                            <CheckboxGroup
                                                options={DEFAULT_OPTION.relationOptions}
                                                value={checkParams.relation}
                                                onChange={(val)=>this.onCheckChange('relation', val)}
                                            />
                                        </div>
                                    </Form.Item>
                                </Row>
                                <Row>
                                    <Form.Item label="营销追踪" {...formItemLayouts}>
                                        <div>
                                            <Checkbox
                                                indeterminate={checkParams.marketInde}
                                                onChange={(e)=>this.onCheckAllChange('market', e)}
                                                checked={checkParams.marketCheckAll}
                                            >
                                                全选
                                            </Checkbox>
                                            <CheckboxGroup
                                                options={DEFAULT_OPTION.marketOptions}
                                                value={checkParams.market}
                                                onChange={(val)=>this.onCheckChange('market', val)}
                                            />
                                        </div>
                                    </Form.Item>
                                </Row>
                                <Row>
                                    <Form.Item label="交易统计" {...formItemLayouts}>
                                        <div>
                                            <Checkbox
                                                indeterminate={checkParams.transaction_statInde}
                                                onChange={(e)=>this.onCheckAllChange('transaction_stat', e)}
                                                checked={checkParams.transaction_statCheckAll}
                                            >
                                                全选
                                            </Checkbox>
                                            <CheckboxGroup
                                                options={DEFAULT_OPTION.transaction_statOptions}
                                                value={checkParams.transaction_stat}
                                                onChange={(val)=>this.onCheckChange('transaction_stat', val)}
                                            />
                                        </div>
                                    </Form.Item>
                                </Row>
                            </div>
                        </Page.ContentBlock>
                        <Page.ContentBlock title='导出统计维度' hasDivider={false} style={{marginTop: '-16px'}}>
                            
                            <Page.ContentAdvSearch>
                                <Row>
                                    <Col span={8}>
                                        <Form.Item label="所属部门" {...formItemLayout}>
                                            <DepartmentSelect 
                                                departmentId={params.department_id}
                                                onChange={(value)=>{this.handleChange('department_id', value)}}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item label="所属员工" {...formItemLayout}>
                                            <UserSelect
                                                departmentId={params.department_id}
                                                userId={params.user_id}
                                                onChange={(value)=>{this.handleChange('user_id', value)}}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item label="所属微信" {...formItemLayout}>
                                            <WeChatSelectSingle
                                                departmentId={params.department_id}
                                                userId={params.user_id}
                                                field="username"
                                                username={params.service_wx_id}
                                                onChange={(value)=>{this.handleChange('service_wx_id', value)}}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={24}>
                                        <Form.Item label="日期" {...formItemLayout}>
                                            {getFieldDecorator("type", {
                                                initialValue: this.state.type
                                            })(
                                                <RadioGroup onChange={this.changeType}>
                                                    <RadioButton value="week">周</RadioButton>
                                                    <RadioButton value="month">月</RadioButton>
                                                </RadioGroup>
                                            )}
                                            {
                                                this.state.type === 'month' ? (
                                                    <Form.Item style={{display: 'inline-block',marginLeft: '16px', width: '32%'}}>
                                                        {getFieldDecorator("report_at", {
                                                            initialValue: moment().subtract(1, 'months'),
                                                        })(
                                                            <MonthPicker disabledDate={(e)=>this.disabledDate(e, 'month')} placeholder="选择月" format={'YYYY-MM月'} />
                                                        )}
                                                    </Form.Item>
                                                ): (
                                                    <Form.Item style={{display: 'inline-block',marginLeft: '16px', width: '32%'}}>
                                                        {getFieldDecorator("report_at", {
                                                            initialValue: moment().subtract(1, 'weeks'),
                                                        })(
                                                            <WeekPicker  disabledDate={(e)=>this.disabledDate(e, 'week')} placeholder="选择周" />
                                                        )}
                                                    </Form.Item>
                                                )
                                            }
                                        </Form.Item> 
                                    </Col>
                                </Row>
                            </Page.ContentAdvSearch>
                            <Row style={{marginBottom: 24}}>
                                <Col span={8}>
                                    <Col span={16}>
                                        <Button className="hz-btn-width-default" loading={this.state.iconLoading} type="primary" htmlType="submit" onClick={this.getWechatReport}>
                                            <Icon type="download" />
                                            导出
                                        </Button>
                                        <Button className="hz-btn-width-default hz-margin-base-left" onClick={this.resetSearchHandler}>
                                            重置
                                        </Button>
                                    </Col>
                                </Col>
                                <Col span={8} offset={8} style={{textAlign: 'right'}}>
                                    <Button className="hz-btn-width-default hz-margin-base-left" onClick={this.showRecord}>导出记录</Button>
                                </Col>
                            </Row>
                            
                        </Page.ContentBlock>
                    </Form>
                </Spin>
                <ExportRecord
                    visible={this.state.modalVisiable}
                    key={this.state.modalVisiable}
                    onCancel={this.closeModal}
                ></ExportRecord>
            </Page>
        )
    }
}
