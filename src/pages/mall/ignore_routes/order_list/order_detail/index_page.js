import { PureComponent } from 'react'
import Page from 'components/business/Page'
import {connect} from 'dva'
// import router from 'umi/router'
import DocumentTitle from 'react-document-title'
import { Button, Table, Form, Row, Col, Input, Steps, Card, message, Select } from 'antd'
import styles from './index.less'
import numeral from 'numeral'

const Step = Steps.Step
const Option = Select.Option
const ImageUrl = '//image.yiqixuan.com/'

@Form.create()
@connect(({mall_order_list, base}) =>({
    mall_order_list, base
}))
export default class extends PureComponent {
    state = {
        loading: false,
        currentStep: 0,
        cardLoading: true,
        isEditPrice: false,
        isEditExpress: false,
        statu: ''
    }

    componentDidMount () {
        const { id } = this.props.location.query
        this.props.dispatch({
            type: 'mall_order_list/orderDetail',
            payload: {
                id: id
            },
            callback: (data) => {
                this.currentStepFunc(data)
                // 请求快递公司信息
                if (data.status === 205) {
                    this.props.dispatch({
                        type: 'mall_order_list/getExpress'
                    })
                }
            }
        })
    }

    /**页面方法 */

    currentStepFunc = (value) => {
        let initialStep = 0, statu = ''
        switch(value.status) {
            case 200:
                initialStep = 0
                statu = '待付款'
                break
            case 205:
                initialStep = 1
                statu = '待发货'
                break
            case 255:
                initialStep = 5
                statu = '待成团'
                break
            case 400:
                initialStep = 2
                statu = '已发货'
                break
            case 405:
                initialStep = 3
                statu = '已完成'
                break
            case 207:
                initialStep = 4
                statu = '已取消'
                break
            default: 
        }
        this.setState({
            currentStep: initialStep,
            cardLoading: false,
            statu: statu
        })
    }

    handleOrderType = (value) => {
        let str = '普通'
        switch(value) {
            case 1:
                str = '拼团'
                break
            case 2:
                str = '特价'
                break
            case 3:
                str = '推荐'
                break
            case 5:
                str = '优惠券'
                break
            default: 
        }
        return str
    }

    searchFilter = (input, option) => {
        const value = input.toUpperCase()
        if (/[a-zA-Z]/.test(value)) {
            if (option.key.indexOf(value) !== -1) {
                return true
            } else {
                return false
            }
        } else if (/[\u4E00-\u9FA5]{1,}/.test(value)) {
            if (option.props.children.indexOf(value) !== -1) {
                return true
            } else {
                return false
            }
        }
    }

    /* 事件处理 */
    onEditPrice = () => {
        this.setState({
            isEditPrice: true
        })
    }

    onEditExpress = () => {
        this.setState({
            isEditExpress: true
        })
    }

    onSavePrice = () => {
        const { form } = this.props
        const { id } = this.props.location.query
        form.validateFields('totalPriceInput',{},(error,value) => {
            if (error) {
                return
            }
            this.props.dispatch({
                type: 'mall_order_list/editTotalPrice',
                payload: {
                    amount: parseFloat(value.totalPriceInput) * 100,
                    id: id
                },
                callback: (status) => {
                    if (status === 200) {
                        this.props.dispatch({
                            type: 'mall_order_list/orderDetail',
                            payload: {
                                id: id
                            },
                            callback: (data) => {
                                message.success('编辑成功')
                                this.setState({
                                    isEditPrice: false
                                })
                                this.currentStepFunc(data)
                            }
                        })
                    }
                }
            })
        })
    }

    onSubmitExpress = (e) => {
        e.preventDefault()
        const { form } = this.props
        const { id } = this.props.location.query
        form.validateFields(['select','expreNoInput'],{},(error,value) => {
            if (error) {
                return
            }
            this.props.dispatch({
                type: 'mall_order_list/editExpress',
                payload: {
                    id: id,
                    express_code: value.select,
                    express_no: value.expreNoInput
                },
                callback: (status) => {
                    if (status === 200) {
                        this.props.dispatch({
                            type: 'mall_order_list/orderDetail',
                            payload: {
                                id: id
                            },
                            callback: (data) => {
                                this.currentStepFunc(data)
                                this.setState({
                                    isEditExpress: false
                                })
                            }
                        })
                    }
                }
            })
        })
    }

