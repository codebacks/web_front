
import {Component} from 'react'
import { Modal, Table } from 'antd'
import styles from './index.less'
import { getAwardValByName, getPacketStatusTypeByVal, getGoodStatusTypeByVal } from 'crm/services/integral'

export default class Index extends Component {
    onOk = ()=>{
        this.onCancel()
    }
    onCancel = ()=>{
        this.props.onChange('OrderVisible')
    }
    getStatus = (item)=>{
        let type = parseInt(item.good_type, 10)
        if(type === getAwardValByName('HongBao')){
            return getPacketStatusTypeByVal(item.status)
        }else if(type === getAwardValByName('ShiWu')){
            return getGoodStatusTypeByVal(item.status)
        }
    }
    render(){
        const {item} = this.props
        const comColum = [
            {
                title: '订单信息',
                dataIndex: 'no',
                className: 'hz-table-column-width-200',
                render:(text,item,index) =>{
                    return (
                        <div>
                            <p key = {1}>订单编号：{item.no || ''}</p>
                            <p key = {2}>订单状态：{this.getStatus(item)}</p>
                            <p key = {3}>兑换时间：{item.created_at || ''}</p>
                            {
                                item.consigned_at&&(<p key = {4}>发货时间：{item.consigned_at || ''}</p>)
                            }
                            {
                                item.confirmed_at&&(<p key = {5}>收货时间：{item.confirmed_at || ''}</p>)
                            }
                        </div>
                    )
                }
            },
            {
                title: '收货信息',
                dataIndex: 'receiver_mobile',
                className: 'hz-table-column-width-200',
                render:(text,item,index) =>{
                    return (
                        <div className={styles.tdSet}>
                            <p key = {6}>收货人姓名：{item.receiver_name || ''}</p>
                            <p key = {7}>收货人手机：{item.receiver_mobile || ''}</p>
                            <p key = {8}>收货人地址：
                                {(item.province && item.province)}
                                {(item.city && item.city)}
                                {(item.address_detail && item.address_detail)}
                            </p>
                        </div>
                    )
                }
            }  
        ]
        const columns = parseInt(item.good_type, 10) === getAwardValByName('ShiWu') ? (
            item.carrier && item.carrier_tracking_no ?
            [
                ...comColum,  
                {
                    title: '物流信息',
                    dataIndex: 'carrier_tracking_no',
                    className: 'hz-table-column-width-200',
                    render:(text,item,index) =>{
                        return (
                            <div className={styles.tdSet}>
                                <p key = {9}>物流公司：{item.carrier || ''}</p>
                                <p key = {10}>物流单号：{item.carrier_tracking_no || ''}</p>
                            </div>
                        )
                    }
                }
            ]:
            comColum
        ) : [
            {
                title: '订单信息',
                dataIndex: 'no',
                className: 'hz-table-column-width-200',
                render:(text,item,index) =>{
                    return (
                        <div>
                            <p key = {1}>订单编号：{item.no || ''}</p>
                            <p key = {2}>订单状态：{this.getStatus(item)}</p>
                            <p key = {3}>兑换时间：{item.created_at || ''}</p>
                            <p key = {4}>发送时间：{item.red_packet_created_at || ''}</p>
                            {
                                item.red_packet_receive_at&&(<p key = {5}>领取时间：{item.red_packet_receive_at || ''}</p>)
                            }
                            
                        </div>
                    )
                }
            },
            {
                title: '领取信息',
                dataIndex: 'wx_id',
                className: 'hz-table-column-width-200',
                render:(text,item,index) =>{
                    return (
                        <div className={styles.tdSet}>
                            <p key = {6}>接收/领取微信：{item.receiver_wx_name || ''}</p>
                        </div>
                    )
                }
            }
        ]
        const dataList = [item]
        return (
            <Modal
                title="详情"
                visible={this.props.visible}
                onOk={this.onOk}
                onCancel={this.onCancel}
                width={900}
                footer={null}
            >
                <Table 
                    rowKey='id'
                    columns={columns}
                    pagination={false}
                    dataSource={dataList}
                    className={styles.userTable}
                ></Table>
            </Modal>
        )
    }
}