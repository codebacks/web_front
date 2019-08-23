'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 16/12/29
 */


import React from 'react'
import {Modal, Button} from 'antd'

import Info from './Info'

export default class extends React.Component {
    constructor(props) {
        super()
        this.state = {}
    }


    componentDidMount() {
        this.props.dispatch({
            type: 'crm_orders/detail',
            payload: {id: this.props.crm_orders.record.id}
        })
    }

    handleCancel = () => {
        this.props.dispatch({
            type: 'crm_orders/setProperty',
            payload: {detailModal: false}
        })
    };

    render() {
        const {detailModal, detail} = this.props.crm_orders
        return (
            <Modal title="订单详情" visible={detailModal}
                onCancel={this.handleCancel}
                maskClosable={false}
                width={1200}
                footer={[
                    <Button key="cancel" type="ghost" onClick={this.handleCancel.bind(this)}>取消</Button>
                ]}>
                <Info {...this.props} record={detail}/>
            </Modal>
        )
    }
}
