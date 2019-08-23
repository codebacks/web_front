import React, {Component} from 'react'
import { Modal, Form, Row, Input, Table, Pagination } from 'antd'
import styles from '../index.less'
import {connect} from 'dva'
const Search = Input.Search
@connect(({setting_ordersImport, base}) => ({
    setting_ordersImport,
    base,
}))
export default class FailCount extends Component{
    constructor(){
        super()
        this.state = {
            order_no: '',
        }
    }
    saveFailCount = ()=> {
        this.cancelFailCount()
    }
    cancelFailCount = ()=> {
        this.props.onChange()
    }
    failSearch = (value)=> {
        this.props.dispatch({
            type: 'setting_ordersImport/setProperty',
            payload: { loading: true }
        })
        const { currentItem } = this.props.setting_ordersImport
        this.props.dispatch({
            type: 'setting_ordersImport/getFailItem',
            payload: {
                id: currentItem.id,
                order_no: value,
            },
            callback: () => {
                this.props.dispatch({
                    type: 'setting_ordersImport/setProperty',
                    payload: { loading: false }
                }) 
            } 
        }) 
    }
    failGoToPage = (current, size) => {
        this.props.dispatch({
            type: 'setting_ordersImport/setProperty',
            payload: { loading: true }
        })
        const { currentItem } = this.props.setting_ordersImport
        this.props.dispatch({
            type: 'setting_ordersImport/getFailItem',
            payload: {
                id: currentItem.id,
                currentFail: current,
            },
            callback: () => {
                this.props.dispatch({
                    type: 'setting_ordersImport/setProperty',
                    payload: { loading: false }
                }) 
            }
        })
    }
    render(){
        const { totalFail, failItem, currentFail, loading } = this.props.setting_ordersImport
        const failColumns = [
            {
                title: '订单号',
                dataIndex: 'order_no',
            },
            {
                title: '失败原因',
                dataIndex: 'failed_reason',
            },
        ]
        return (
            <Modal 
                closable= {false}
                visible={this.props.visiable}
                cancelText="关闭"
                onOk={this.saveFailCount}
                onCancel={this.cancelFailCount}
                width={600}
            >
                <Form>
                    <Row className={styles.modelBottom}>
                        <span className={styles.marginRight10}>订单搜索</span>
                        <Search placeholder="订单号" onSearch={value => this.failSearch(value)} style={{ width: 200 }} />
                    </Row>
                    <Row className={styles.modelBottom}>
                        <Table columns={failColumns} dataSource={failItem} pagination={false} rowKey='id' loading={loading}  />
                        <Pagination 
                            className="ant-table-pagination"
                            current={currentFail}
                            total={totalFail}
                            showTotal={(total) => `共 ${total} 条`}
                            hideOnSinglePage={true}
                            pageSize={10}
                            onChange={this.failGoToPage} 
                            size='small' 
                        />
                    </Row>
                </Form> 
            </Modal>
        )
    }
}
