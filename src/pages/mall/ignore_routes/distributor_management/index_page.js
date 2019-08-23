/**
 **@Description:分销- 分销员管理
 **@author: wangchunting
 */

import React from 'react'
import { connect } from 'dva'
import DocumentTitle from 'react-document-title'
import router from 'umi/router'
import Page, { DEFAULT_PAGER, DEFAULT_PAGER_FILTER } from '../../../../components/business/Page'
import { Form, Input, InputNumber, Button, Row, Col, DatePicker, Icon, Table, Pagination, Popover } from 'antd'
import styles from './index.less'
import { jine } from '../../../../utils/display'
import moment from 'moment'

const DEFAULT_CONDITION = {
    nick_name: '',
    mobile: '',
    promote_count_from: '',
    promote_count_to: '',
    begin_at: '',
    end_at: '',
}

@Form.create({})
@connect(({ base, distributor_management }) => ({
    base, distributor_management
}))

export default class extends Page.ListPureComponent {
    state = {
        condition: { ...DEFAULT_CONDITION },
        pager: { ...DEFAULT_PAGER },
        loading: true,
        remark: '',
        remarkVisible: false,
        remarkID: '',
        remarkLoading: false
    }

    initPage = (isSetHistory = false) => {
        const condition = this.getParamForObject(DEFAULT_CONDITION, this.props.location.query)
        const pager = this.getParamForObject(DEFAULT_PAGER, this.props.location.query, DEFAULT_PAGER_FILTER)

        this.getPageData(condition, pager, isSetHistory)

        const { nick_name, mobile, promote_count_from, promote_count_to, begin_at, end_at } = condition

        this.props.form.setFieldsValue({
            'rangePicker': begin_at && end_at ? [moment(begin_at), moment(end_at)] : [],
            nick_name: nick_name,
            mobile: mobile,
            promote_count_from: promote_count_from,
            promote_count_to: promote_count_to
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
            type: 'distributor_management/managementList',
            payload: {
                offset: (pager.current - 1) * pager.pageSize,
                limit: pager.pageSize,
                nick_name: condition.nick_name,
                mobile: condition.mobile,
                promote_count_from: condition.promote_count_from,
                promote_count_to: condition.promote_count_to,
                begin_at: condition.begin_at,
                end_at: condition.end_at
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
                    nick_name: values.nick_name,
                    mobile: values.mobile,
                    promote_count_from: values.promote_count_from,
                    promote_count_to: values.promote_count_to,
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

    // 备注
    handleRemarkChange = (remarkRecord) => {
        this.setState({
            remarkID: remarkRecord.id,
            remarkVisible: true
        })

        this.props.form.setFieldsValue({
            revise_remark: remarkRecord.remark
        })

    }

    handleRemarkSubmit = () => {
        const revise_remark = this.props.form.getFieldValue('revise_remark')
        let data = {
            disstributor_id: this.state.remarkID,
            remark: revise_remark,
        }
        this.setState({
            remarkLoading: true
        })

        this.props.dispatch({
            type: 'distributor_management/update',
            payload: {
                data: { ...data }
            },
            callback: () => {
                this.setState({
                    remarkVisible: false,
                    remarkLoading: false
                }, () => {
                    this.props.form.resetFields()

                    let { condition, pager } = this.state
                    this.getPageData(condition, pager)
                })
            }
        })
    }

    handleRemarkCancel = () => {
        this.props.form.resetFields()

        this.setState({
            remarkVisible: false
        })
    }

    // 查看明细
    checkDetailsChange = (user_id) => {
        router.push(`/mall/distributor_management/detail?user_id=${user_id}`)
    }

    // 推广次数
    formatterPromote = (value) => {
        const reg = /[^\d]/g
        if (typeof value === 'string' && (Number(value) >= 0 && Number(value) <= 999999)) {
            return !isNaN(Number(value)) ? value.replace(reg, '') : ''
        } else if ((typeof value === 'number') && (value >= 0 && value <= 999999)) {
            return !isNaN(value) ? String(value).replace(reg, '') : ''
        } else {
            return ''
        }
    }

    render() {
        const FormItem = Form.Item
        const { RangePicker } = DatePicker
        const { getFieldDecorator } = this.props.form
        const { current, pageSize } = this.state.pager
        const { rows_found, managementList } = this.props.distributor_management

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
            title: '分销员',
            dataIndex: 'user_wechat.nick_name',
        }, {
            title: '手机号码',
            dataIndex: 'user.mobile',
        }, {
            title: '推广次数',
            dataIndex: 'promote_count',
            align: 'center'
        }, {
            title: '佣金收入(元)',
            dataIndex: 'total_commission_amount',
            render: (text, record) => <span>{jine(text, '0,0.00', 'Fen')}</span>,
            align: 'right'
        }, {
            title: '待结算佣金(元)',
            dataIndex: 'un_settlement_amount',
            render: (text, record) => <span>{jine(text, '0,0.00', 'Fen')}</span>,
            align: 'right'
        }, {
            title: '提现中佣金数(元)',
            dataIndex: 'withdrawing_amount',
            render: (text, record) => <span>{jine(text, '0,0.00', 'Fen')}</span>,
            align: 'right'
        }, {
            title: '加入时间',
            dataIndex: 'created_at',
            render: (text, item) => text.substring(0, 10)
        }, {
            title: '备注',
            dataIndex: 'remark',
            render: (text, record, index) => {
                return <div>{text}
                    <a href="javascript:;" className='hz-margin-small-left'>
                        <Popover
                            placement="topRight"
                            content={content}
                            visible={this.state.remarkVisible && this.state.remarkID === record.id}
                        >
                        </Popover>
                        <Icon type="edit"
                            onClick={() => this.handleRemarkChange(record)}
                        />
                    </a>
                </div>
            }

        }, {
            title: '操作',
            render: (text, record) => <a href="javascript:;" onClick={() => this.checkDetailsChange(record.user_id)} >查看明细</a>,
        }]

        const content = (
            <div style={{ width: '320px' }}>
                <div className='hz-margin-small-bottom'>备注</div>
                <Form.Item style={{ marginBottom: '0' }}>
                    {getFieldDecorator('revise_remark', {
                    })(
                        <Input
                            placeholder="请输入备注(20个字以内)"
                            maxLength={20}
                        />
                    )}
                </Form.Item>
                <div style={{ textAlign: 'right' }} className='hz-margin-small-top-bottom'>
                    <Button type="primary" htmlType="submit" onClick={this.handleRemarkSubmit} loading={this.state.remarkLoading}>确定</Button>
                    <Button style={{ marginLeft: 8 }} onClick={this.handleRemarkCancel}>取消</Button>
                </div>
            </div>
        )

        return (
            <DocumentTitle title="分销员管理" >
                <Page>
                    <Page.ContentHeader title="分销员管理" />
                    <Page.ContentAdvSearch>
                        <Form layout="horizontal" className="hz-from-search">
                            <Row>
                                <Col span={8}>
                                    <FormItem label="分销员" {...formItemLayout}>
                                        {getFieldDecorator('nick_name', {})(
                                            <Input placeholder='请输入分销员姓名' />
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
                                <Col span={8}>
                                    <FormItem label="推广次数" {...formItemLayout}>
                                        <div style={{ display: 'flex' }}>
                                            <FormItem style={{ marginBottom: '0' }}>
                                                {getFieldDecorator('promote_count_from', {})(
                                                    <InputNumber
                                                        formatter={this.formatterPromote}
                                                        parser={this.formatterPromote}
                                                        min={0} max={999999}
                                                        placeholder='请输入'
                                                    />
                                                )}
                                            </FormItem>
                                            <span className='hz-margin-small-left-right' style={{ marginBottom: '0' }}>~</span>
                                            <FormItem style={{ marginBottom: '0' }}>
                                                {getFieldDecorator('promote_count_to', {})(
                                                    <InputNumber
                                                        formatter={this.formatterPromote}
                                                        parser={this.formatterPromote}
                                                        min={0} max={999999}
                                                        placeholder='请输入'
                                                    />
                                                )}
                                            </FormItem>
                                        </div>
                                    </FormItem>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={8}>
                                    <FormItem label="加入时间" {...formItemLayout}>
                                        {getFieldDecorator('rangePicker', {})(
                                            <RangePicker placeholder={['不限', '不限']} />
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
                        dataSource={managementList}
                        loading={loading}
                        rowKey="id"
                    />
                    {
                        managementList && managementList.length > 0 && !loading ?
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
            </ DocumentTitle>

        )
    }
}
