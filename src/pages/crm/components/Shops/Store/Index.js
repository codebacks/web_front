'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 17/08/18
 */
import React from 'react'
import {
    Col,
    Row,
    Button,
    Icon,
    Table,
    Pagination,
    Form
} from 'antd'
import EditForm from './EditForm'
import CreateForm from './CreateForm'
import Helper from 'crm/utils/helper'
import config from 'crm/common/config'

const {pageSizeOptions} = config

class Stores extends React.Component {
    constructor(props) {
        super()
        const keys = []
        this.state = {}
    }

    loadStores = () => {
        this.props.dispatch({
            type: 'crm_stores/query',
            payload: {},
            callback: (data) => {
            }
        })
    };
    handlePageChange = (page) => {
        this.props.dispatch({
            type: 'crm_stores/query',
            payload: {page: page}
        })
    };

    reload = () => {
        this.handlePageChange(1)
    };

    componentDidMount() {
        this.loadStores()
    }

    handleModify(record) {
        this.props.dispatch({
            type: 'crm_stores/setAttribute',
            payload: {record: record, editModal: true}
        })
    }

    handleCreate = () => {
        this.props.dispatch({
            type: 'crm_stores/setAttribute',
            payload: {createModal: true}
        })
    };

    render() {
        const {pageHeight, initData: {user: userInfo, store_types}} = this.props.base
        const {list, editModal, createModal, params, loading, current, total} = this.props.crm_stores
        const columns = [{
            title: '平台',
            dataIndex: 'type',
            render: (text, record, index) => {
                let item = store_types.filter((item) => {
                    return item.id === window.parseInt(text)
                })
                return item[0].name
            }
        }, {
            title: '店名名称',
            dataIndex: 'name',
        }, {
            title: '操作',
            width: 300,
            dataIndex: 'operation',
            render: (text, record, index) => {
                return (
                    <div>
                        <Button onClick={this.handleModify.bind(this, record)}><Icon
                            type="edit"/>编辑</Button>
                    </div>
                )
            }
        }]
        const getCount = () => {
            if (Helper.getIn(userInfo, 'company.store_count') === 0) {
                return '无限'
            } else {
                return Helper.getIn(userInfo, 'company.store_count') - total <= 0 ? 0 : Helper.getIn(userInfo, 'company.store_count') - total
            }
        }

        return (
            <div className="page" style={{height: pageHeight}}>
                <div className="page-options">
                    <Row>
                        <Col span="12">
                            <Button type="primary" onClick={this.handleCreate} disabled={!getCount()}
                                icon="plus">添加店铺</Button>
                            {Helper.getIn(userInfo, 'company.store_count') !== 0 ?
                                <div style={{display:'inline-block'}}>
                                    {getCount() > 0 ?
                                        <span style={{marginLeft: 8}}>你还可创建{getCount()}家店铺</span>
                                        :
                                        <a style={{marginLeft: 8}} href="/price" className="link" target="_blank"><span
                                            style={{marginRight: 8, color: '#888'}}>你还可创建{getCount()}家店铺</span>升级套餐</a>
                                    }
                                </div>
                                : ''}


                        </Col>
                        <Col span="12" className="textRight">
                        </Col>
                    </Row>
                </div>
                <Row>
                    <Col span="24">
                        <Table
                            columns={columns}
                            dataSource={list}
                            size="middle"
                            loading={loading}
                            rowKey={record => record.id}
                            pagination={false}
                        />
                        {list.length ?
                            <Pagination
                                className="ant-table-pagination"
                                total={total}
                                current={current}
                                showQuickJumper={true}
                                pageSizeOptions={pageSizeOptions}
                                showTotal={total => `共${total}条记录`}
                                pageSize={params.limit}
                                onChange={this.handlePageChange}
                            />
                            : ''}
                    </Col>
                </Row>
                {editModal ? <EditForm {...this.props} reload={this.reload}/> : ''}
                {createModal ? <CreateForm {...this.props} reload={this.reload}/> : ''}

            </div>
        )
    }
}

Stores.propTypes = {}
export default Form.create()(Stores)
