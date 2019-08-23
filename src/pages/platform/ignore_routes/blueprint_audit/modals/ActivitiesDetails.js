/**
 **@time: 2018/10/12
 **@Description:活动详情
 **@author: wangchunting
 */

import React from 'react'
import { connect } from 'dva'
import { Modal, Row, Col, Table, Badge, Popover } from 'antd'
import styles from "../index.less"
import { getRedPacketType, } from '../../../services/examine'
import { LIMIT_TYPE, getActivitieStatus, AUDIT_MODE, GOODS_RULE, getAuditCondition } from '../../../services/blueprint'
import { getShopBluePrintTypeByVal } from '@/common/shopConf'
import { datetime, jine } from '../../../../../utils/display'
import { Label } from 'components/business/Page'

@connect(({ platform_examine }) => ({
    platform_examine
}))

export default class ActivitiesDetails extends React.Component {
    state = {
        visible: false,
    }

    componentDidMount() {
        const { id } = this.props
        if (id) {
            this.setState({
                visible: true,
            })
            this.getDetailsModal(id)

        }
    }

    getDetailsModal = (id) => {
        this.props.dispatch({
            type: 'platform_examine/activitiesDetail',
            payload: {
                id: id,
            },
            callback: () => {
                this.getActivityShops()
            }
        })

    }

    getActivityShops = () => {
        const { activitiesDetailData } = this.props.platform_examine
        let ids = activitiesDetailData.shop_ids
        this.props.dispatch({
            type: 'platform_examine/activity_shops',
            payload: {
                ids: ids
            }
        })

    }

    handleCancel = () => {
        const { onClose } = this.props
        onClose && onClose()
    }

    render() {
        const { activitiesDetailData, activityShopsData } = this.props.platform_examine
        const labelLayout = {
            titlelCol: {
                span: 6,
                style: {
                    width: '80px',
                    textAlign: 'right',
                },
            },
            textCol: {
                span: 16,
            },
        }
        return (
            <div>
                <Modal
                    title="活动详情"
                    footer={null}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    width={900}
                >
                    <div className={`${styles.boxTitle} hz-padding-base-bottom`}>
                        <span className={styles.boxTitleIcon}></span>
                        <span className='hz-margin-small-left'>活动信息</span>
                    </div>
                    <Row className='hz-padding-base-bottom'>
                        <Col span={12}>
                            <Label title="活动名称" text={activitiesDetailData.name} {...labelLayout}></Label>
                        </Col>
                        <Col span={12}>
                            <Label title="活动时间" text={`${datetime(activitiesDetailData.begin_at)} ～ ${datetime(activitiesDetailData.end_at)}`} {...labelLayout}></Label>
                        </Col>
                    </Row>
                    <Row className='hz-padding-base-bottom'>
                        <Col span={12}>
                            <Label title="店铺类型" text={getShopBluePrintTypeByVal(activitiesDetailData.shop_type)} {...labelLayout}></Label>
                        </Col>
                        <Col span={12}>
                            <Label title="活动状态" text={getActivitieStatus(activitiesDetailData.status)} {...labelLayout}></Label>
                        </Col>

                    </Row>
                    <Row className='hz-padding-base-bottom'>
                        <Col span={12}>
                            <Label title="上传截图" text={`${activitiesDetailData.image_count}张`} {...labelLayout}></Label>
                        </Col>
                        <Col span={12}>
                            <Label title="订单时间" text={activitiesDetailData.order_begin_at && activitiesDetailData.order_end_at ? <span> {activitiesDetailData.order_begin_at} ～ {activitiesDetailData.order_end_at}</span> :
                                activitiesDetailData.order_begin_at && !activitiesDetailData.order_end_at ? <span> {activitiesDetailData.order_begin_at} ～ 不限 </span> :
                                    !activitiesDetailData.order_begin_at && activitiesDetailData.order_end_at ? <span>不限～ {activitiesDetailData.order_end_at}</span> :
                                        '--'} {...labelLayout}></Label>
                        </Col>
                    </Row>
                    {
                        activitiesDetailData.goods_rule === GOODS_RULE.allGoods ?
                            <Row className='hz-padding-base-bottom'>
                                <Col span={12}>
                                    <Label title="红包类型" text={getRedPacketType(activitiesDetailData.red_packet_type)} {...labelLayout}></Label>
                                </Col>
                                <Col span={12}>
                                    <Label title="红包金额" text={activitiesDetailData.red_packet_type === 1 ? <span>{activitiesDetailData.activity_amount_rule.amount / 100}元</span> :
                                        activitiesDetailData.red_packet_type === 2 ? activitiesDetailData.activity_amount_rule.format_rule.map((item, index) => {
                                            return <span key={index}>{item.min_amount / 100}元~{item.max_amount / 100}元</span>
                                        }) : activitiesDetailData.red_packet_type === 3 ? activitiesDetailData.activity_amount_rule.format_rule.map((item, index) => {
                                            return <p key={index}>实付金额在{item.min_amount / 100}~{item.max_amount / 100}元的订单返现{item.amount / 100}元</p>
                                        }) : ''} {...labelLayout}></Label>
                                </Col>
                            </Row> : ''
                    }
                    <Row className='hz-padding-base-bottom'>
                        <Col span={12}>
                            <Label title="审核方式" text={activitiesDetailData.audit_mode === AUDIT_MODE.manualAudit ? <span>手动审核</span> : <span>自动审核</span>} {...labelLayout}></Label>
                        </Col>
                        <Col span={12}>
                            <Label title="参与限制" text={activitiesDetailData.limit_type === LIMIT_TYPE.limit ? <span>无限制</span> : activitiesDetailData.limit_type === LIMIT_TYPE.limitDayValue ? <span>同一微信用户 {activitiesDetailData.limit_value} 天内参与一次</span> : activitiesDetailData.limit_type === LIMIT_TYPE.limitSecondValue ? <span>同一微信用户活动期间可参与 {activitiesDetailData.limit_value} 次</span> : ''} {...labelLayout}></Label>
                        </Col>
                    </Row>
                    <Row className='hz-padding-base-bottom'>
                        <Col span={12}>
                            <Label title="参与商品" text={activitiesDetailData.goods_rule === GOODS_RULE.allGoods ? <span>所有商品</span> : <span>指定商品</span>} {...labelLayout}></Label>
                        </Col>
                    </Row>
                    {
                        activitiesDetailData.audit_mode === AUDIT_MODE.automaticAudit ?
                            <Row className='hz-padding-base-bottom'>
                                <Col span={12}>
                                    <Label title="审核条件" text={getAuditCondition(activitiesDetailData.audit_condition)}  {...labelLayout}></Label>
                                </Col>
                            </Row> : ''
                    }
                    <Row className='hz-padding-base-bottom'>
                        <Col span={24}>
                            <Label title="选择店铺" text={activityShopsData && activityShopsData.length ? activityShopsData.map(item => {
                                return <span key={item.id} className="hz-margin-small-right">{item.name}</span>
                            }) : '--'} {...labelLayout}></Label>
                        </Col>
                    </Row>
                    <Row className='hz-padding-base-bottom'>
                        <Col span={24}>
                            <Label title="活动说明" text={activitiesDetailData.explain} {...labelLayout}></Label>
                        </Col>
                    </Row>
                    <div className={`${styles.boxTitle} hz-padding-base-bottom hz-margin-small-top`}>
                        <span className={styles.boxTitleIcon}></span>
                        <span className='hz-margin-small-left'>活动设置</span>
                    </div>
                    <Row className='hz-padding-base-bottom'>
                        <Col span={12}>
                            <Label title="活动过滤" text={activitiesDetailData.is_parallel === 1 ? <span>不过滤</span> : activitiesDetailData.is_parallel === 2 ? <span>过滤</span> : ''} {...labelLayout}></Label>
                        </Col>
                        <Col span={12}>
                            {/* 3=无引流，1=同步新码，2=自定义二维码 */}
                            <Label title="活动引流" text={activitiesDetailData.guide_type === 3 ? <span>无引流</span> : activitiesDetailData.guide_type === 1 ? <span>同步新码</span> : activitiesDetailData.guide_type === 2 ? <span>自定义二维码</span> : ''} {...labelLayout}></Label>
                        </Col>
                    </Row>
                    {
                        activitiesDetailData.goods_rule === GOODS_RULE.appointGoods ?
                            <div>
                                <div className={`${styles.boxTitle} hz-padding-base-bottom hz-margin-small-top`}>
                                    <span className={styles.boxTitleIcon}></span>
                                    <span className='hz-margin-small-left'>指定商品</span>
                                </div>
                                <GoodsActivitirsDetails items={activitiesDetailData.activity_goods_rule} />
                            </div>
                            : ''
                    }
                </Modal>
            </div>
        )
    }
}

