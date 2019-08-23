import { PureComponent } from 'react'
import Page from '@/components/business/Page'
import {connect} from 'dva'
import router from 'umi/router'
import DocumentTitle from 'react-document-title'
import { Button, Tabs, Table, Pagination, Badge, Form, Row, Col, Input, DatePicker } from 'antd'
import styles from './index.less'
import numeral from 'numeral'
import moment from 'moment'

const { RangePicker } = DatePicker
const TabPane = Tabs.TabPane
const PanesList = [
    {
        tab: '全部',
        key: 0
    },
    {
        tab: '待审核',
        key: 1
    },
    {
        tab: '退款中',
        key: 2
    },
    {
        tab: '已完成',
        key: 3
    },
    {
        tab: '已取消',
        key: 4
    }
]

@Form.create()
@connect(({mall_after_sale, base}) =>({
    mall_after_sale, base
}))
export default class extends PureComponent {
    state = {
        loading: false
    }

    componentDidMount () {
        const { orderNo, refundNo, beginAt, endAt, current, pageSize, tabValue } = this.props.mall_after_sale
        this.setState({
            loading: true
        })
        this.props.form.setFieldsValue({
            'orderNoInput': orderNo,
            'afterNoInput': refundNo,
            'rangePicker': beginAt && endAt ? [moment(beginAt),moment(endAt)] : []
        })
        this.props.dispatch({
            type: 'mall_after_sale/getAfterOrderList',
            payload: {
                status: tabValue,
                per_page: pageSize,
                page: current,
                begin_at: beginAt,
                end_at: endAt,
                order_no: orderNo,
                no: refundNo
            },
            callback: (data) => {
                this.setState({
                    loading: false
                })
            }
        })
    }

    /* 事件处理 */
    onSubmit = (e) => {
        e.preventDefault()

        const { form } = this.props
        const { pageSize, tabValue } = this.props.mall_after_sale
        form.validateFields((error, value) => {
            let beginAt = '', endAt = ''
            if (value.rangePicker && value.rangePicker.length !== 0) {
                beginAt = value.rangePicker[0].format('YYYY-MM-DD')
                endAt = value.rangePicker[1].format('YYYY-MM-DD')
            }
            this.setState({
                loading: true
            })
            this.props.dispatch({
                type: 'mall_after_sale/getAfterOrderList',
                payload: {
                    status: tabValue,
                    per_page: pageSize,
                    page: 0,
                    order_no: value.orderNoInput,
                    no: value.afterNoInput,
                    begin_at: beginAt,
                    end_at: endAt
                },
                callback: (data) => {
                    this.setState({
                        loading: false
                    })
                }
            })
        })
    }

    onReset = () => {
        this.props.form.resetFields()
        this.setState({
            loading: true
        })
        this.props.dispatch({
            type: 'mall_after_sale/getAfterOrderList',
            payload: {
                status: 0,
                per_page: 10,
                page: 0,
                order_no: '',
                no: '',
                begin_at: '',
                end_at: ''
            },
            callback: (data) => {
                this.setState({
                    loading: false
                })
            }
        })
    }

    // 查看订单详情
    onOrderDetail = (id) => {
        router.push(`/mall/after_sale/aftersale_detail?id=${id}`)
    }

    onChangeTabs = (value) => {
        const { orderNo, refundNo, beginAt, endAt, pageSize, current } = this.props.mall_after_sale
        this.setState({
            loading: true
        })
        this.props.dispatch({
            type: 'mall_after_sale/getAfterOrderList',
            payload: {
                page: current,
                status: value,
                per_page: pageSize,
                order_no: orderNo,
                no: refundNo,
                begin_at: beginAt,
                end_at: endAt
            },
            callback: (data) => {
                this.setState({
                    loading: false
                })
            }
        })
    }

    goToPage = (page) => {
        const { tabValue, orderNo, refundNo, beginAt, endAt, pageSize } = this.props.mall_after_sale
        this.setState({
            current: page,
            loading: true
        })
        this.props.dispatch({
            type: 'mall_after_sale/getAfterOrderList',
            payload: {
                page: page - 1,
                per_page: pageSize,
                status: tabValue,
                order_no: orderNo,
                no: refundNo,
                begin_at: beginAt,
                end_at: endAt
            },
            callback: (data) => {
                this.setState({
                    loading: false
                })
            }
        })
    }

