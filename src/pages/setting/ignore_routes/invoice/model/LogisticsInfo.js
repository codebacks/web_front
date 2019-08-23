/*
 * @Author: sunlzhi 
 * @Date: 2018-11-08 19:33:53 
 * @Last Modified by: sunlzhi
 * @Last Modified time: 2018-11-16 19:28:20
 */

import React, {Component} from 'react'
import {Modal, Timeline } from 'antd'
import styles from '../index.less'

const TimelineItem = Timeline.Item

export default class Index extends Component {
    constructor(props) {
        super(props)
        this.state = {
            type: 2,
        }
    }

    // 页面加载调用
    componentDidMount() {
        const { id } = this.props
        if(!id){
            return
        }
        this.getExpress(this.props.id)
    }

    // 获取当前发票的物流信息
    getExpress = (id) => {
        this.props.dispatch({
            type: 'invoice/getExpress',
            payload: {
                id: id
            },
            callback: (res) => {
            }
        })
    }

    // 关闭弹窗
    handleCancel = () => {
        this.props.handleCancel()
    }

    render() {
        const {expressData, } = this.props.invoice

        // 开具此发票的订单列表
        const columns = [
            {
                title: '付款时间',
                dataIndex: 'paid_at',
                key: 'paid_at',
            }, {
                title: '付款内容',
                dataIndex: 'ext_info',
                key: 'ext_info',
            }, {
                title: '付款金额',
                dataIndex: 'applied_at',
                key: 'applied_at',
                render: (text, record) => {
                    return (
                        <div>{text} 元</div>
                    )
                },
            },
        ]

        // const step = expressData.Traces && expressData.Traces.map((traces, index) => <TimelineItem key={index} style={{fontSize: 12}} color={index===expressData.Traces.length-1?'green':'blue'}>{traces.AcceptTime+traces.AcceptStation}</TimelineItem>)

        return <Modal
            title="物流信息"
            width={450}
            centered
            className={styles.logisticsInfo}
            footer={null}
            visible={this.props.visible}
            destroyOnClose={true}
            onCancel={this.handleCancel}>
            <div>
                <ul className={styles.logisticsInfoList}>
                    <li>
                        <span className={styles.invoicDetailsName}>物流公司</span>
                        <span className={styles.invoicDetailsValue}>{expressData.ShipperName}</span>
                    </li>
                    <li>
                        <span className={styles.invoicDetailsName}>物流跟踪</span>
                        <span className={styles.invoicDetailsValue}>{expressData.LogisticCode}</span>
                        {expressData.ShipperName === '顺丰速运' ?
                            <a href={"http://www.sf-express.com/cn/sc/dynamic_function/waybill/#search/bill-number/" + expressData.LogisticCode} target="_blank" rel="nofollow noopener noreferrer">查询物流信息</a>
                            :
                            <a href="https://www.ickd.cn" target="_blank" rel="nofollow noopener noreferrer" style={{marginLeft: 24}}>查询物流信息</a>
                        }
                    </li>
                </ul>
                {/* <Timeline reverse>
                    {step}
                </Timeline> */}
            </div>
        </Modal>
    }
}
