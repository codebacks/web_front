import React from 'react'
import { connect } from 'dva'
import DocumentTitle from 'react-document-title'
import router from 'umi/router'
import Page, { DEFAULT_PAGER, DEFAULT_PAGER_FILTER } from '../../../../components/business/Page'
import { Form, Select, Input, Button, Row, Col, DatePicker, Icon, Table, Pagination, Badge } from 'antd'
import styles from './index.less'
import { ORDER_STATUS } from '../../services/distributor/distributor_order'
import { jine } from '../../../../utils/display'
import moment from 'moment'

const DEFAULT_CONDITION = {
    begin_at: '',
    end_at: '',
    order_no: '',
    status: '',
    user_id: ''
}
@Form.create({})
@connect(({ base, distributor_order }) => ({
    base, distributor_order
}))

export default class extends Page.ListPureComponent {
    state = {
        condition: { ...DEFAULT_CONDITION },
        pager: { ...DEFAULT_PAGER },
        loading: true,
        user_id: ''
    }

    initPage = (isSetHistory = false) => {
        const condition = this.getParamForObject(DEFAULT_CONDITION, this.props.location.query)
        const pager = this.getParamForObject(DEFAULT_PAGER, this.props.location.query, DEFAULT_PAGER_FILTER)

        this.getPageData(condition, pager, isSetHistory)

        const { begin_at, end_at, order_no, status } = condition
        this.props.form.setFieldsValue({
            'rangePicker': begin_at && end_at ? [moment(begin_at), moment(end_at)] : [],
            order_no: order_no,
            status: status && parseInt(status, 10),
            user_id: this.state.user_id
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

        let { user_id } = this.props.location.query

        this.setState({
            user_id: user_id
        }, () => {
            this.props.dispatch({
                type: 'distributor_order/orderList',
                payload: {
                    offset: (pager.current - 1) * pager.pageSize,
                    limit: pager.pageSize,
                    begin_at: condition.begin_at,
                    end_at: condition.end_at,
                    order_no: condition.order_no,
                    status: condition.status,
                    user_id: this.state.user_id
                },
                callback: (data) => {
                    this.setState({
                        loading: false
                    })

                    callback && callback(data)
                }
            })
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
                    order_no: values.order_no,
                    status: values.status,
                    user_id: this.state.user_id,
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
        this.setState({
            user_id: this.state.user_id
        }, () => {
            this.searchData()
        })
    }

    // 查看详情
    viewDetailsChange = (order_id) => {
        router.push(`/mall/order_list/order_detail?id=${order_id}`)
    }

    render() {
        const FormItem = Form.Item
        const { RangePicker } = DatePicker
        const Option = Select.Option
        const { getFieldDecorator } = this.props.form
        const { current, pageSize } = this.state.pager
        const { rows_found, orderList } = this.props.distributor_order
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
            title: '下单时间',
            dataIndex: 'created_at',
        }, {
            title: '订单编号',
            dataIndex: 'order_no',
        }, {
            title: '实付金额(元)',
            dataIndex: 'order.amount',
            render: text => jine(text, '0,0.00', 'Fen'),
            align: 'right'
        }, {
            title: '订单状态',
            dataIndex: 'order.status',
            render: (text, record) => {
                switch (text) {
                    case 205:
                        return <Badge status="warning" text='待发货' className={styles.nowrap}></Badge>
                    case 400:
                        return <Badge status="success" text='已发货' className={styles.nowrap}></Badge>
                    case 405:
                        return <Badge status="default" text='已完成' className={styles.nowrap}></Badge>
                    default:
                }
            }
        }, {
            title: '佣金提成(元)',
            dataIndex: 'commission_amount',
            render: text => jine(text, '0,0.00', 'Fen'),
            align: 'right'
        }, {
            title: '分销员',
            dataIndex: 'user_wechat.nick_name',
        }, {
            title: '手机号码',
            dataIndex: 'user.mobile',
        }, {
            title: '备注',
            dataIndex: 'expect_commission_amount',
            render: (text, record) => {
                return <div>
                    {record.commission_amount !== record.expect_commission_amount ? '订单有退款' : '--'}
                </div>
            }
        }, {
            title: '操作',
            render: (text, record) => <a href="javascript:;" onClick={() => this.viewDetailsChange(record.order_id)}>查看详情</a>,
        }]

        return (
            <DocumentTitle title="订单明细" >
                <Page>
                    <Page.ContentHeader
                        hasGutter={false}
                        breadcrumbData={[{
                            name: '分销订单',
                            path: '/mall/distributor_management'
                        }, {
                            name: '订单明细'
                        }]}
                    />
                    <Page.ContentAdvSearch>
                        <Form layout="horizontal" className="hz-from-search">
                            <Row>
                                <Col span={8}>
                                    <FormItem label="下单时间" {...formItemLayout}>
                                        {getFieldDecorator('rangePicker', {})(
                                            <RangePicker placeholder={['不限', '不限']} />
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={8}>
                                    <FormItem label="订单编号" {...formItemLayout}>
                                        {getFieldDecorator('order_no', {})(
                                            <Input placeholder='请输入订单编号' />
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={8}>
                                    <FormItem label="订单状态" {...formItemLayout}>
                                        {getFieldDecorator('status', {})(
                                            <Select
                                                placeholder="全部状态"
                                            >
                                                <Option value="">全部状态</Option>
                                                {
                                                    ORDER_STATUS.map((item) => {
                                                        return <Option key={item.value} value={item.value}>{item.text}</Option>
                                                    })
                                                }
                                            </Select>
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
                        dataSource={orderList}
                        loading={loading}
                        rowKey="id"
                    />
                    {
                        orderList && orderList.length > 0 && !loading ?
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
