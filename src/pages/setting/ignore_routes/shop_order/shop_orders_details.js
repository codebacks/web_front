import React from 'react'
import { Modal, Row, Col, Table, Card } from 'antd'
import { getOrder,getOrderInfo, getOrderFormText, getOrderStatusText } from '../../services/importOrder'
import { getPlatformTypeByVal, getPayTypeByVal } from '../../../../common/shopConf'
import { jine, datetime } from '../../../../utils/display'
import AccorLayout from '../../components/AccorLayout'
import styles from './index.less'

export default class ShopOrdersDetails extends React.PureComponent {
    
    state = {
        visible: false,
        loading: false,
        model: {}
    }

    componentDidMount(){
        const {id,order_no,platform_type} = this.props
        if(id){
            this.setState({
                visible: true,
                loading: true
            })

            this.getModel(id)
        }else if(order_no && platform_type){
            this.setState({
                visible: true,
                loading: true
            })
            this.getOrderDesc({
                order_no:order_no,
                platform_type:platform_type-0
            })
        }
    }
 
    getOrderDesc = (params) =>{
        getOrderInfo(params).then(({data}) => {
            this.setState({
                model: data
            })
        }).finally(() => {
            this.setState({
                loading: false
            })
        })
    }

    getModel = (id) => {
        getOrder(id).then(({data}) => {
            this.setState({
                model: data
            })
        }).finally(() => {
            this.setState({
                loading: false
            })
        })
    }

    cancelHandler = () => {
        const {
            onClose
        } = this.props

        onClose && onClose()
    }

    render(){
        const model = this.state.model
        return (
            <Modal
                width={900}
                visible={this.state.visible}
                title='订单详情'
                footer={null}
                onCancel={this.cancelHandler}
            >
                <Card bodyStyle={{padding: '0'}} bordered={false}  loading={this.state.loading}>
                    {
                        model === undefined ? 
                            '未同步到订单信息或订单不存在':
                            <span>
                                <ShopOrdersContent items={model} />
                                <ShopOrdersDetailsItems items={model.order_items} type={model.data_from} />
                            </span>
                    }
                </Card>
            </Modal>
        )
    }
}




class ShopOrdersContent extends React.PureComponent {
    render(){ 
        const model = this.props.items || {}
        return (
            <Row className={styles.userTable}>
                <div className={styles.userHead}>
                    <div className={styles.tableTitle} style={{width: '35%'}}>订单信息</div>
                    <div className={styles.tableTitle} style={{width: '35%'}}>收货信息</div>
                    <div className={styles.tableTitle} style={{width: '30%'}}>店铺信息</div>
                </div>
                <div className={styles.contWarp}>
                    <div className={styles.column} style={{width: 300}}>
                        <div className={styles.tableCell}>
                            <AccorLayout title='实收金额：' width={80}>
                                {jine(model.paid_amount/100)}{model.delivery_amount ? (<span>(含邮费:￥{jine(model.delivery_amount/100)})</span>) : ''}
                            </AccorLayout>
                            <AccorLayout title='支付方式：' width={80}>
                                {model.pay_type&&getPayTypeByVal(model.pay_type) || '--'}
                            </AccorLayout>
                            <AccorLayout title='订单来源：' width={80}>
                                {getOrderFormText(model.data_from)}
                            </AccorLayout>
                            <AccorLayout title='订单状态：' width={80}>
                                {getOrderStatusText(model.status)}
                            </AccorLayout>
                            <AccorLayout title='订单编号：' width={80}>
                                {model.no}
                            </AccorLayout>
                            <AccorLayout title='创建时间：' width={80}>
                                {datetime(model.created_at)}
                            </AccorLayout>
                            <AccorLayout title='付款时间：' width={80}>
                                {datetime(model.paid_at) || '--'}
                            </AccorLayout>
                            <AccorLayout title='发货时间：' width={80}>
                                {datetime(model.consigned_at) || '--'}
                            </AccorLayout>
                            <AccorLayout title='成交时间：' width={80}>
                                {datetime(model.finished_at)} 
                            </AccorLayout>
                            <AccorLayout title='备注信息：' width={80}>
                                { model.seller_flag ? (<span><img style={{marginRight: 8}} src={require(`../../assets/images/flag${model.seller_flag}.png`)} alt=""  />{model.buyer_remark}</span>) : (model.buyer_remark || '--') }
                            </AccorLayout>
                        </div>  
                    </div>
                    <div className={styles.column} style={{width: 300}}>
                        <div className={styles.tableCell}>
                            <AccorLayout title='收货人：' width={80}>
                                {model.receiver_name}
                            </AccorLayout>
                            <AccorLayout title='联系电话：' width={80}>
                                {model.receiver_mobile}
                            </AccorLayout>
                            <AccorLayout title='收货地址：' width={80}>
                                {`${model.receiver_state}${model.receiver_city}${model.receiver_district}${model.receiver_address}`}
                            </AccorLayout>
                        </div>
                    </div>
                    <div className={styles.column} style={{border: 'none'}}>
                        <div className={styles.tableCell}>
                            <AccorLayout title='店铺名称：' width={80}>
                                {model.shop && model.shop.name}
                            </AccorLayout>
                            <AccorLayout title='平台类型：' width={80}>
                                {model.shop && getPlatformTypeByVal(model.platform_type)}
                            </AccorLayout>
                            <AccorLayout title='购物账号：' width={80}>
                                {model.buyer_username}
                            </AccorLayout>
                        </div> 
                    </div>
                </div>
            </Row>
        )
    }
}