    handleChangeSize = (value, pageSize) => {
        const { tabValue, orderNo, refundNo, beginAt, endAt } = this.props.mall_after_sale        
        this.setState({
            loading: true
        })
        this.props.dispatch({
            type: 'mall_after_sale/getAfterOrderList',
            payload: {
                page: value - 1,
                per_page: pageSize,
                status: tabValue,
                order_no: orderNo,
                no: refundNo,
                begin_at: beginAt,
                end_at: endAt
            },
            callback: (data) => {
                this.setState({
                    loading: false
                })
            }
        })
    }

    render () {
        const formItemLayout = {
            labelCol: {
                span: 6,
                style: {
                    width: '70px',
                    textAlign: 'right',
                },
            },
            wrapperCol: {
                span: 16,
            },
        }

        const columns = [
            {
                title: '从属商品订单号',
                dataIndex: 'order_no'
            },
            {
                title: '售后单号',
                dataIndex: 'no'
            },
            {
                title: '商品名称',
                dataIndex: 'items',
                render: (value) => {
                    let node = value.map(c => {
                        return <div key={c.id}>{c.name}</div>
                    })
                    return node
                }
            },
            {
                title: '订单金额',
                dataIndex: 'order_amount',
                align: 'center',
                render: (value) => {
                    return <span className={styles.nowrap}>{numeral(value / 100).format('0,00.00')}</span>
                }
            },
            {
                title: '退款金额',
                dataIndex: 'refund_amount',
                align: 'center',
                render: (value) => {
                    return <span className={styles.nowrap}>{numeral(value / 100).format('0,00.00')}</span>
                }
            },
            {
                title: '状态',
                dataIndex: 'status',
                render: (value) => {
                    switch(value) {
                        case 1:
                            return <Badge status="warning" text="待审核" className={styles.nowrap} />
                        case 2:
                            return <Badge status="processing" text="退款中" className={styles.nowrap} />
                        case 3:
                            return <Badge status="default" text="已完成" className={styles.nowrap} />
                        case 4:
                            return <Badge status="default" text="已取消" className={styles.nowrap} />
                        default: 
                    }
                }
            },
            {
                title: '申请时间',
                dataIndex: 'created_at'
            },
            {
                title: '操作',
                dataIndex: 'action',
                render: (value, {id}, index) => {
                    return (
                        <a
                            href='javascript:;'
                            className={styles.nowrap}
                            onClick={() => this.onOrderDetail(id)}
                        >查看</a>
                    )
                }
            },
        ]
        const { getFieldDecorator } = this.props.form
        const { list, count, current, pageSize, tabValue } = this.props.mall_after_sale

        return (
            <DocumentTitle title='售后管理'>
                <Page>
                    <Page.ContentHeader
                        title='售后管理'
                        helpUrl="http://newhelp.51zan.cn/manual/content/%E8%99%8E%E8%B5%9E%E5%B0%8F%E5%BA%97/%E5%94%AE%E5%90%8E%E7%AE%A1%E7%90%86.md"
                    />
                    <Page.ContentAdvSearch>
                        <Form onSubmit={this.onSubmit}>
                            <Row>
                                <Col span={8}>
                                    <Form.Item label='订单编号' {...formItemLayout}>
                                        {getFieldDecorator('orderNoInput',{})(
                                            <Input placeholder='请输入'/>
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item label='售后单号' {...formItemLayout}>
                                        {getFieldDecorator('afterNoInput',{})(
                                            <Input placeholder='请输入'/>
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item label='申请时间' {...formItemLayout}>
                                        {getFieldDecorator('rangePicker',{})(
                                            <RangePicker/>
                                        )}
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Button type='primary' icon="search" htmlType='submit' style={{marginLeft: '70px'}}>搜索</Button>
                            <Button style={{marginLeft: '16px'}} onClick={this.onReset}>重置</Button>
                        </Form>
                    </Page.ContentAdvSearch>
                    <Tabs activeKey={tabValue.toString()} onChange={this.onChangeTabs}>
                        {
                            PanesList.map(item => 
                                <TabPane tab={item.tab} key={item.key}>
                                    <Table
                                        key={item.key}
                                        columns={columns}
                                        dataSource={list}
                                        loading={this.state.loading}
                                        pagination={false}
                                        rowKey='id'
                                    />
                                </TabPane>)
                        }
                    </Tabs>
                    {parseFloat(count) ?
                        <Pagination
                            className="ant-table-pagination"
                            current={current + 1}
                            total={parseFloat(count)}
                            showTotal={(total) => `共 ${total} 条`} 
                            showQuickJumper={true} 
                            showSizeChanger={true}  
                            pageSize={pageSize} 
                            pageSizeOptions= {['10', '20', '50', '100']}
                            onShowSizeChange={this.handleChangeSize}
                            onChange={this.goToPage} />
                        : ''
                    }
                </Page>
            </DocumentTitle>
        )
    }
}