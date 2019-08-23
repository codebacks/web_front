'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 16/12/8
 */
import React from 'react'
import {Modal, Popconfirm, Button, Table} from 'antd'
import styles from './Create.scss'
import config from 'crm/common/config'

const {Sex} = config

class Customers extends React.Component {
    constructor(props) {
        super()
        this.state = {
            loading: {}
        }
    }

    loadCustomers = () => {
        this.props.dispatch({
            type: 'crm_plans/queryCustomers',
            payload: {id: this.props.record.id}
        })
    };

    componentDidMount() {
        this.loadCustomers()
    }

    handleRemoveCustomer = (record) => {
        let _loading = {...this.state.loading}
        _loading[record.id] = true
        this.setState({loading: _loading})
        this.props.dispatch({
            type: 'crm_plans/removeCustomer',
            payload: {plan_id: this.props.record.id, customer_id: record.customer.id},
            callback: () => {
                _loading[record.id] = false
                this.setState({loading: _loading})
                this.props.reload && this.props.reload()
                this.loadCustomers()
                this.props.onRemoveCustomer && this.props.onRemoveCustomer(record.customer.id)
            }
        })
    };

    render() {
        const {customers} = this.props.crm_plans
        const columns = [{
            title: '姓名',
            dataIndex: 'customer.name',
            key: 'name',
        }, {
            title: '手机号',
            dataIndex: 'customer.mobile',
            key: 'mobile',
        }, {
            title: '性别',
            dataIndex: 'customer.gender',
            key: 'gender',
            render: (text) => {
                return Sex[text]
            }
        }, {
            title: '唯一标识',
            dataIndex: 'customer.unique_name',
            key: 'unique_name',
        }, {
            title: '操作',
            dataIndex: 'option',
            key: 'option',
            render: (text, record, index) => {
                return <Popconfirm placement="left" title="确认从当前计划中删除？"
                    onConfirm={this.handleRemoveCustomer.bind(this, record)} okText="确认" cancelText="取消">
                    <Button type="danger" size="small" icon="close" loading={this.state.loading[record.id]}>删除</Button>
                </Popconfirm>
            }
        }]
        return (
            <Modal
                visible={this.props.visible}
                title="参与人员"
                onCancel={this.props.onCancel}
                width={600}
                footer={[
                    <Button key="back" size="large" onClick={this.props.onCancel}>关闭</Button>,
                ]}
            >
                <div className={styles.content} style={{height: 400, overflow: 'auto'}}>
                    <Table columns={columns}
                        dataSource={customers}
                        showTotal={total => `共${total}条`}
                        size="small"
                        rowKey={record => record.id}
                    />
                </div>
            </Modal>
        )
    }
}

export default Customers
