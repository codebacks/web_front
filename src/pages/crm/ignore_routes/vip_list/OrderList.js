
import React, { Component, Fragment } from 'react'
import { connect } from 'dva'
import { Modal, Table, Pagination } from 'antd'
import styles from './index.less'
import moment from 'moment'
import {jine} from '../../../../utils/display'
import {getPlatformTypeByVal} from '../../../../common/shopConf'

@connect(({ base, vip_data }) => ({
    base,
    vip_data,
}))
export default class Index extends Component {
    state = {
        loading: false,
    }
    componentDidMount(){
        const {id} = this.props
        if(id){
            this.getVipDetail(id)
            const {orderPageSize} = this.props.vip_data
            const postData = {
                page: 1,
                per_page: orderPageSize,
                id: id,
            }
            this.getOrderList(postData)
        }
    }
    getVipDetail = (id)=>{
        this.props.dispatch({
            type: 'vip_data/getVipDetail',
            payload:{
                id: id
            },
            callback: ()=>{}
        })
    }
    getOrderList=(postData)=>{
        this.setState({loading: true})
        console.log(postData)
        this.props.dispatch({
            type: 'vip_data/getOrderList',
            payload:{
                id: postData.id,
                offset: (postData.page - 1) * postData.per_page,
                limit: postData.per_page,
            },
            callback: ()=>{
                this.setState({loading: false})
            }
        })
    }
    onCancel = ()=>{
        this.props.onParentClose()
    }
    handleListPageChangeSize = (page, pageSize)=>{
        const {id} = this.props
        const postData = {
            page: 1,
            per_page: pageSize,
            id: id,
        }
        this.getOrderList(postData)
    }
    handleListPageChange = (page)=>{
        const {id} = this.props
        const {orderPageSize} = this.props.vip_data
        const postData = {
            page: page,
            per_page: orderPageSize,
            id: id, 
        }
        this.getOrderList(postData)
    }
    getTotalNum = (arr)=>{
        let total = 0
        Array.isArray(arr)&&arr.forEach(el => {
            total += el.num
        })
        return total
    }
    render () {
        const columns = [
            {
                title: '购买时间',
                dataIndex: 'created_at',
                className: 'hz-table-column-width-180',
                render: (value,item,index) => {
                    let str = moment.unix(value)
                    return <span>{value&&moment(str).format('YYYY-MM-DD HH:mm:ss')}</span>
                }
            },
            {
                title: '平台',
                dataIndex: 'platform_type',
                className: 'hz-table-column-width-100',
                render: (value,item,index) => {
                    return <span>{value&&getPlatformTypeByVal(value)}</span>
                }
            },
            {
                title: '店铺',
                dataIndex: 'shop_name',
                className: 'hz-table-column-width-150'
            },
            {
                title: '订单号',
                dataIndex: 'no',
                className: 'hz-table-column-width-180',
                render: (value,item,index) => {
                    return <span style={{wordBreak: 'break-all'}}>{value}</span>
                }
            },
            {
                title: '数量',
                dataIndex: 'items',
                className: 'hz-table-column-width-100',
                render: (value,item,index) => {
                    return <span>{value&&this.getTotalNum(value)}</span>
                }
            },
            {
                title: '订单金额',
                dataIndex: 'paid_amount',
                className: 'hz-table-column-width-100',
                render: (value,item,index) => {
                    return <span>{jine(value, '', 'Fen')}</span>
                }
            } 
        ]
        const { vipDetail, orderList, orderCurrent, orderPageSize, orderTotal } = this.props.vip_data
        return (
            <Fragment>
                <Modal
                    title="累计成交笔数"
                    visible={this.props.visible}
                    onCancel={this.onCancel}
                    footer={null}
                    width={900}
                    className={styles.modalContent}
                >
                    <div style={{marginBottom: 16}}>
                        <span>微信号：{vipDetail.wx_id || ''}</span>
                        <span style={{marginLeft: 16}}>微信昵称：{vipDetail.nick_name || ''}</span>
                    </div>
                    <Table
                        columns={columns}
                        dataSource={orderList}
                        pagination={false}
                        rowKey='id'
                        loading={this.state.loading}
                    />
                    {
                        orderList && orderList.length > 0&&(
                            <Pagination
                                className="ant-table-pagination"
                                current={orderCurrent}
                                total={orderTotal}
                                showTotal={(total) => `共 ${total} 条`} 
                                showQuickJumper={true} 
                                showSizeChanger={true}  
                                pageSize={orderPageSize} 
                                pageSizeOptions= {['10', '20', '50', '100']}
                                onShowSizeChange={this.handleListPageChangeSize}
                                onChange={this.handleListPageChange} 
                            ></Pagination>
                        )
                    }
                </Modal>
            </Fragment>
        )
    }
}
