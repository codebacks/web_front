/*
 * @Author: sunlzhi 
 * @Date: 2018-11-19 16:05:24 
 * @Last Modified by: sunlizhi
 * @Last Modified time: 2018-11-22 11:49:59
 */

import React, {Component} from 'react'
import { Modal, Table, Pagination } from 'antd'
import styles from '../index.less'

export default class CustomerDetails extends Component {
    state = {
        pager: {
            offset: 1,
            limit: 10,
            loading: false,
        },
    }

    // 页面加载调用
    componentDidMount() {
        const {id} = this.props
        if (id) {
            this.getCustomerList(id)
        }
    }

    // 获取客户列表
    getCustomerList = () => {
        const {pager} = this.state
        this.setState({
            loading: true
        })
        this.props.dispatch({
            type: 'customer_group/customerList',
            payload: {
                id: this.props.id,
                offset: (pager.offset - 1) * pager.limit,
                limit: pager.limit,
            },
            callback: () => {
                this.setState({
                    loading: false
                })
            }
        })
    }

    // 客户列表分页跳转
    goTemplatePage = (val) => {
        const {pager} = this.state
        pager.offset = val
        this.setState({
            pager
        },()=>{
            this.getCustomerList()
        })
    }

    // 关闭弹窗
    handleCancel = () => {
        this.props.handleCancel()
    }

    // 时间戳转日期
    timestampToTime(timestamp) {
        var date = new Date(timestamp * 1000) // 时间戳为10位需*1000，时间戳为13位的话不需乘1000
        var Y = date.getFullYear() + '-'
        var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-'
        var D = (date.getDate() < 10 ? '0'+date.getDate(): date.getDate()) + ' '
        var h = (date.getHours() < 10 ? '0'+date.getHours(): date.getHours()) + ':'
        var m = (date.getMinutes() < 10 ? '0'+date.getMinutes(): date.getMinutes()) + ':'
        var s = date.getSeconds() < 10 ? '0'+date.getSeconds(): date.getSeconds()
        return Y + M + D + h + m + s
    }

    render () {
        const {customerList, customerPagination} = this.props.customer_group
        const {title} = this.props
        const {pager, loading} = this.state
        
        // 开具此发票的订单列表
        const columns = [
            {
                title: '姓名',
                dataIndex: 'name',
                className: styles.tableColumns,
            }, {
                title: '手机号',
                dataIndex: 'mobile',
                className: styles.tableColumns,
            }, {
                title: '微信昵称',
                dataIndex: 'wechat_nickname',
                className: styles.tableColumns,
            }, {
                title: '微信备注',
                dataIndex: 'wechat_remark_name',
                className: styles.tableColumns,
            }, {
                title: '购物账号',
                dataIndex: 'platform_user_id',
                className: styles.tableColumns,
            }, {
                title: '所属部门',
                dataIndex: 'department_name',
                className: styles.tableColumns,
            }, {
                title: '所属员工',
                dataIndex: 'user_nickname',
                className: styles.tableColumns,
            }, {
                title: '所属微信',
                dataIndex: 'service_wechat_nickname',
                className: styles.tableColumns,
            }, {
                title: '创建时间',
                dataIndex: 'create_time',
                className: styles.tableColumns,
                render: (text, record) => {
                    return (
                        <div>{this.timestampToTime(text)}</div>
                    )
                },
            }, {
                title: '客户备注',
                dataIndex: 'remark',
                className: styles.tableColumns,
                render: (text, record) => {
                    return (
                        <div>{text?text:'--'}</div>
                    )
                },
            },
        ]
        return <Modal
            title={title}
            width={1200}
            className={styles.invoicDetail}
            footer={null}
            visible={this.props.visible}
            destroyOnClose={true}
            onCancel={this.handleCancel}>
            <Table 
                columns={columns}
                dataSource={customerList}
                loading={loading}
                pagination={false} 
                rowKey="id"
            />
            {customerPagination.rows_found > 0 &&
                    <Pagination
                        size="small"
                        style={{textAlign: 'right', marginTop: 16}}
                        current={pager.offset}
                        pageSize={pager.limit} 
                        total={customerPagination.rows_found}
                        showTotal={(total) => `共 ${total} 条`} 
                        showQuickJumper={true} 
                        onChange={this.goTemplatePage} />
            }
        </Modal>
    }
}
