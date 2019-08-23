import Page, { DEFAULT_PAGER , DEFAULT_PAGER_FILTER} from '../../../../components/business/Page'
import {connect} from 'dva'
import router from 'umi/router'
import DocumentTitle from 'react-document-title'
import { Button, Tabs, Table, Pagination, Badge, Form, Row, Col, Input, DatePicker ,Select} from 'antd'
import styles from './index.less'
import moment from 'moment'

const { RangePicker } = DatePicker
const Option = Select.Option
const TabPane = Tabs.TabPane
const PanesList = [
    {
        tab: '全部',
        key: ''
    },
    {
        tab: '待付款',
        key: 200
    },
    {
        tab: '待发货',
        key: 205
    },
    {
        tab: '已发货',
        key: 400
    },
    {
        tab: '已完成',
        key: 405
    },
    {
        tab: '已取消',
        key: 207
    },
]


const DEFAULT_CONDITION = {
    orderNo: '',
    mobile: '',
    beginAt: '',
    endAt: '',
    name: '',
    status: '',
    type:'',
}


@Form.create()
@connect(({mall_order_list, base}) =>({
    mall_order_list, base
}))
export default class extends Page.ListPureComponent {
    state = {
        loading: true,
        condition: {...DEFAULT_CONDITION},
        pager: {...DEFAULT_PAGER}
    }


    initPage = (isSetHistory = false) => {
        const condition = this.getParamForObject(DEFAULT_CONDITION, this.props.location.query)
        const pager = this.getParamForObject(DEFAULT_PAGER, this.props.location.query, DEFAULT_PAGER_FILTER)

        const { orderNo, mobile, beginAt, endAt, name ,type} = condition

        this.getPageData(condition, pager, isSetHistory)
        
        this.props.form.setFieldsValue({
            'orderNoInput': orderNo,
            'phoneNoInput': mobile,
            'rangePicker': beginAt && endAt ? [moment(beginAt),moment(endAt)] : [],
            'goodNameInput': name,
            'type':type
        })
    }

