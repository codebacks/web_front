/**
 **@time: 2018/9/21
 **@Description:审核
 **@author: wangchunting
 */

import React from 'react'
import Page, { DEFAULT_PAGER, DEFAULT_PAGER_FILTER } from '../../../../components/business/Page'
import { Form, Select, Input, Button, Row, Col, Tabs, DatePicker, Icon, Popover } from 'antd'
import Pending from './components/pending'
import Confirmed from './components/confirmed'
import Refused from './components/refused'
import Valid from './components/valid'
import { connect } from 'dva'
import { getStatus, ACTIVITIESDETAIL_STATUS, EXAMINE_PAY_STATUS } from '../../services/examine'
import styles from './index.less'
import moment from 'moment'

const DEFAULT_CONDITION = {
    begin_at: '',
    end_at: '',
    order_no: '',
    activity_name: '',
    activity_status: '',
    pay_status: '',
    status: '1',
}

@Form.create({})
@connect(({ base, platform_examine }) => ({
    base, platform_examine
}))

export default class extends Page.ListPureComponent {
    state = {
        condition: { ...DEFAULT_CONDITION },
        pager: { ...DEFAULT_PAGER },
    }

    initPage = (isSetHistory = false) => {
        const condition = this.getParamForObject(DEFAULT_CONDITION, this.props.location.query)
        const pager = this.getParamForObject(DEFAULT_PAGER, this.props.location.query, DEFAULT_PAGER_FILTER)

        this.getPageData(condition, pager, isSetHistory)

        const { begin_at, end_at, order_no, activity_name, activity_status, pay_status, status } = condition

        this.setState({
            status: status
        })

        this.props.form.setFieldsValue({
            'rangePicker': begin_at && end_at ? [moment(begin_at), moment(end_at)] : [],
            order_no: order_no,
            activity_name: activity_name,
            activity_status: activity_status && parseInt(activity_status, 10),
            pay_status: pay_status && parseInt(pay_status, 10)
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
            type: 'platform_examine/listData',
            payload: {
                offset: (pager.current - 1) * pager.pageSize,
                limit: pager.pageSize,
                begin_at: condition.begin_at,
                end_at: condition.end_at,
                status: condition.status,
                order_no: condition.order_no,
                activity_name: condition.activity_name,
                activity_status: condition.activity_status,
                pay_status: condition.pay_status
            },
            callback: (data) => {
                this.setState({
                    loading: false
                })

                callback && callback(data)
            }
        })
    }

    searchData = () => {
        this.props.form.validateFields((err, values) => {
            let data = {
                begin_at: '',
                end_at: '',
            }
            if (values.rangePicker) {
                const range = values.rangePicker.map(item => item.format('YYYY-MM-DD'))
                data.begin_at = range[0]
                data.end_at = range[1]
            }

            const condition = {
                ...this.state.condition,
                ...{
                    begin_at: data.begin_at,
                    end_at: data.end_at,
                    order_no: values.order_no || '',
                    activity_name: values.activity_name || '',
                    activity_status: values.activity_status || '',
                    pay_status: values.pay_status || ''
                },
            }

            const pager = {
                pageSize: this.state.pager.pageSize,
                current: DEFAULT_PAGER.current
            }

            this.getPageData(condition, pager)
        })
    }

    //搜索
    searchHandleSubmit = () => {
        this.searchData()
    }

    // 重置
    resetSearchHandler = () => {
        this.props.form.resetFields()
        this.searchData()
    }

    addCompletedHandler = (result) => {
        if (result === 'ok') {
            let { condition, pager } = this.state
            this.getPageData(condition, pager)
        }
    }