class ShopOrdersDetailsItems extends React.PureComponent {
    renderText = (type) => { 
        if (type === 2) {
            return (
                <Row style={{ textAlign: 'center' }}>
                    <Col>此订单为手工导入订单，导入时未提供宝贝信息</Col>
                </Row>
            )
        } else if(type === 3) { 
            return (
                <Row style={{ textAlign: 'center' }}>
                    <Col>此订单为数据迁移订单，迁移时未获取到宝贝信息</Col>
                </Row>
            )
        }else if(type === 4) { 
            return (
                <Row style={{ textAlign: 'center' }}>
                    <Col>此订单为聚水潭自动同步订单，未获取到宝贝信息</Col>
                </Row>
            )
        }
        return ''
    }
    render(){
        
        const items = this.props.items || []
        let type = this.props.type || ''
        type = parseInt(type,10)
        const columns = [{
            title: '宝贝',
            dataIndex: 'title',
            width: 350,
            render: (text, item) => {
                return <div style={{display: 'flex'}}>
                    <div style={{width: '104px', flexShrink: '0'}} span={12}>
                        {
                            item.pic_url ? <img src={item.pic_url} width="80" height="80" alt="宝贝图片" />:<div>暂无图片</div>
                        } 
                    </div>
                    <div style={{flexGrow: '1'}} span={12}>{item.title}</div>
                </div>
            }
        },{
            title: '数量',
            width: 80,
            dataIndex: 'num'
        },{
            title: '单价',
            width: 120,
            dataIndex: 'price',
            render: (text) => jine(text/100)
        },{
            title: '状态',
            dataIndex: 'status',
            width: 120,
            render: (text, item) => {
                if(item.status){
                    return <span>{item.status?getOrderStatusText(item.status):''}</span>
                }else{
                    return ''
                }
            }
        },{
            title: '评价',
            dataIndex: 'buyer_rated',
            render: (text, item) => {
                if(item.evaluate){
                    return <span>{item.evaluate.content?item.evaluate.content:''}</span>
                }else{
                    return ''
                }
            }
        }]

        return (
            items.length > 0 ?
                <Table
                    columns={columns}
                    dataSource={items}
                    pagination={false}
                    rowKey="outer_sku_no"
                />
                : (this.renderText(type))
        )
    }
}
