/**
 **@Description:待审核
 **@author: wangchunting
 */

import React, { Component } from 'react'
import { connect } from 'dva'
import { Table, Divider, Modal, message, Form, Input, Button, Pagination, Icon } from 'antd'
import Viewer from '../modals/viewer'
import OrderDetails from 'setting/ignore_routes/shop_order/shop_orders_details'
import styles from '../index.less'
import ActivitiesDetails from '../modals/ActivitiesDetails'
import { getStatus, getPayStatus, EXAMINE_CONFIRM_TYPE, BATCH_CAUSE, getBatchCauseType, ORDER_SYNC_STATUSES } from '../../../services/examine'
import { getImageAbsoulteUrl } from '../../../../../utils/resource'
import SyncModalContent from './syncModalContent'

@connect(({ platform_examine }) => ({
    platform_examine
}))

export default class Pending extends Component {
    state = {
        currentDetailsID: "",
        currentOrderDetailsID: "",
        rejectId: '',
        viewer: {
            images: [],
            visible: false,
            currentIndex: 0,
            key: null
        },
        batchId: '',
        batchVisible: false,
        visible: false,
        message: '',
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

    //弹窗--通过 
    showAdoptConfirm = (item) => {
        Modal.confirm({
            title: "确认通过",
            content: '确认通过后，将直接打款到对方微信零钱！',
            okText: '确定',
            cancelText: '取消',
            iconType: 'question-circle',
            onOk: () => {
                this.getPassData(item.id)
            },
            onCancel: () => {
            },
        })
    }
    // 弹窗--拒绝
    showRefConfirm = (item) => {
        this.setState({
            visible: true,
            rejectId: item.id
        })
    }

    // 弹窗--批量拒绝
    showBatchRefConfirm = () => {
        this.setState({
            batchVisible: true,
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

    // 弹窗批量通过
    showBatchAdoptConfirm = () => {
        Modal.confirm({
            title: "批量通过",
            content: `批量通过${this.state.batchId.length}条申请，请确保信息正确，确认通过，将直接打款到对方微信零钱`,
            okText: '确定',
            cancelText: '取消',
            iconType: 'question-circle',
            onOk: () => {
                this.getBatchPassData(this.state.batchId)
            },
            onCancel: () => {
            },
        })
    }

    // 通过
    getPassData = (id) => {
        this.props.dispatch({
            type: 'platform_examine/pass',
            payload: {
                id: id
            },
            callback: (meta) => {
                if (meta && meta.code === 200) {
                    message.success(`确认通过成功`)
                    this.props.onAddCompleted('ok')
                }
            }
        })
    }

    // 拒绝
    getRejectData = (message) => {
        this.props.dispatch({
            type: 'platform_examine/reject',
            payload: {
                data: { message, id: this.state.rejectId }
            },
            callback: (meta) => {
                if (meta && meta.code === 200) {
                    message.success(`拒绝成功`)
                    this.props.onAddCompleted('ok')
                    this.props.form.resetFields()
                }
            }
        })
    }

    // 批量通过
    getBatchPassData = (id) => {
        this.props.dispatch({
            type: 'platform_examine/batchPass',
            payload: {
                ids: id
            },
            callback: (meta) => {
                if (meta && meta.code === 200) {
                    message.success(`批量操作成功，通过数量过多时，页面会略有延迟！`)
                    this.props.onAddCompleted('ok')
                }
            }
        })
    }


    // 批量拒绝
    getBatchRejectData = (data) => {
        this.props.dispatch({
            type: 'platform_examine/batchReject',
            payload: {
                data: { ...data, ids: this.state.batchId }
            },
            callback: (meta) => {
                if (meta && meta.code === 200) {
                    message.success(`批量拒绝成功`)
                    this.props.onAddCompleted('ok')
                    this.props.form.resetFields()
                }
            }
        })
    }

    // 通过拒绝弹窗
    handleRejectOk = (e) => {
        e.preventDefault()
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({
                    visible: false,
                    message: values.message
                }, () => {
                    this.getRejectData(this.state.message)
                })
            }
        })
    }
    validateValue = (e) => {
        this.props.form.setFieldsValue({ remarl: this.state.message })
    }

    handleRejectCancel = (e) => {
        this.setState({
            visible: false,
        }, () => {
            this.props.form.resetFields()
        })

    }

    // 拒绝原因
    handleCauseChange = (index) => {
        this.props.form.setFieldsValue({
            message: getBatchCauseType(index)
        })
    }

    // 批量通过拒绝弹窗
    handleBatchRejectOk = (e) => {
        e.preventDefault()
        this.props.form.validateFields((err, values) => {
            if (!err) {
                let data = {
                    message: values.message
                }
                this.getBatchRejectData(data)
                this.setState({
                    batchVisible: false,
                })
            }
        })
    }

    handleBatchRejectCancel = (e) => {
        this.setState({
            batchVisible: false,
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
                    const { reviewsDetailData } = this.props.platform_examine
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
            width: 100,
            render: (text, item) => {
                if (item.status === 1) {
                    return <span className={styles.yellowStatus}>{getStatus("pending").text}</span>
                }
            }
        }, {
            title: '付款状态',
            dataIndex: 'pay_status',
            width: 100,
            render: (text, item) => {
                if (item.pay_status === getPayStatus("pending").value) {
                    return <span className={styles.yellowStatus}>待付款</span>
                } else if (item.pay_status === getPayStatus("payment").value) {
                    return <span className={styles.yellowStatus}>付款中</span>
                } else if (item.pay_status === getPayStatus('alreadyPaid').value) {
                    return <span className={styles.blueStatus}>已付款</span>
                } else if (item.pay_status === getPayStatus('fail').value) {
                    return <span className={styles.redStatus}>付款失败</span>
                }
            }

        }, {
            title: '确认方式',
            dataIndex: 'confirm_type',
            width: 100,
            render: (text, item) => {
                if (item.confirm_type === EXAMINE_CONFIRM_TYPE.automatic) {
                    return <div>自动同步</div>
                } else {
                    return <div> <a href="javascript:;" onClick={() => this.showConfirmTypeModal(item.id)}>手动确认
                    </a>
                    </div>
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
            width: 200,
            render: (text, record) => (
                <span>
                    <a href="javascript:;" onClick={() => this.showAdoptConfirm(record)}>通过</a>
                    <Divider type="vertical" />
                    <a href="javascript:;" onClick={() => this.showRefConfirm(record)}>拒绝</a>
                    {!record.order || (record.order.status !== ORDER_SYNC_STATUSES.complete && record.order.status !== ORDER_SYNC_STATUSES.closed) ?
                        <span><Divider type="vertical" /> <a href="javascript:;"
                            onClick={() => this.showSyncOrderConfirm(record.id)}>同步订单</a></span>
                        : ''}

                </span >
            )
        }]

        const { getFieldDecorator } = this.props.form
        const rowSelection = {
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({
                    batchId: selectedRowKeys
                })
            },
        }

        // 拒绝通过title
        const batchAction = (
            <div>
                <span style={{ fontSize: '16px' }}>批量拒绝</span>
                <span className="hz-page-content-action-description" style={{ fontSize: 12, color: '#999' }}>
                    已选中{this.state.batchId.length}条申请
                </span>
            </div>
        )
        const action = (
            <div>
                <span style={{ fontSize: '16px' }}>拒绝通过</span>
                <span className="hz-page-content-action-description" style={{ fontSize: 12, color: '#999' }}>
                    拒绝原因将反馈给申请人（30个字内）
                </span>
            </div>
        )
        return (
            <div>
                <div className='hz-margin-base-bottom'>
                    {this.state.batchId.length > 0 ? <Button onClick={this.showBatchAdoptConfirm}>批量通过</Button> : <Button disabled>批量通过</Button>}
                    {this.state.batchId.length > 0 ? <Button onClick={this.showBatchRefConfirm} className='hz-margin-base-left'>批量拒绝</Button> : <Button disabled className='hz-margin-base-left'>批量拒绝</Button>}
                </div>
                <Table
                    className='hz-table-content-top'
                    pagination={false}
                    columns={columns}
                    dataSource={items}
                    rowSelection={rowSelection}
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

                {/* 弹窗-拒绝 */}
                <Modal
                    title={action}
                    visible={this.state.visible}
                    onOk={this.handleRejectOk}
                    onCancel={this.handleRejectCancel}
                >
                    <Form>
                        <Form.Item>
                            {getFieldDecorator('message', {
                                rules: [{ required: true, message: '请输入拒绝原因' }],
                            })(
                                <Input placeholder="输入拒绝原因" onChange={this.validateValue} maxLength={30} />
                            )}
                        </Form.Item>
                        <div className={styles.rejectBorder}>
                            {BATCH_CAUSE.map((item, index) => {
                                return (
                                    <div key={index} onClick={() => this.handleCauseChange(index)} style={{ cursor: 'pointer' }}>{item.text}</div>
                                )
                            })}
                        </div>
                    </Form>
                </Modal>
                <Modal
                    title={batchAction}
                    visible={this.state.batchVisible}
                    onOk={this.handleBatchRejectOk}
                    onCancel={this.handleBatchRejectCancel}
                >
                    <Form>
                        <Form.Item>
                            {getFieldDecorator('message', {
                                rules: [{ required: true, message: '请输入拒绝原因' }],
                            })(
                                <Input placeholder="输入拒绝原因" />
                            )}
                        </Form.Item>
                        <div className={styles.rejectBorder}>
                            {BATCH_CAUSE.map((item, index) => {
                                return (
                                    <div key={index} onClick={() => this.handleCauseChange(index)} style={{ cursor: 'pointer' }}>{item.text}</div>
                                )
                            })}
                        </div>
                    </Form>
                </Modal>
            </div>
        )
    }
}