class GoodsActivitirsDetails extends React.PureComponent {
    render() {
        const items = this.props.items || []

        const columns = [{
            title: '商品',
            dataIndex: 'goods',
            width: 300,
            render: (text, record) => {
                return <div style={{ display: 'flex' }}>
                    {
                        record.goods && record.goods.pic_url ? <img src={record.goods.pic_url} width="64" height="64" alt="宝贝图片" /> : <div style={{ width: 64, height: 64 }}>暂无图片</div>
                    }
                    {
                        record.goods &&
                        <div className='hz-margin-small-left' style={{ position: 'relative' }}>
                            <div className={styles.textEllipsis}>{record.goods.name}</div>
                            <div style={{ fontSize: 14, color: '#556675', position: 'absolute', bottom: 0, fontWeight: 'bold' }}>￥{jine(record.goods.price, '0,0.00', 'Fen')}</div>
                        </div>
                    }
                </div>
            }
        }, {
            title: '状态',
            width: 160,
            dataIndex: 'goods.status',
            render: (text, record) => {
                switch (text) {
                    case 1:
                        return <Badge status="processing" text='在售'></Badge>
                    case 2:
                        return <Badge status="default" text='下架'></Badge>
                    default:
                        return
                }
            }
        }, {
            title: '所属店铺',
            width: 120,
            dataIndex: 'shop_name',
            render: (text, record) => {
                return <div>{text && text.length > 6 ?
                    <Popover placement="top" content={text}>
                        <div className={styles.ellipsis}>{text}</div>
                    </Popover>
                    : <div>{text}</div>
                }</div>
            }
        }, {
            title: '返现金额',
            width: 160,
            dataIndex: 'isGoodsAmount',
            render: (text, record) => {
                return <div>{jine(record.amount, '0,0.00', 'Fen')}</div>
            }
        }]

        return (
            <Table
                columns={columns}
                dataSource={items}
                pagination={false}
                scroll={{ y: 200 }}
                rowKey="id"
            />
        )
    }
}
