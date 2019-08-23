/**
 **@Description:已拒绝
 **@author: wangchunting
 */

import React, { Component } from 'react'
import { connect } from 'dva'
import { Table, Pagination, Modal, Icon } from 'antd'
import OrderDetails from 'setting/ignore_routes/shop_order/shop_orders_details'
import Viewer from '../modals/viewer'
import styles from '../index.less'
import ActivitiesDetails from '../modals/ActivitiesDetails'
import { getStatus, EXAMINE_CONFIRM_TYPE } from '../../../services/examine'
import { getImageAbsoulteUrl } from '../../../../../utils/resource'
import SyncModalContent from './syncModalContent'

@connect(({ platform_examine }) => ({
    platform_examine
}))

export default class Refused extends Component {
    constructor(props) {
        super(props)
        this.state = {
            currentDetailsID: "",
            currentOrderDetailsID: "",
            viewer: {
                images: [],
                visible: false,
                currentIndex: 0,
                key: null
            },
            visible: false,
        }
    }

    //弹窗--订单详情
    showOrderDetailsModal = (id) => {
        this.setState({
            currentOrderDetailsID: id
        })
    }
    hideOrderDetailsModal = () => {
        this.setState({
            currentOrderDetailsID: ''
        })
    }

    //弹窗--活动详情
    showExamineDetailsModal = (id) => {
        this.setState({
            currentDetailsID: id
        })
    }
    hideExamineDetailsModal = () => {
        this.setState({
            currentDetailsID: ''
        })
    }

    showImageViewer = (index, images, item) => {
        this.setState({
            viewer: {
                visible: true,
                currentIndex: index,
                images: images,
                key: item.id
            }
        })
    }

    onViewerCloseHandler = () => {
        this.setState({
            viewer: {
                ...this.state.viewer,
                visible: false
            }
        })
    }

    // 拒绝原因
    showRefusedDetailModal = (id, message) => {
        Modal.info({
            title: '拒绝原因',
            content: (
                <div>
                    <p>{message}</p>
                </div>
            )
        })
    }

    // 手动同步
    showConfirmTypeModal = (id) => {

        const loadData = (callback) => {
            this.props.dispatch({
                type: 'platform_examine/reviewsDetail',
                payload: {
                    id: id
                },
                callback: () => {
                    const reviewsDetailData = this.props.platform_examine.reviewsDetailData
                    callback(reviewsDetailData.remark)
                }
            })
        }

        Modal.info({
            title: '系统提示',
            content: (
                <div>
                    <SyncModalContent onload={loadData} />
                </div>
            ),
            onOk() {
            },
        })
    }


