'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 16/12/27
 */
import React from 'react'
import {Row, Col, Table, Pagination, Button, Icon, Tooltip} from 'antd'
import {connect} from 'dva'
import moment from 'moment'
import qs from 'qs'
import ContentHeader from 'components/business/ContentHeader'
import documentTitleDecorator from 'hoc/documentTitle'
import HistoryModal from 'components/business/HistoryModal'
import API from 'data/common/api/transfer'
import config from 'data/common/config'
import Helper from 'data/utils/helper'
import SearchForm from './SearchForm'
import ModifyForm from './ModifyForm'
import BindOrder from './BindOrder'
import OrderRemark from './OrderRemark'

import styles from './index.scss'

const {pageSizeOptions, DateTimeFormat} = config

@connect(({ base, data_stores, data_transfer, data_orders, data_messages}) => ({
    base, data_stores, data_transfer, data_orders, data_messages
}))
@documentTitleDecorator()
export default class extends React.Component {
    constructor(props) {
        super()
        this.state = {
            visibleHistory: false,
            visibleEdit: false,
            visibleBindOrder: false,
            visibleRemark: false, // 修改备注/用途
            stores: []
        }
    }

    componentDidMount() {
        this.handleSearch()
        this.loadStore()
    }

    loadStore = () => {
        this.props.dispatch({
            type: 'data_stores/query',
            payload: {params: {limit: 1000}},
            callback: (res) => {
                if (res.length) {
                    this.setState({stores: res})
                }
            }
        })
    };

    handleSearch = () => {
        this.props.dispatch({
            type: 'data_transfer/query',
            payload: {params: {offset: 0}}
        })
        this.props.dispatch({
            type: 'data_transfer/queryStat',
            payload: {}
        })
    };

    handleShowHistory = (record) => {
        this.setState({
            historyVisible: true,
            record: record
        })
    }

    handleHideHistory = () => {
        this.setState({
            historyVisible: false,
            record: {}
        })
    }

    handleCancelEdit = () => {
        this.setState({visibleEdit: false, record: null})

    };

    handlePageChange = (page) => {
        this.props.dispatch({
            type: 'data_transfer/query',
            payload: {page: page},
        })
    };

    handleEdit = (record) => {
        this.setState({visibleEdit: true, record: record})
    };

    handleCancelBind = () => {
        this.setState({visibleBindOrder: false, record: null})
        this.props.dispatch({
            type: 'data_transfer/queryStat',
            payload: {}
        })

    };

    handleShowBindOrder = (record) => {
        this.setState({visibleBindOrder: true, record: record})
    };
    handleCancelRemark = () => {
        this.setState({visibleRemark: false, record: null})
        this.props.dispatch({
            type: 'data_transfer/queryStat',
            payload: {}
        })

    };

    handleShowRemark = (record) => {
        this.setState({visibleRemark: true, record: record})
    };


    handleChangeSize = (current, size) => {
        let params = {...this.props.data_transfer.params}
        params.limit = size
        this.props.dispatch({
            type: 'data_transfer/setProperty',
            payload: {params: params},
        })
        this.props.dispatch({
            type: 'data_transfer/query',
            payload: {params: {offset: 0}}
        })
    };

