/**
 **@Description:分销- 佣金管理
 **@author: wangchunting
 */

import React from 'react'
import { connect } from 'dva'
import DocumentTitle from 'react-document-title'
import Page, { DEFAULT_PAGER, DEFAULT_PAGER_FILTER } from '../../../../components/business/Page'
import { Form, Select, Input, Button, Row, Col, DatePicker, Icon, Table, Modal, Pagination, message, Badge } from 'antd'
import styles from './index.less'
import { jine } from '../../../../utils/display'
import { STATUS, getStatusCode } from '../../services/distributor/commissions'
import moment from 'moment'

const DEFAULT_CONDITION = {
    begin_at: '',
    end_at: '',
    withdraw_no: '',
    nick_name: '',
    status: '',
    mobile: ''
}
@Form.create({})
@connect(({ base, commissions }) => ({
    base, commissions
}))
export default class extends Page.ListPureComponent {
    state = {
        condition: { ...DEFAULT_CONDITION },
        pager: { ...DEFAULT_PAGER },
        loading: true,
        rows_found: 0
    }

    initPage = (isSetHistory = false) => {
        const condition = this.getParamForObject(DEFAULT_CONDITION, this.props.location.query)
        const pager = this.getParamForObject(DEFAULT_PAGER, this.props.location.query, DEFAULT_PAGER_FILTER)

        this.getPageData(condition, pager, isSetHistory)

        const { begin_at, end_at, withdraw_no, nick_name, mobile, status } = condition

        this.props.form.setFieldsValue({
            'rangePicker': begin_at && end_at ? [moment(begin_at), moment(end_at)] : [],
            withdraw_no: withdraw_no,
            nick_name: nick_name,
            mobile: mobile,
            status: status && parseInt(status, 10)
        })
    }