    render() {
        const { loading, rows_found } = this.props.platform_examine
        const { current, pageSize } = this.props.pager

        const items = this.props.examineData || []
        const columns = [{
            title: '活动信息',
            dataIndex: 'activity',
            fixed: 'left',
            width: 180,
            render: (text, item) => {
                return <div>
                    <p>活动名称：<a href="javascript:;" onClick={() => this.showExamineDetailsModal(item.activity_id)} >{item.activity_name}</a></p>
                    <p>金额：￥{(item.amount / 100).toFixed(2)}</p>
                </div>
            }
        }, {
            title: '申请信息',
            dataIndex: 'apply',
            fixed: 'left',
            width: 240,
            render: (text, item) => {
                return <div>
                    <p>申请时间：</p>
                    <p>{item.apply_at}</p>
                    <p>微信昵称：{item.nick_name}</p>
                </div>
            }
        }, {
            title: '订单信息',
            dataIndex: 'order',
            render: (text, item) => {
                let evaluate = {
                    good: '',
                    bad: '',
                    neutral: '',
                    index: ''
                }
                if (item.evaluate && item.evaluate.length) {
                    item.evaluate.forEach((item, index) => {
                        evaluate.index = index
                        if (item.rate_level === 'good') {
                            evaluate.good = item.total_count
                        } else if (item.rate_level === 'neutral') {
                            evaluate.neutral = item.total_count
                        } else if (item.rate_level === 'bad') {
                            evaluate.bad = item.total_count
                        }
                    })
                }
                return (
                    <div>
                        <p>订单号：{item.order ? <a href="javascript:;" onClick={() => this.showOrderDetailsModal(item.order.id)}>{item.order.no}</a> : '同步中'}</p>
                        <p>下单时间：{item.order ? item.order.created_at : '--'}</p>
                        <p>实付金额：￥{item.order ? (item.order.paid_amount / 100).toFixed(2) : '--'}</p>
                        <div className='hz-margin-small-bottom' key={evaluate.index}>
                            <span>评价：</span>
                            <span><Icon type="smile" theme="outlined" className={styles.orangeColor} /> 好评 {evaluate.good ? evaluate.good : 0}</span>
                            <span className='hz-margin-base-left'><Icon type="meh" theme="outlined" className={styles.yellowColor} /> 中评 {evaluate.neutral ? evaluate.neutral : 0}</span>
                            <span className='hz-margin-base-left'><Icon type="frown" theme="outlined" className={styles.blueColor} /> 差评 {evaluate.bad ? evaluate.bad : 0}</span>
                        </div>
                        <div>
                            <span>售后：</span>
                            {item.order && item.order.order_items ? <a href="javascript:;" onClick={() => this.showOrderDetailsModal(item.order.id)}>查看售后记录</a>
                                : <span>--</span>}
                        </div>
                    </div >
                )
            }
        }, {
            title: '审核状态',
            dataIndex: 'status',
            className: 'hz-table-column-width-180',
            render: (text, item) => {
                return <div>
                    <p>审核状态：
                        <a href="javascript:;" onClick={() => this.showRefusedDetailModal(item.id, item.message)}>
                            {getStatus("refused").text}
                        </a>
                    </p>
                    <p>审核时间：{item.review_at}</p>
                    <p>审核人：{item.operator}</p>
                </div>
            }
        },
        {
            title: '确认方式',
            dataIndex: 'confirm_type',
            width: 100,
            render: (text, item) => {
                if (item.confirm_type === EXAMINE_CONFIRM_TYPE.automatic) {
                    return <div>自动同步</div>
                } else {
                    return <div>
                        <a href="javascript:;" onClick={() => this.showConfirmTypeModal(item.id)}>
                            手动确认
                        </a></div>
                }
            }
        }, {
            title: '审核图片',
            dataIndex: 'image_url',
            width: 185,
            render: (text, record) => {
                const images = record.images.map(item => ({
                    src: getImageAbsoulteUrl(item.url, { autoOrient: true })
                }))

                return <div className={styles.imageViewers}>
                    {
                        record.images && record.images.length ? record.images.map((item, index) => {
                            return <img
                                key={index}
                                src={getImageAbsoulteUrl(item.url, { thumbnail: { width: 40, height: 40 } })}
                                alt={item.alt}
                                onClick={() => this.showImageViewer(index, images, record)}
                                // className={styles.pictureList} />
                                className={`${styles.pictureList} ${record.images.length === 1 ? styles.imageLen1 : record.images.length === 2 ? styles.imageLen2 : styles.imageLen3} `} />

                        }) : <span>--</span>
                    }
                </div>
            }
        }, {
            title: '操作',
            fixed: 'right',
            width: 80,
            render: (text, record) => (
                <span>
                    --
                </span >
            )
        }]

        return (
            <div>
                <Table
                    className='hz-table-content-top'
                    pagination={false}
                    columns={columns}
                    dataSource={items}
                    loading={loading}
                    rowKey="id"
                    scroll={{ x: 1366 }} />
                {
                    items && items.length > 0 && (
                        <Pagination
                            className={styles.wxPagination + ' ant-table-pagination'}
                            total={rows_found}
                            current={current}
                            showQuickJumper={true}
                            showTotal={total => `共 ${rows_found} 条`}
                            pageSize={pageSize}
                            pageSizeOptions={['10', '20', '50', '100']}
                            showSizeChanger={true}
                            onShowSizeChange={this.props.handleListPageChangeSize}
                            onChange={this.props.handleListPageChange}
                        />
                    )
                }
                <Viewer onClose={this.onViewerCloseHandler} key={this.state.viewer.key} visible={this.state.viewer.visible} currentIndex={this.state.viewer.currentIndex} images={this.state.viewer.images} />
                {/* modal--活动详情 */}
                <ActivitiesDetails
                    key={this.state.currentDetailsID}
                    id={this.state.currentDetailsID}
                    onClose={this.hideExamineDetailsModal}
                ></ActivitiesDetails>

                {/* modal--订单详情 */}
                <OrderDetails
                    key={'order' + this.state.currentOrderDetailsID}
                    id={this.state.currentOrderDetailsID}
                    onClose={this.hideOrderDetailsModal}
                ></OrderDetails>
            </div>
        )
    }
}