    render() {
        const {params, list, loading, total, current, stats} = this.props.data_transfer
        const {historyVisible, record} = this.state
        // const getStoreName = (_id) => {
        //     let store = this.state.stores.filter((item) => {
        //         return item.id === _id
        //     })
        //     return store.length ? store[0].name : ''
        // }
        const columns = [{
            title: '好友微信昵称',
            dataIndex: 'friend.target.nickname',
            className: styles.firstColumn,
        }, {
            title: '收款微信备注',
            dataIndex: 'friend.target.remark_name',
            // }, {
            // 	title: '手机号',
            // 	dataIndex: 'friend.target.mobile',
            // }, {
            // 	title: '订单号',
            // 	dataIndex: 'outer_order_id',
            // 	render: (text, record, index) => {
            // 		return <div className={styles.edit}>{text}&nbsp;<Icon type="edit"
            // 		                                                      onClick={this.handleShowBindOrder.bind(this, record)}
            // 		                                                      className={styles.editIcon}/></div>
            // 	}
            // }, {
            // 	title: '店铺',
            // 	dataIndex: 'store_id',
            // 	render: (text, record, index) => {
            // 		if (record.store_id) {
            // 			return getStoreName(record.store_id);
            // 		} else {
            // 			return ''
            // 		}
            // 	}
        }, {
            title: '备注/用途',
            dataIndex: 'remark',
            width: 160,
            render: (text, record, index) => {
                return <div className={styles.edit}>
                    <div className="overElli" style={{width: 120, marginRight: 20}}>
                        <Tooltip placement="topLeft"
                            title={text}>{text}</Tooltip>&nbsp;
                    </div>
                    <Icon type="edit"
                        onClick={()=>{this.handleShowRemark(record)}}
                        className={styles.editIcon}/></div>
            }
        }, {
            title: '类型',
            dataIndex: 'type',
            render: (text, record, index) => {
                if (text === 2000) {
                    return '转账'
                } else if (text === 2001) {
                    return '红包'
                } else if (text === 2002) {
                    return '二维码转账'
                }
            }
        }, {
            title: '状态',
            dataIndex: 'status',
            width: 100,
            render: (text, record, index) => {
                let txts = {'-1': '退回', '1': '待收', '3': '已收', '5': '非实时已收', '7': '非实时待收', '0': '未知'}
                return <div className={styles.edit}>{txts[text]}</div>
            }
        }, {
            title: '金额（元）',
            dataIndex: 'amount',
            render: (text, record, index) => {
                if (record.type === 2001) {
                    return <div className={styles.edit}>{text}
                        <Icon type="edit" className={styles.editIcon} onClick={()=>{this.handleEdit(record)}}/>
                    </div>
                } else {
                    return <div className={styles.edit}>{text}</div>
                }
            }
        }, {
            title: '转入/转出',
            dataIndex: 'is_sender',
            render: (text, record, index) => {
                return <div className={styles.edit}>{text ? '转出' : '转入'}</div>
            }
        }, {
            title: '时间',
            dataIndex: 'create_time',
            render: (text, record, index) => {
                return moment(record.begin_transfer_time * 1000).format(DateTimeFormat)
            }
        },
        {
            title: '所属部门',
            dataIndex: 'department',
            render: (text, record, index) => {
                if(record.user && record.user.departments){
                    let departments = record.user.departments
                    return departments.map((item)=>{
                        return item.name
                    }).join('，')
                }
                return ''
            }
        },
        {
            title: '所属员工',
            dataIndex: 'user.nickname',
            render: (text, record, index) => {
                if(record.user){
                    return record.user.nickname
                }
            }
        },
        {
            title: '所属微信',
            dataIndex: 'friend.from.nickname',
            render: (nickname, record) => {
                const remark = record.friend && record.friend.from && record.friend.from.remark
                return remark || nickname
            }
        },
        {
            title: '操作',
            dataIndex: 'option',
            render: (text, record, index) => {
                if (record.friend.target.id) {
                    return (<span className={styles.look} onClick={()=>{this.handleShowHistory(record)}}>查看</span>)
                }
            }
        }]
        let export_params = {...this.props.data_transfer.params}
        export_params.limit = this.props.data_transfer.total
        export_params.offset = 0
        let {accessToken} = this.props.base
        let export_url = Helper.getAccessTokenUrl(`${API.export.url}?${qs.stringify(export_params)}`, accessToken)
        return (
            <div className={styles.transfer}>
                <ContentHeader
                    contentType={'title'}
                    content={{
                        title: this.props.documentTitle,
                    }}
                    help={{
                        url: 'http://newhelp.51zan.cn/manual/content/%E6%95%B0%E6%8D%AE%E4%B8%AD%E5%BF%83/%E8%B4%A2%E5%8A%A1%E7%BB%9F%E8%AE%A1.md'
                    }}
                />
                <div className={styles.check}>
                    <SearchForm {...this.props} onSearch={this.handleSearch} _stores={this.state.stores}/>
                    <div className={styles.summary}>
                        <Row gutter={20} style={{marginBottom: 20}}>
                            <Col span={3}>
                                <div className={styles.item}>
                                    <h4>转账笔数（出）</h4>
                                    <strong>{stats.transfer_out_count}</strong>
                                </div>
                            </Col>
                            <Col span={3}>
                                <div className={styles.item}>
                                    <h4>转账金额（出）</h4>
                                    <strong>{stats.transfer_out_amount}元</strong>
                                </div>
                            </Col>
                            <Col span={3}>
                                <div className={styles.item}>
                                    <h4>红包笔数（出）</h4>
                                    <strong>{stats.red_envelope_out_count}</strong>
                                </div>
                            </Col>
                            <Col span={3}>
                                <div className={styles.item}>
                                    <h4>红包金额（出）</h4>
                                    <strong>{stats.red_envelope_out_amount}元</strong>
                                </div>
                            </Col>
                            <Col span={3}>
                                <div className={styles.item}>
                                    <h4>二维码笔数（出）</h4>
                                    <strong>{stats.qr_code_out_count}</strong>
                                </div>
                            </Col>
                            <Col span={3}>
                                <div className={styles.item}>
                                    <h4>二维码金额（出）</h4>
                                    <strong>{stats.qr_code_out_amount}元</strong>
                                </div>
                            </Col>
                            <Col span={3}>
                                <div className={styles.item}>
                                    <h4>总计笔数（出）</h4>
                                    <strong>{stats.out_count}</strong>
                                </div>
                            </Col>
                            <Col span={3}>
                                <div className={styles.item}>
                                    <h4>总计金额（出）</h4>
                                    <strong>{stats.out_amount}元</strong>
                                </div>
                            </Col>
                        </Row>
                        <Row gutter={20}>
                            <Col span={3}>
                                <div className={styles.item}>
                                    <h4>转账笔数（进）</h4>
                                    <strong>{stats.transfer_in_count}</strong>
                                </div>
                            </Col>
                            <Col span={3}>
                                <div className={styles.item}>
                                    <h4>转账金额（进）</h4>
                                    <strong>{stats.transfer_in_amount}元</strong>
                                </div>
                            </Col>
                            <Col span={3}>
                                <div className={styles.item}>
                                    <h4>红包笔数（进）</h4>
                                    <strong>{stats.red_envelope_in_count}</strong>
                                </div>
                            </Col>
                            <Col span={3}>
                                <div className={styles.item}>
                                    <h4>红包金额（进）</h4>
                                    <strong>{stats.red_envelope_in_amount}元</strong>
                                </div>
                            </Col>
                            <Col span={3}>
                                <div className={styles.item}>
                                    <h4>二维码笔数（进）</h4>
                                    <strong>{stats.qr_code_in_count}</strong>
                                </div>
                            </Col>
                            <Col span={3}>
                                <div className={styles.item}>
                                    <h4>二维码金额（进）</h4>
                                    <strong>{stats.qr_code_in_amount}元</strong>
                                </div>
                            </Col>
                            <Col span={3}>
                                <div className={styles.item}>
                                    <h4>总计笔数（进）</h4>
                                    <strong>{stats.in_count}</strong>
                                </div>
                            </Col>
                            <Col span={3}>
                                <div className={styles.item}>
                                    <h4>总计金额（进）</h4>
                                    <strong>{stats.in_amount}元</strong>
                                </div>
                            </Col>
                        </Row>
                    </div>
                    <div className={styles.list}>
                        {list.length ?
                            <div className={styles.export}>
                                <a href={export_url} target="_blank" rel="noopener noreferrer" id="export"><Button
                                    icon="export">导出以下数据</Button></a>
                            </div>
                            : ''}
                        <div>
                            <Table
                                columns={columns}
                                dataSource={list}
                                size="middle"
                                loading={loading}
                                rowKey={record => record.id}
                                pagination={false}
                            />
                        </div>
                        <Pagination
                            className="ant-table-pagination"
                            total={total}
                            current={current}
                            showQuickJumper={true}
                            pageSizeOptions={pageSizeOptions}
                            showTotal={total => `共${total}条`}
                            pageSize={params.limit}
                            showSizeChanger={true}
                            onShowSizeChange={this.handleChangeSize}
                            onChange={this.handlePageChange}
                        />
                    </div>
                    {historyVisible ? <HistoryModal {...this.props}
                        visible={historyVisible}
                        record={record}
                        fromUin={record.friend.from.uin}
                        toUsername={record.friend.target.username}
                        onCancel={this.handleHideHistory}
                    /> : null}

                    {this.state.visibleEdit ?
                        <ModifyForm
                            {...this.props}
                            visible={this.state.visibleEdit}
                            record={this.state.record}
                            onSearch={this.handleSearch}
                            onCancel={this.handleCancelEdit}/>
                        : ''}
                    {this.state.visibleBindOrder ?
                        <BindOrder
                            {...this.props}
                            visible={this.state.visibleBindOrder}
                            record={this.state.record}
                            _stores={this.state.stores}
                            onCancel={this.handleCancelBind}/>
                        : ''}
                    {this.state.visibleRemark ?
                        <OrderRemark
                            {...this.props}
                            visible={this.state.visibleRemark}
                            record={this.state.record}
                            onCancel={this.handleCancelRemark}/>
                        : ''}

                </div>
            </div>
        )
    }
}
