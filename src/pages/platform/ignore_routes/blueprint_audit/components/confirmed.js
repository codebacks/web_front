/**
 **@Description:待确定
 **@author: wangchunting
 */

import React, { Component } from 'react'
import { connect } from 'dva'
import { Table, Divider, message, Button, Modal, Pagination, Icon, Popover } from 'antd'
import OrderDetails from 'setting/ignore_routes/shop_order/shop_orders_details'
import Viewer from '../modals/viewer'
import styles from '../index.less'
import ActivitiesDetails from '../modals/ActivitiesDetails'
import { getImageAbsoulteUrl } from '../../../../../utils/resource'
import { ORDER_SYNC_STATUSES } from '../../../services/examine'

@connect(({ platform_examine }) => ({
    platform_examine
}))

export default class Confirmed extends Component {
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
            batchId: ''
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

    // 确认
    getConfirmData = (id) => {
        this.props.dispatch({
            type: 'platform_examine/confirm',
            payload: {
                id: id
            },
            callback: (meta) => {
                if (meta && meta.code === 200) {
                    message.success(`确认成功，可在待审核申请中查看`)
                    this.props.onAddCompleted('ok')
                }
            }
        })
    }

    showConfirm = (item) => {
        this.getConfirmData(item.id)
    }

    // 删除
    getDeleteData = (id) => {
        this.props.dispatch({
            type: 'platform_examine/remove',
            payload: {
                id: id
            },
            callback: (meta) => {
                if (meta && meta.code === 200) {
                    message.success(`删除成功`)
                    this.props.onAddCompleted('ok')
                }
            }
        })
    }

    // 批量确认
    showBatchConfirm = () => {
        Modal.confirm({
            title: "批量确认",
            content: `已选中${this.state.batchId.length}条申请，是否进行批量确认操作`,
            okText: '确定',
            cancelText: '取消',
            iconType: 'question-circle',
            onOk: () => {
                this.getBatchConfirmData(this.state.batchId)
            },
            onCancel: () => {
            },
        })
    }
    getBatchConfirmData = (id) => {
        this.props.dispatch({
            type: 'platform_examine/batchConfirm',
            payload: {
                ids: id
            },
            callback: (meta) => {
                if (meta && meta.code === 200) {
                    message.success(`批量确认成功`)
                    this.props.onAddCompleted('ok')
                }
            }
        })
    }

    //批量删除
    getBatchDeleteData = (id) => {
        this.props.dispatch({
            type: 'platform_examine/batchDelete',
            payload: {
                ids: id
            },
            callback: (meta) => {
                if (meta && meta.code === 200) {
                    message.success(`批量删除成功`)
                    this.props.onAddCompleted('ok')
                }
            }
        })
    }

    // 通过删除弹窗
    showBatchDeleteConfirm = () => {
        Modal.confirm({
            title: "批量删除",
            content: `已选中${this.state.batchId.length}条申请，是否进行批量删除操作`,
            okText: '确定',
            cancelText: '取消',
            iconType: 'question-circle',
            onOk: () => {
                this.getBatchDeleteData(this.state.batchId)
            },
            onCancel: () => {
            },
        })
    }

    // 同步订单
    showSyncOrderConfirm = (id) => {
        this.props.dispatch({
            type: 'platform_examine/sync_order',
            payload: {
                id: id
            },
            callback: (data) => {
                if (data && data.meta.code === 200) {
                    message.success(`同步订单成功`)
                    this.props.onAddCompleted('ok')
                }
            }
        })

    }

    // img
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

    showDeleteConfirm = (item) => {
        this.getDeleteData(item.id)
    }

    render() {
        const { loading, rows_found } = this.props.platform_examine
        const { examineData } = this.props
        const { current, pageSize } = this.props.pager

        const rowSelection = {
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({
                    batchId: selectedRowKeys
                })
                // console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows)
            },
        }
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
                console.log(item.nick_name)
                console.log(item.nick_name.length)
                return <div>
                    <p>申请时间：</p>
                    <p>{item.apply_at}</p>
                    {item.nick_name && item.nick_name.length > 10 ?
                        <Popover placement="top" content={item.nick_name}>
                            <p className={styles.ellipsis} style={{ width: 180 }}>微信昵称：{item.nick_name}</p>
                        </Popover> :
                        <p>微信昵称：{item.nick_name}</p>
                    }
                    <p>申请订单：{item.order_no}</p>
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
                                className={`${styles.pictureList} ${record.images.length === 1 ? styles.imageLen1 : record.images.length === 2 ? styles.imageLen2 : styles.imageLen3} `} />
                        }) : <span>--</span>
                    }
                </div>
            }
        },
        {
            title: '备注',
            dataIndex: 'remarks',
            render: (text, item) => {
                return <div>{item.remark}</div>
            }

        }, {
            title: '操作',
            fixed: 'right',
            width: 200,
            render: (text, record) => (
                <span>
                    <a href="javascript:;" onClick={() => this.showConfirm(record)}>确认</a>
                    <Divider type="vertical" />
                    <a href="javascript:;" onClick={() => this.showDeleteConfirm(record)}>删除</a>
                    {!record.order || (record.order.status !== ORDER_SYNC_STATUSES.complete && record.order.status !== ORDER_SYNC_STATUSES.closed) ?
                        <span><Divider type="vertical" /> <a href="javascript:;"
                            onClick={() => this.showSyncOrderConfirm(record.id)}>同步订单</a></span>
                        : ''}
                </span >
            )
        }]

        return (
            <div>
                <div className='hz-margin-base-bottom'>
                    {this.state.batchId.length > 0 ? <Button onClick={this.showBatchConfirm}>批量确认</Button> : <Button disabled>批量确认</Button>}
                    {this.state.batchId.length > 0 ? <Button onClick={this.showBatchDeleteConfirm} className='hz-margin-base-left'>批量删除</Button> : <Button disabled className='hz-margin-base-left'>批量删除</Button>}
                </div>
                <Table
                    className='hz-table-content-top'
                    pagination={false}
                    columns={columns}
                    dataSource={examineData}
                    rowSelection={rowSelection}
                    loading={loading}
                    rowKey="id"
                    scroll={{ x: 1366 }} />
                {
                    examineData && examineData.length > 0 && (
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
                    key={'activity' + this.state.currentDetailsID}
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