    //tab切换
    tabHandler = (status) => {
        this.setState({
            status: status
        })

        let { condition, pager } = this.state
        condition.status = status
        pager.current = DEFAULT_PAGER.current

        this.getPageData(condition, pager)

    }
    render() {
        const { examineData } = this.props.platform_examine
        const FormItem = Form.Item
        const Option = Select.Option
        const { getFieldDecorator } = this.props.form
        const TabPane = Tabs.TabPane
        const { RangePicker } = DatePicker
        const formItemLayout = {
            labelCol: {
                span: 6,
                style: {
                    width: '69px',
                    textAlign: 'right',
                },
            },
            wrapperCol: {
                span: 16,
            },
        }
        const content = (
            <div style={{ width: '224px' }}>
                <span style={{ fontSize: 12, color: '#999' }}>
                    展示订单号暂未同步到本系统和不符合要求的活动申请记录，记录仅保留20天，可手动确认或删除
                </span>
            </div>
        )

        return (
            <div>
                <Page.ContentAdvSearch hasGutter={false}>
                    <Form layout="horizontal" className="hz-from-search">
                        <Row>
                            <Col span={8}>
                                <FormItem label="申请时间" {...formItemLayout}>
                                    {getFieldDecorator('rangePicker', {})(
                                        <RangePicker placeholder={['不限', '不限']} />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem label="订单号" {...formItemLayout}>
                                    {getFieldDecorator('order_no', {})(
                                        <Input placeholder="请输入订单号" />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem label="活动名称" {...formItemLayout}>
                                    {getFieldDecorator('activity_name', {})(
                                        <Input placeholder='请输入活动名称' />
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={8}>
                                <FormItem label="活动状态" {...formItemLayout}>
                                    {getFieldDecorator('activity_status', {})(
                                        <Select
                                            placeholder="全部状态"
                                        >
                                            <Option value="">全部状态</Option>
                                            {
                                                ACTIVITIESDETAIL_STATUS.map((item) => {
                                                    return <Option key={item.value} value={item.value}>{item.text}</Option>
                                                })
                                            }
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>
                            {
                                (this.state.tab === '1' || this.state.tab === '2') && (
                                    <Col span={8}>
                                        <FormItem label="付款状态" {...formItemLayout}>
                                            {getFieldDecorator('pay_status', {})(
                                                <Select
                                                    placeholder="全部状态"
                                                >
                                                    <Option value="">全部状态</Option>
                                                    {
                                                        EXAMINE_PAY_STATUS.map((item) => {
                                                            return <Option key={item.value} value={item.value}>{item.text}</Option>
                                                        })
                                                    }
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                )
                            }
                        </Row>
                        <Row>
                            <Col span={8}>
                                <Col span={3} style={{ width: '69px' }}></Col>
                                <Col span={16}>
                                    <Button className="hz-btn-width-default" type="primary" htmlType="submit" onClick={this.searchHandleSubmit}>
                                        <Icon type="search" />
                                        搜索
                                    </Button>
                                    <Button className="hz-btn-width-default hz-margin-base-left" onClick={this.resetSearchHandler}>
                                        重置
                                    </Button>
                                </Col>
                            </Col>
                        </Row>
                    </Form>
                </Page.ContentAdvSearch>
                {/* table */}
                <Tabs defaultActiveKey="" activeKey={this.state.status} animated={false} onChange={this.tabHandler} style={{ zIndex: 0 }}>
                    <TabPane tab={getStatus("pending").text} key={getStatus("pending").value}>
                        <Pending
                            examineData={examineData}
                            status={getStatus("pending").value}
                            pay_status={getStatus("pending").value}
                            onAddCompleted={this.addCompletedHandler}
                            pager={this.state.pager}
                            handleListPageChangeSize={this.handleListPageChangeSize}
                            handleListPageChange={this.handleListPageChange}
                            {...this.props}
                        ></Pending>
                    </TabPane>
                    <TabPane tab={getStatus("valid").text} key={getStatus("valid").value}>
                        <Valid
                            examineData={examineData}
                            status={getStatus("valid").value}
                            pay_status={getStatus("valid").value}
                            onAddCompleted={this.addCompletedHandler}
                            pager={this.state.pager}
                            handleListPageChangeSize={this.handleListPageChangeSize}
                            handleListPageChange={this.handleListPageChange}
                            {...this.props}
                        ></Valid>
                    </TabPane>
                    <TabPane tab={getStatus("refused").text} key={getStatus("refused").value}>
                        <Refused
                            examineData={examineData}
                            status={getStatus("refused").value}
                            pay_status={getStatus("refused").value}
                            onAddCompleted={this.addCompletedHandler}
                            pager={this.state.pager}
                            handleListPageChangeSize={this.handleListPageChangeSize}
                            handleListPageChange={this.handleListPageChange}
                            {...this.props}
                        ></Refused>
                    </TabPane>
                    <TabPane tab={<span>{getStatus("confirmed").text}
                        <Popover className="hz-margin-small-left" placement="bottomLeft" content={content}>
                            <Icon className={styles.questionCircle} type="question-circle" />
                        </Popover></span>} key={getStatus("confirmed").value}>
                        <Confirmed
                            examineData={examineData}
                            status={getStatus("confirmed").value}
                            pay_status={getStatus("confirmed").value}
                            onAddCompleted={this.addCompletedHandler}
                            pager={this.state.pager}
                            handleListPageChangeSize={this.handleListPageChangeSize}
                            handleListPageChange={this.handleListPageChange}
                            {...this.props}
                        ></Confirmed>
                    </TabPane>
                </Tabs>
            </div >
        )
    }
}