    getPageData = (condition, pager, isSetHistory = true, callback) => {
        if (isSetHistory) {
            this.history(condition, pager)
        }

        this.setState({
            condition: condition,
            pager: pager,
            loading: false
        })

        this.props.dispatch({
            type: 'commissions/commissionsList',
            payload: {
                offset: (pager.current - 1) * pager.pageSize,
                limit: pager.pageSize,
                begin_at: condition.begin_at,
                end_at: condition.end_at,
                withdraw_no: condition.withdraw_no,
                nick_name: condition.nick_name,
                status: condition.status,
                mobile: condition.mobile
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
                    withdraw_no: values.withdraw_no,
                    nick_name: values.nick_name,
                    status: values.status,
                    mobile: values.mobile
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
    searchSubmitHandle = () => {
        this.searchData()
    }

    // 搜索-重置
    resetSearchHandler = () => {
        this.props.form.resetFields()
        this.searchData()
    }

    // 打款失败
    showFailurePayModal = (remark) => {
        Modal.warning({
            title: '提示',
            content: remark,
        })
    }

    // 通过
    showPassConfirm = (id) => {
        Modal.confirm({
            title: "提示",
            content: '确认通过后，将直接打款到对方微信零钱！',
            okText: '确定',
            cancelText: '取消',
            iconType: 'question-circle',
            onOk: () => {
                this.getPassData(id)
            },
        })
    }

    getPassData = (id) => {
        this.props.dispatch({
            type: 'commissions/transactions',
            payload: {
                id: id
            },
            callback: (meta) => {
                if (meta && meta.code === 200) {
                    let { condition, pager } = this.state
                    this.getPageData(condition, pager)

                    message.success(`操作成功`)
                }
            }
        })
    }

    // 重新打款
    showRefundsConfirm = (id) => {
        this.props.dispatch({
            type: 'commissions/transactions',
            payload: {
                id: id
            },
            callback: (meta) => {
                if (meta && meta.code === 200) {
                    let { condition, pager } = this.state
                    this.getPageData(condition, pager)

                    message.success(`操作成功`)
                }
            }
        })
    }

    render() {
        const FormItem = Form.Item
        const { RangePicker } = DatePicker
        const Option = Select.Option
        const { getFieldDecorator } = this.props.form
        const { current, pageSize } = this.state.pager
        const { rows_found, commissionsList } = this.props.commissions

        const { loading } = this.state
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

        const columns = [{
            title: '提现时间',
            dataIndex: 'created_at',
        }, {
            title: '申请单号',
            dataIndex: 'withdraw_no',
        }, {
            title: '分销员',
            dataIndex: 'user_wechat.nick_name',
        }, {
            title: '手机号码',
            dataIndex: 'user.mobile',
        }, {
            title: '提现金额(元)',
            dataIndex: 'amount',
            render: text => jine(text, '0,0.00', 'Fen'),
            align: 'right'
        }, {
            title: '提现状态',
            dataIndex: 'status',
            render: (text, record) => {
                switch (text) {
                    case getStatusCode('pending').value:
                        return <Badge status="warning" text='待审核'></Badge>
                    case getStatusCode('valid').value:
                        return <Badge status="success" text='已审核'></Badge>
                    case getStatusCode('already').value:
                        return <Badge status="success" text='已打款'></Badge>
                    case getStatusCode('failure').value:
                        return <Badge status="error" text={<a href="javascript:;" onClick={() => this.showFailurePayModal(record.remark)}>打款失败</a>}>
                        </Badge>
                    default:
                }
            }
        }, {
            title: '审核时间',
            dataIndex: 'audited_at',
        }, {
            title: '操作',
            render: (text, record) => {
                if (record.status === STATUS[0].value) {
                    return <a href="javascript:;" onClick={() => this.showPassConfirm(record.id)}>通过</a>
                } else if (record.status === STATUS[3].value) {
                    return <a href="javascript:;" onClick={() => this.showRefundsConfirm(record.id)}>重新打款</a>
                } else {
                    return <span>--</span>
                }
            },
        }]

        return (
            <DocumentTitle title="佣金管理" >
                <Page>
                    <Page.ContentHeader title="佣金管理" />
                    <Page.ContentAdvSearch>
                        <Form layout="horizontal" className="hz-from-search">
                            <Row>
                                <Col span={8}>
                                    <FormItem label="提现时间" {...formItemLayout}>
                                        {getFieldDecorator('rangePicker', {})(
                                            <RangePicker placeholder={['不限', '不限']} />
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={8}>
                                    <FormItem label="申请单号" {...formItemLayout}>
                                        {getFieldDecorator('withdraw_no', {})(
                                            <Input placeholder='请输入订单编号' />
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={8}>
                                    <FormItem label="分销员" {...formItemLayout}>
                                        {getFieldDecorator('nick_name', {})(
                                            <Input placeholder='请输入分销员名称' />
                                        )}
                                    </FormItem>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={8}>
                                    <FormItem label="提现状态" {...formItemLayout}>
                                        {getFieldDecorator('status', {})(
                                            <Select
                                                placeholder="全部状态"
                                            >
                                                <Option value="">全部状态</Option>
                                                {
                                                    STATUS.map((item) => {
                                                        return <Option key={item.value} value={item.value}>{item.text}</Option>
                                                    })
                                                }
                                            </Select>
                                        )}
                                    </FormItem>
                                </Col>

                                <Col span={8}>
                                    <FormItem label="手机号码" {...formItemLayout}>
                                        {getFieldDecorator('mobile', {})(
                                            <Input placeholder='请输入分销员手机号码' />
                                        )}
                                    </FormItem>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={8}>
                                    <Col span={3} style={{ width: '69px' }}></Col>
                                    <Col span={16}>
                                        <Button className="hz-btn-width-default" type="primary" htmlType="submit" onClick={this.searchSubmitHandle}>
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
                    <Table
                        pagination={false}
                        columns={columns}
                        dataSource={commissionsList}
                        loading={loading}
                        rowKey="id"
                    />
                    {
                        commissionsList && commissionsList.length > 0 && !loading ?
                            <Pagination
                                className={styles.wxPagination + ' ant-table-pagination'}
                                total={rows_found}
                                current={current}
                                showQuickJumper={true}
                                showTotal={total => `共 ${rows_found} 条`}
                                pageSize={pageSize}
                                pageSizeOptions={['10', '20', '50', '100']}
                                showSizeChanger={true}
                                onShowSizeChange={this.handleListPageChangeSize}
                                onChange={this.handleListPageChange}
                            />
                            : ''
                    }
                </Page>
            </DocumentTitle>
        )
    }
}
