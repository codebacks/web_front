'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 16/12/27
 */
import React from 'react'
import { Row, Col, Table, Popconfirm, Pagination, Button} from 'antd'
import moment from 'moment'
import config from 'crm/common/config'
import PlanDetail from './Detail'
import styles from './Index.scss'
import Search from './Search'
import Create from './Create'
import Modify from './Modify'
import Customers from './Customers'

const {pageSizeOptions, DateTimeFormat, DateFormat} = config

export default class extends React.Component {
    constructor(props) {
        super()
        this.state = {
            visibleDetail: false,
            record: {},
            loading: false,
            showCustomers: false
        }
    }

    componentDidMount() {
        this.props.dispatch({
            type: 'crm_plans/query',
            payload: {params: {offset: 0, limit: 10}}
        })
    }

    handleSearch = () => {
        this.props.dispatch({
            type: 'crm_plans/query',
            payload: {page: 1}
        })
    };

    handleDetail = (record, e) => {
        this.setState({visibleDetail: true, record: record})
        e.preventDefault()
    };
    handleCancel = () => {
        this.setState({visibleDetail: false, record: {}, showCustomers: false, showModify: false})
    };

    goPage = (page) => {
        this.props.dispatch({
            type: 'crm_plans/query',
            payload: {page: page},
        })
    };

    handleReload = () => {
        this.goPage(1)
    };

    handleReloadCurrent = () => {
        const {current} = this.props.crm_plans
        this.goPage(current)
    };

    handleQueryKeydown = (e) => {
        if (e.keyCode === 13) {
            this.handlePageChange(1)
        }
    };
    handleCreate = () => {
        this.props.dispatch({
            type: 'crm_plans/setProperty',
            payload: {createModal: true, toCustomers: []},
        })
    };

    handleRemove = (id) => {
        this.setState({loading: true})
        this.props.dispatch({
            type: 'crm_plans/remove',
            payload: {id: id},
            callback: () => {
                this.handleSearch()
                this.setState({loading: false})
            }
        })
    };

    handleShowCustomers = (record) => {
        this.setState({showCustomers: true, record: record})
    };

    handleModify = (record) => {
        this.setState({showModify: true, record: record})
    };


    render() {
        const {pageHeight} = this.props.base
        const {params, list, loading, total, current, createModal} = this.props.crm_plans
        const columns = [{
            title: ' 计划标题',
            dataIndex: 'title',
            width: 120,
        }, {
            title: '计划描述',
            dataIndex: 'desc',
        }, {
            title: '参加人员',
            dataIndex: 'to_customer_ids',
            width: 80,
            render: (text, record) => {
                return <span onClick={this.handleShowCustomers.bind(this, record)}
                    className="link">{Array.from(text).length}</span>
            }
        }, {
            title: '发起时间',
            dataIndex: 'create_time',
            width: 150,
            render: (text) => {
                return moment(parseInt(text) * 1000).format(DateTimeFormat)
            }
        }, {
            title: '开始时间',
            dataIndex: 'start_time',
            width: 90,
            render: (text) => {
                return moment(parseInt(text) * 1000).format(DateFormat)
            }
        }, {
            title: '结束时间',
            dataIndex: 'end_time',
            width: 90,
            render: (text) => {
                return moment(parseInt(text) * 1000).format(DateFormat)
            }
        }, {
            title: '发送率',
            dataIndex: 'record.success_customer_ids',
            width: 80,
            render: (text, record) => {
                if (record.to_customer_ids.length) {
                    return ((record.success_customer_ids.length / record.to_customer_ids.length) * 100).toFixed(2) + '%'
                } else {
                    return 0
                }
            }
            // }, {
            //     title: '回复率',
            //     dataIndex: 'record.reply_customer_ids',
            //     width: 80,
            //     render: (text, record) => {
            //         if (record.to_customer_ids.length) {
            //             return ((record.reply_customer_ids.length / record.to_customer_ids.length) * 100).toFixed(2) + '%'
            //         } else {
            //             return 0
            //         }
            //     }
        }, {
            title: '参加率',
            dataIndex: 'record.transfer_customer_ids',
            width: 80,
            render: (text, record) => {
                if (record.to_customer_ids.length) {
                    return ((record.transfer_customer_ids.length / record.to_customer_ids.length) * 100).toFixed(2) + '%'
                } else {
                    return 0
                }
            }
        }, {
            title: '操作',
            dataIndex: 'option',
            width: 240,
            render: (text, record, index) => {
                return <div className={styles.options}>
                    <Button size="small" onClick={this.handleModify.bind(this, record)} icon="edit">修改</Button>
                    <Button size="small" onClick={this.handleDetail.bind(this, record)} icon="eye">查看</Button>
                    <Popconfirm placement="bottomRight" title="确认删除该任务?"
                        onConfirm={this.handleRemove.bind(this, record.id)}
                        okText="确认"
                        cancelText="取消">
                        <Button size="small" loading={this.state.loading} icon="close" type="danger">删除</Button>
                    </Popconfirm>
                </div>
            }
        }]

        return (
            <div className={styles.plan}
                style={{height: pageHeight}}>
                <div className="page-options">
                    <Row>
                        <Col span="12">
                            <Button onClick={this.handleCreate} icon="plus" type="primary">新增计划</Button>
                        </Col>
                        <Col span="12" className="textRight">
                        </Col>
                    </Row>
                </div>
                <Search {...this.props} search={this.handleReload}/>

                <div className={styles.list}>
                    <Table
                        columns={columns}
                        dataSource={list}
                        size="middle"
                        loading={loading}
                        rowKey={record => record.id}
                        pagination={false}
                    />
                    <Pagination
                        className="ant-table-pagination"
                        total={total}
                        current={current}
                        showQuickJumper={true}
                        pageSizeOptions={pageSizeOptions}
                        showTotal={total => `共${total}条`}
                        pageSize={params.limit}
                        onChange={this.goPage}
                    />
                </div>
                {this.state.visibleDetail ?
                    <PlanDetail {...this.props} visible={this.state.visibleDetail}
                        record={this.state.record}
                        reload={this.handleReloadCurrent}
                        onCancel={this.handleCancel}/>
                    : ''}
                {this.state.showCustomers ?
                    <Customers {...this.props} visible={this.state.showCustomers}
                        record={this.state.record}
                        reload={this.handleReloadCurrent}
                        onCancel={this.handleCancel}/> : ''
                }
                {this.state.showModify ?
                    <Modify {...this.props} visible={this.state.showModify}
                        record={this.state.record}
                        reload={this.handleReloadCurrent}
                        onCancel={this.handleCancel}/> : ''
                }
                {createModal ? <Create {...this.props} reload={this.handleReload}/> : ''}
            </div>)
    }
}