    getPageData = (condition, pager, isSetHistory = true,callback) => {
        if( isSetHistory ){
            this.history(condition, pager)
        }

        this.setState({
            condition: condition,
            pager: pager,
            loading: true
        })
        
        this.props.dispatch({
            type: 'mall_order_list/getOrderList',
            payload: {
                page: pager.current - 1,
                per_page: pager.pageSize,
                status: condition.status,
                no: condition.orderNo,
                begin_at: condition.beginAt,
                end_at: condition.endAt,
                mobile: condition.mobile,
                name: condition.name,
                type:condition.type
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
        const { form } = this.props
        
        form.validateFields((error,value) => {
            if (error) return
            let beginAt = '', endAt = ''
            
            if (value.rangePicker && value.rangePicker.length !== 0) {
                beginAt = value.rangePicker[0].format('YYYY-MM-DD')
                endAt = value.rangePicker[1].format('YYYY-MM-DD')
            }

            const condition = {
                ...this.state.condition,
                ...{
                    name: value.goodNameInput,
                    mobile: value.phoneNoInput || '',
                    endAt: endAt,
                    beginAt: beginAt,
                    orderNo: value.orderNoInput || '',
                    type:value.type
                }
            }

            const pager = {
                pageSize : this.state.pager.pageSize,
                current : DEFAULT_PAGER.current
            }
            
            this.getPageData(condition, pager)
        })
    }

    speceValidate = (rules, value, callback) => {
        if (value && /^[\s　]|[ ]$/.test(value)) {
            callback('请勿以空格开头或结束')
        }
        callback()
    }

    /* 事件处理 */
    onSubmit = (e) => {
        e.preventDefault()

        this.searchData()
    }

    onReset = () => {
        this.props.form.resetFields()

        this.searchData()
    }

    onExport = () => {
        const {condition} = this.state

        this.props.dispatch({
            type: 'mall_order_list/orderExport',
            payload: {                
                status: condition.status,
                no: condition.orderNo,
                begin_at: condition.beginAt,
                end_at: condition.endAt,
                mobile: condition.mobile,
                name: condition.name,
                type:condition.type,
            },
            callback: (data) => {
                if (!data.message) {
                    window.location.href = data
                }
            }
        })
    }

    // 查看订单详情
    onOrderDetail = (id) => {
        router.push(`/mall/order_list/order_detail?id=${id}`)
    }

    onOrderSetting = () => {
        router.push(`/mall/order_list/order_setting`)
    }

    onChangeTabs = (value) => {

        let {condition, pager} = this.state

        condition.status = value
        pager.current = DEFAULT_PAGER.current

        this.getPageData(condition, pager)
    }

    render () {
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

        const longItemLayout = {
            labelCol: {
                span: 6,
                style: {
                    width: '96px',
                    textAlign: 'right',
                },
            },
            wrapperCol: {
                span: 16,
            },
        }

        const columns = [
            {
                title: '订单编号',
                dataIndex: 'no'
            },
            {
                title: '商品数量',
                dataIndex: 'goods_amount',
                render: (value, {items}) => {
                    let count = 0
                    items.map(c => {
                        count += c.count
                        return c
                    })
                    return <span>{count}</span>
                }
            },
            {
                title: '状态',
                dataIndex: 'status',
                render: (value) => {
                    switch(value) {
                        case 200:
                            return <Badge status="warning" text="待付款" className={styles.nowrap} />
                        case 205:
                            return <Badge status="processing" text="待发货" className={styles.nowrap} />
                        case 255:
                            return <Badge status="processing" text="待成团" className={styles.nowrap} />
                        case 400:
                            return <Badge status="success" text="已发货" className={styles.nowrap} />
                        case 405:
                            return <Badge status="default" text="已完成" className={styles.nowrap} />
                        case 207:
                            return <Badge status="error" text="已取消" className={styles.nowrap} />
                        default: 
                    }
                }
            },
            {
                title: '收货人手机号',
                dataIndex: 'mobile',
            },
            {
                title: '下单时间',
                dataIndex: 'created_at'
            },
            {
                title: '类型',
                dataIndex: 'type',
                render: (value) => {
                    switch(value) {
                        case 1:
                            return <span className={styles.tag} style={{border: '1px solid #F5222D',color: '#F5222D'}}>拼团</span>
                        case 2:
                            return <span className={styles.tag} style={{border: '1px solid #FA8C16',color: '#FA8C16'}}>特价</span>
                        case 3:
                            return <span className={styles.tag} style={{border: '1px solid #4391FF',color: '#4391FF'}}>推荐</span>
                        case 5:
                            return <span className={styles.tag} style={{border: '1px solid #F5222D',color: '#F5222D'}}>优惠券</span>
                        default: 
                            return <span className={styles.tag} style={{border: '1px solid #999999',color: '#999999'}}>普通</span>
                    }
                }
            },
            {
                title: '来源方式',
                dataIndex: 'source_type',
                render: (value) => {
                    switch (value) {
                        case 1:
                            return <span>个人号</span>
                        case 2:
                            return <span>微信群</span>
                        case 3:
                            return <span>朋友圈</span>
                        default:
                            return <span>扫码搜索</span>
                    }
                }
            },
            {
                title: '操作',
                dataIndex: 'action',
                render: (value, {id,status}, index) => {
                    if (status === 200 || status === 205) {
                        return (
                            <a
                                href='javascript:;'
                                // className={styles.link}
                                onClick={() => this.onOrderDetail(id)}
                            >编辑</a>
                        )
                    } else {
                        return (
                            <a
                                href='javascript:;'
                                // className={styles.link}
                                onClick={() => this.onOrderDetail(id)}
                            >查看</a>
                        )
                    }
                }
            },
        ]

        const orderSetting = <a href='javascript:;' className={styles.link} onClick={this.onOrderSetting}>订单设置</a>
        const { getFieldDecorator } = this.props.form
        
        const { list, count,  tabValue  } = this.props.mall_order_list


        const { current, pageSize } = this.state.pager

        return (
            <DocumentTitle title='订单列表'>
                <Page>
                    <Page.ContentHeader
                        title='订单列表'
                        helpUrl="http://newhelp.51zan.cn/manual/content/%E8%99%8E%E8%B5%9E%E5%B0%8F%E5%BA%97/%E8%AE%A2%E5%8D%95%E7%AE%A1%E7%90%86.md"
                    />
                    <Page.ContentAdvSearch hasGutter={false}>
                        <Form onSubmit={this.onSubmit}>
                            <Row>
                                <Col span={8}>
                                    <Form.Item label='订单编号' {...formItemLayout}>
                                        {getFieldDecorator('orderNoInput',{
                                            rules: [
                                                {
                                                    validator: this.speceValidate
                                                }
                                            ]
                                        })(
                                            <Input placeholder='请输入'/>
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item label='收货人手机号' {...longItemLayout}>
                                        {getFieldDecorator('phoneNoInput',{
                                            rules: [
                                                {
                                                    validator: this.speceValidate
                                                }
                                            ]
                                        })(
                                            <Input placeholder='请输入'/>
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item label='下单时间' {...formItemLayout}>
                                        {getFieldDecorator('rangePicker',{})(
                                            <RangePicker/>
                                        )}
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={8}>
                                    <Form.Item label='商品名称' {...formItemLayout}>
                                        {getFieldDecorator('goodNameInput',{
                                            rules: [
                                                {
                                                    validator: this.speceValidate
                                                }
                                            ]
                                        })(
                                            <Input placeholder='请输入'/>
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item label='订单类型' {...longItemLayout}>
                                        {getFieldDecorator('type',{
                                            // rules: [
                                            //     {
                                            //         validator: this.speceValidate
                                            //     }
                                            // ]
                                        })(
                                            <Select placeholder="全部类型">
                                                <Option value="" key="">全部类型</Option>
                                                <Option value="1" key="1">拼团</Option>
                                                <Option value="2" key="2">特价</Option>
                                                <Option value="3" key="3">推荐</Option>
                                                <Option value="4" key="4">普通</Option>
                                                <Option value="5" key="5">优惠券</Option>
                                            </Select>
                                        )}
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Button type='primary' icon="search" style={{marginLeft: '80px'}} htmlType='submit'>搜索</Button>
                            <Button style={{marginLeft: '16px',width: '82px'}} onClick={this.onReset}>重置</Button>
                            <Button style={{marginLeft: '16px'}} onClick={this.onExport}>Excel导出</Button>
                        </Form>
                    </Page.ContentAdvSearch>
                    <Tabs activeKey={tabValue.toString()} onChange={this.onChangeTabs} tabBarExtraContent={orderSetting}>
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
                            current={current}
                            total={parseFloat(count)}
                            showTotal={(total) => `共 ${total} 条`} 
                            showQuickJumper={true} 
                            showSizeChanger={true}  
                            pageSize={pageSize} 
                            pageSizeOptions= {['10', '20', '50', '100']}
                            onShowSizeChange={this.handleListPageChangeSize}
                            onChange={this.handleListPageChange} />
                        : ''
                    }
                </Page>
            </DocumentTitle>
        )
    }
}
