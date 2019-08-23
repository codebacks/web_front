'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 16/12/27
 */
import React, {PropTypes} from 'react'
import {Row, Col, Table, Pagination, Button, Input, Select} from 'antd'
import styles from './Index.scss'
import Search from './Search'
import config from 'crm/common/config'

const {pageSizeOptions} = config

export default class extends React.Component {
    constructor(props) {
        super()
        this.state = {
            visibleHistory: false,
            visibleCreatePlan: false
        }
    }

    componentDidMount() {
        this.props.dispatch({
            type: 'crm_members/query',
            payload: {}
        })
    }

    goPage = (page) => {
        this.props.dispatch({
            type: 'crm_members/query',
            payload: {page: page}
        })
    };

    handleReload = () => {
        this.goPage(1)
    };

    handleDetail = (record, e) => {
        this.setState({visibleHistory: true, record: record})
        e.preventDefault()
    };

    render() {
        const {initData: config, pageHeight} = this.props.base
        const {params, list, loading, total, current} = this.props.crm_members
        const getStoreTypeName = (id) => {
            let _item = config.store_types.filter((item) => {
                return item.id === id
            })
            return _item[0].name

        }
        const columns = [{
            title: '平台',
            dataIndex: 'store.type',
            render: (text, record) => {
                return getStoreTypeName(record.store_type)
            }
        }, {
            title: '会员名',
            dataIndex: 'name',
        }, {
            title: '联系电话',
            dataIndex: 'mobile',
        }]

        return ( <div className={"page " + styles.member}
            style={{height: pageHeight}}>
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
        </div>)
    }
}
