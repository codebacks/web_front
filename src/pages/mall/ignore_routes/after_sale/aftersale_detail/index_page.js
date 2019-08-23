import { PureComponent } from 'react'
import Page from 'components/business/Page'
import {connect} from 'dva'
import router from 'umi/router'
import DocumentTitle from 'react-document-title'
import { Button, Table, Form, Row, Col, Input, Steps, Card } from 'antd'
import styles from './index.less'
import numeral from 'numeral'

const Step = Steps.Step
const { TextArea } = Input

@Form.create()
@connect(({mall_after_sale, base}) =>({
    mall_after_sale, base
}))
export default class extends PureComponent {
    state = {
        loading: false,
        cardLoading: false,
        stepValue: 0,
        logs: []
    }

    componentDidMount () {
        const { id } = this.props.location.query
        this.setState({
            cardLoading: true
        })
        this.props.dispatch({
            type: 'mall_after_sale/getAfterDetail',
            payload: {
                id: id
            },
            callback: (data) => {
                this.setState({
                    cardLoading: false,
                    logs: data.logs.reverse()
                })
                this.stepValueFunc(data)
            }
        })
    }
    /* 页面方法 */
    stepValueFunc = (data) => {
        let tempValue = 0
        switch(data.status) {
            case 1: 
                tempValue = 0
                break
            case 2: 
                tempValue = 1
                break
            case 3: 
                tempValue = 2
                break
            default: 
                tempValue = 3
        }
        this.setState({
            stepValue: tempValue
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

    handleRefundReason = (value) => {
        let str = ''
        switch(value) {
            case 1:
                str = '物流太慢/收货太迟'
                break
            case 2:
                str = '发错货'
                break
            case 3:
                str = '尺码偏小'
                break
            case 4:
                str = '尺码偏大'
                break
            case 5:
                str = '脏污/色差'
                break
            default: 
                str = '其它'
        }
        return str
    }

    /* 事件处理 */

    onReturn = () => {
        router.replace(`/mall/after_sale`)
    }

    onDealRefund = (value) => {
        const { id } = this.props.location.query
        const textValue = this.props.form.getFieldValue('textarea') || ''
        this.props.dispatch({
            type: 'mall_after_sale/editAfterOrder',
            payload: {
                id: id,
                remark: textValue,
                status: value
            },
            callback: (status) => {
                if (status === 200) {
                    this.props.dispatch({
                        type: 'mall_after_sale/getAfterDetail',
                        payload: {
                            id: id
                        },
                        callback: (data) => {
                            this.setState({
                                logs: data.logs.reverse()
                            })
                            this.stepValueFunc(data)
                        }
                    })
                }
            }
        })
    }

    render () {
        const labelLayout = {
            titlelCol: {
                span: 6,
                style: {
                    width: '88px',
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
                span: 14,
                style: {
                    marginTop: '8px',
                    wordBreak: 'break-all'
                }
            },
        }
        const recordingCol = {
            lableCol: {
                span: 2,
                style: {
                    width: '78px',
                    textAlign: 'right'
                },
            },
            textCol: {
                span: 22
            }
        }
        const columns = [
            {
                title: '商品',
                dataIndex: 'name'
            }, {
                title: '数量',
                dataIndex: 'count'
            }, {
                title: '商品价格',
                dataIndex: 'amount',
                render: (value,record) => {
                    return <span>{numeral(value / 100).format('0,00.00')}</span>
                    
                }
            },{
                title: '券后单价',
                dataIndex: 'dicount_price',
                render:(value,record) =>{
                    let price = record.amount-record.discount_amount
                    return <span>
                        {price > 0 ? numeral(price / 100).format('0,00.00') : numeral(record.amount / 100).format('0,00.00')}   
                    </span>
                }
            }
        ]
        const { getFieldDecorator } = this.props.form
        const { cardLoading, stepValue,logs } = this.state
        const { orderDetail } = this.props.mall_after_sale
        return (
            <DocumentTitle title='售后订单详情'>
                <Page>
                    <Page.ContentHeader
                        hasGutter={false}
                        breadcrumbData={[{
                            name: '售后管理',
                            path: '/mall/after_sale'
                        },{
                            name: '售后订单详情'
                        }]}
                    />
                    <Card loading={cardLoading} bordered={false} bodyStyle={{padding: '0'}}>
                        {stepValue !== 3 && <div className={styles.steps}>
                            <Steps current={stepValue}>
                                <Step title='待审批'/>
                                <Step title='退款退货中'/>
                                <Step title='已完成'/>
                            </Steps>
                        </div>}
                        <Page.ContentBlock title='基本信息' hasDivider={false}>
                            <div className={styles.baseInfo}>
                                <Row className={styles.infoHeader}>
                                    <Col span={8}>
                                        <div className={styles.infoHeaderTit}>订单信息</div>
                                    </Col>
                                    <Col span={8}>
                                        <div className={styles.infoHeaderTit}>收货信息</div>
                                    </Col>
                                    <Col span={8}>
                                        <div className={styles.infoHeaderTit}>配送信息</div>
                                    </Col>
                                </Row>
                                {orderDetail.order &&
                                    <Row style={{height: '249px'}}>
                                        <Col span={8} className={styles.infoBody}>
                                            <Page.Label title="所属编号" text={orderDetail.order.no} {...labelLayout} />
                                            <Page.Label title="售后编号" text={orderDetail.no} {...labelLayout} />
                                            <Page.Label title="订单类型" text={this.handleOrderType(orderDetail.order.type)} {...labelLayout} />
                                            <Page.Label title="创建时间" text={orderDetail.created_at} {...labelLayout} />
                                            <Page.Label title="付款时间" text={orderDetail.order.paid_at} {...labelLayout} />
                                            <Page.Label title="发货时间" text={orderDetail.order.delivery_at} {...labelLayout} />
                                            <Page.Label title="收货时间" text={orderDetail.order.confirmed_at} {...labelLayout} />
                                        </Col>
                                        <Col span={8} className={styles.infoBody}>
                                            <Page.Label title="收货人姓名" text={orderDetail.order.consignee} {...longLabelLayout} />
                                            <Page.Label title="收货人手机" text={orderDetail.order.mobile} {...longLabelLayout} />
                                            <Page.Label title="收货人地址" text={
                                                `${orderDetail.order.province === orderDetail.order.city ? orderDetail.order.province : orderDetail.order.province + orderDetail.order.city}${orderDetail.order.county}${orderDetail.order.address_detail}`
                                            } {...longLabelLayout} />
                                        </Col>
                                        <Col span={8} className={styles.infoBody}>
                                            <Page.Label title="快递公司" text={orderDetail.order.express_name} {...labelLayout} />
                                            <Page.Label title="快递单号" text={orderDetail.order.express_no} {...labelLayout} />
                                        </Col>
                                    </Row>
                                }
                            </div>
                        </Page.ContentBlock>
                        <Page.ContentBlock title='商品信息' hasDivider={false}>
                            <Table
                                columns={(orderDetail.order && orderDetail.order.type) === 5 ? columns : columns.slice(0,3)}
                                pagination={false}
                                dataSource={orderDetail.items}
                                rowKey='id'
                            />
                        </Page.ContentBlock>
                        <Page.ContentBlock title='售后记录' hasDivider={false}>
                            <Row className={styles.recordBottom}>
                                <Col {...recordingCol.lableCol}>
                                    退款金额：
                                </Col>
                                <Col {...recordingCol.textCol}>
                                    ￥{numeral(orderDetail.refund_amount / 100).format('0,00.00')}
                                </Col>
                            </Row>
                            <Row className={styles.recordBottom}>
                                <Col {...recordingCol.lableCol}>
                                    退款理由：
                                </Col>
                                <Col {...recordingCol.textCol}>
                                    {this.handleRefundReason(orderDetail.reason + 1)}
                                </Col>
                            </Row>
                            <div className={styles.communicatingBox}>
                                {logs.length > 0 && logs.map(item => {
                                    return (
                                        <Row className={styles.communicatingItem} key={item.id}>
                                            <Col {...recordingCol.lableCol}>
                                                {item.user_id ? '买家留言：' : '卖家留言：'}
                                            </Col>
                                            <Col {...recordingCol.textCol}>
                                                <Col>
                                                    {item.remark || '- -'}
                                                </Col>
                                                <Col className={styles.date}>
                                                    {item.updated_at}
                                                </Col>
                                            </Col>
                                        </Row>
                                    )
                                })
                                }
                            </div>
                            {stepValue === 0 ?
                                <div>
                                    <Row className={styles.recordingBottom}>
                                        <Col {...recordingCol.lableCol}>
                                            卖家回复：
                                        </Col>
                                        <Col {...recordingCol.textCol}>
                                            {getFieldDecorator('textarea',{})(
                                                <TextArea style={{width: '240px'}} />
                                            )}
                                        </Col>
                                    </Row>
                                    <Row className={styles.recordingBottom}>
                                        <Button type='primary' style={{marginLeft: '78px'}} onClick={() => this.onDealRefund(2)}>回复买家</Button>                            
                                    </Row>
                                    <Row className={styles.recordingBottom}>
                                        <Button type='primary' style={{marginLeft: '8px'}} onClick={() => this.onDealRefund(3)}>审批通过</Button>    
                                        <Button style={{marginLeft: '24px'}} onClick={this.onReturn}>返回</Button>
                                    </Row>
                                </div>
                                : ''
                            }
                        </Page.ContentBlock>
                    </Card>
                </Page>
            </DocumentTitle>
        )
    }
}