    render () {
        const { orderDetail, express } = this.props.mall_order_list
        const { currentStep, cardLoading, isEditExpress, statu } = this.state
        const { getFieldDecorator } = this.props.form
        const labelLayout = {
            titlelCol: {
                span: 6,
                style: {
                    width: '84px',
                    textAlign: 'right',
                    marginTop: '8px'
                },
            },
            textCol: {
                span: 16,
                style: {
                    marginTop: '8px',
                    wordBreak: 'break-all'
                }
            },
        }
        const formItemLayout = {
            labelCol: {
                span: 8,
                style: {
                    width: '88px',
                },
            },
            wrapperCol: {
                span: 16,
            },
        }
        const longLabelLayout = {
            titlelCol: {
                span: 8,
                style: {
                    width: '98px',
                    textAlign: 'right',
                    marginTop: '8px'
                },
            },
            textCol: {
                span: 15,
                style: {
                    marginTop: '8px',
                    wordBreak: 'break-all'
                }
            },
        }
        const wechatNameLabel = {
            titlelCol: {
                span: 8,
                style: {
                    width: '112px',
                    textAlign: 'right',
                    marginTop: '8px'
                },
            },
            textCol: {
                span: 14,
                style: {
                    marginTop: '8px',
                    wordBreak: 'break-all'
                }
            },
        }
        const columns = [
            {
                title: '商品',
                dataIndex: 'name',
                render: (value, {cover_url}) => {
                    return (
                        <div  className={styles.goods}>
                            <img src={ImageUrl + cover_url} alt='' className={styles.goodsImg}/>
                            <span style={{marginLeft: '10px'}}>{value}</span>
                        </div>
                    )
                }
            }, {
                title: '数量',
                dataIndex: 'count',
                align: 'center'
            }, {
                title: '单价',
                dataIndex: 'price',
                align: 'center',
                render: (value) => {
                    return <div>{numeral(value / 100).format('0,00.00')}</div>
                }
            }, {
                title: '运费',
                dataIndex: 'express',
                align: 'center',
                className: styles.expressColumn,
                render: (value) => {
                    return <div>￥{numeral(orderDetail.express_amount / 100).format('0,00.00')}</div>
                }
            }, {
                title: '总价',
                dataIndex: 'amount',
                className: styles.priceColumn,
                align: 'center',
                render: (value, item, index) => {
                    const { isEditPrice } = this.state
                    const obj = {
                        props: {},
                        children: <div className={styles.totalPrice}>
                            <Form layout='inline'>
                                {isEditPrice ?
                                    <Form.Item label='总价'>
                                        {getFieldDecorator('totalPriceInput',{
                                            rules: [
                                                {
                                                    validator: (rules, value, callback) => {
                                                        if (!value) {
                                                            callback('请设置价格')
                                                        } else if (value && !/^[0-9]+(.[0-9]{1,2})?$/.test(value)) {
                                                            callback('请输入正确')
                                                        }
                                                        callback()
                                                    }
                                                }
                                            ],
                                            initialValue: numeral(orderDetail.amount / 100).format('0,00.00')
                                        })(
                                            <Input style={{width: '80px'}}/>
                                        )}
                                    </Form.Item>
                                    :<div className={styles.totalTit}>￥{numeral(orderDetail.amount / 100).format('0,00.00')}</div>}
                                {/* <div style={{marginBottom: '13px'}}>运费：￥{numeral(orderDetail.express_amount / 100).format('0,00.00')}</div>
                                {isEditPrice ?
                                    <Button type='primary' onClick={this.onSavePrice}>保存</Button>
                                    : currentStep === 0 && <Button className={styles.totalButton} onClick={this.onEditPrice}>修改价格</Button>} */}
                            </Form>
                        </div>
                    }
                    if (index === 0) {
                        obj.props.rowSpan = orderDetail.items.length
                    } else {
                        obj.props.rowSpan = 0
                    }
                    return obj
                }
            }, {
                title: '操作',
                dataIndex: 'action',
                align: 'center',
                className: styles.action,
                render: (value, item, index) => {
                    const {isEditPrice} = this.state
                    const obj = {
                        props: {},
                        children: <>
                        {isEditPrice ?
                            <Button type='primary' onClick={this.onSavePrice}>保存</Button>
                            : currentStep === 0 ? <div href="javascript:;" className={styles.textDe} onClick={this.onEditPrice}>修改价格</div> : '--'}
                    </>
                    }
                    if (index === 0) {
                        obj.props.rowSpan = orderDetail.items.length
                    } else {
                        obj.props.rowSpan = 0
                    }
                    return obj
                }
            }
        ]
        return (
            <DocumentTitle title='订单详情'>
                <Page>
                    <Page.ContentHeader
                        hasGutter={false}
                        breadcrumbData={[{
                            name: '订单列表',
                            path: '/mall/order_list'
                        },{
                            name: '订单详情'
                        }]}
                    />
                    <Card loading={cardLoading} bordered={false} bodyStyle={{padding: '0'}}>
                        {currentStep <= 3 && <div className={styles.steps}>
                            <Steps current={currentStep}>
                                <Step title='待付款'/>
                                <Step title='待发货'/>
                                <Step title='已发货'/>
                                <Step title='已完成'/>
                            </Steps>
                        </div>}
                        <Page.ContentBlock title='基本信息' hasDivider={false}>
                            <div className={styles.baseInfo}>
                                <Row className={styles.infoHeader}>
                                    <Col span={6}>
                                        <div className={styles.infoHeaderTit}>订单信息</div>
                                    </Col>
                                    <Col span={6}>
                                        <div className={styles.infoHeaderTit}>收货信息</div>
                                    </Col>
                                    <Col span={6}>
                                        <div className={styles.infoHeaderTit}>配送信息</div>
                                    </Col>
                                    <Col span={6}>
                                        <div className={styles.infoHeaderTit}>买家信息</div>
                                    </Col>
                                </Row>
                                <Row style={{height: '245px'}}>
                                    <Col span={6} className={styles.infoBody}>
                                        <Page.Label title="订单编号" text={orderDetail.no} {...labelLayout} />
                                        <Page.Label title="订单类型" text={this.handleOrderType(orderDetail.type)} {...labelLayout} />
                                        <Page.Label title="订单状态" text={statu} {...labelLayout} />
                                        <Page.Label title="创建时间" text={orderDetail.created_at} {...labelLayout} />
                                        <Page.Label title="付款时间" text={orderDetail.paid_at ? orderDetail.paid_at : '- -'} {...labelLayout} />
                                        <Page.Label title="发货时间" text={orderDetail.delivery_at ? orderDetail.delivery_at : '- -'} {...labelLayout} />
                                        <Page.Label title="收货时间" text={orderDetail.confirmed_at ? orderDetail.confirmed_at : '- -'} {...labelLayout} />
                                    </Col>
                                    <Col span={6} className={styles.infoBody}>
                                        <Page.Label title="收货人姓名" text={orderDetail.consignee} {...longLabelLayout} />
                                        <Page.Label title="收货人手机" text={orderDetail.mobile} {...longLabelLayout} />
                                        <Page.Label
                                            title="收货人地址"
                                            text={
                                                orderDetail.address_detail ? `${orderDetail.province === orderDetail.city ? orderDetail.province : orderDetail.province + orderDetail.city}${orderDetail.county}${orderDetail.address_detail}`
                                                    : ''
                                            }
                                            {...longLabelLayout}
                                        />
                                    </Col>
                                    <Col span={6} className={styles.infoBody}>
                                        {isEditExpress ?
                                            <Form onSubmit={this.onSubmitExpress}>
                                                <Form.Item label={<span style={{color: '#666'}}>快递公司</span>} {...formItemLayout}>
                                                    {getFieldDecorator('select',{
                                                        rules: [
                                                            {
                                                                validator: (rules, value, callback) => {
                                                                    if (!value) {
                                                                        callback('请选择快递公司')
                                                                    }
                                                                    callback()
                                                                }
                                                            }
                                                        ]
                                                    })(
                                                        <Select
                                                            showSearch
                                                            allowClear
                                                            placeholder='搜索快递公司'
                                                            filterOption={this.searchFilter}
                                                        >
                                                            {Object.keys(express).map(item => {
                                                                return <Option value={item} key={item}>{express[item]}</Option>
                                                            })}
                                                        </Select>
                                                    )}
                                                </Form.Item>
                                                <Form.Item label={<span style={{color: '#666'}}>快递单号</span>} {...formItemLayout}>
                                                    {getFieldDecorator('expreNoInput',{
                                                        rules: [
                                                            {
                                                                validator: (rules, value, callback) => {
                                                                    if (!value) {
                                                                        callback('请输入快递单号')
                                                                    }
                                                                    callback()
                                                                }
                                                            }
                                                        ]
                                                    })(
                                                        <Input />
                                                    )}
                                                </Form.Item>
                                                <Button type='primary' style={{marginLeft: '88px'}} htmlType='submit'>保存</Button>
                                            </Form>
                                            :
                                            <div>
                                                <Page.Label title="快递公司" text={orderDetail.express_code ? orderDetail.express_code : '- -'} {...labelLayout} />
                                                <Page.Label title="快递单号" text={orderDetail.express_no ? orderDetail.express_no : '- -'} {...labelLayout} />
                                                {currentStep === 1 &&
                                                    <Button
                                                        type='primary'
                                                        style={{marginLeft: '16px',marginTop: '10px'}}
                                                        onClick={this.onEditExpress}
                                                    >编辑</Button>
                                                }
                                            </div>
                                        }
                                    </Col>
                                    <Col span={6} className={styles.infoBody}>
                                        {orderDetail.user ? 
                                            <div>
                                                {orderDetail.wechat && orderDetail.wechat.nick_name ?
                                                    <Page.Label title="买家微信昵称" text={orderDetail.wechat.nick_name} {...wechatNameLabel} />
                                                    :
                                                    <Page.Label title="买家微信昵称" text='- -' {...wechatNameLabel} />
                                                }
                                                <Page.Label title="买家手机号" text={orderDetail.user.mobile} {...longLabelLayout} />
                                            </div>
                                            : ''
                                        }
                                    </Col>
                                </Row>
                            </div>
                        </Page.ContentBlock>
                        <Page.ContentBlock title='商品信息' hasDivider={false}>
                            <Table
                                columns={columns}
                                pagination={false}
                                dataSource={orderDetail.items}
                                rowKey='id'
                            />
                        </Page.ContentBlock>
                    </Card>
                </Page>
            </DocumentTitle>
        )
    }
}
