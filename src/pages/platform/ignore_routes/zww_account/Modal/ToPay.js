import React from 'react'
import { connect } from 'dva'
import { Modal } from 'antd'
import numeral from 'numeral'

@connect(({ base }) => ({
    base
}))
export default class extends React.Component {
    handleOk =()=> {
        if(this.props.url){
            window.open(this.props.url,'_blank')
        }
        this.props.hidePayModal && this.props.hidePayModal(2)
    }
    handleCancel =()=> {
        this.props.onCancel && this.props.onCancel()
    }
    render() {
        const { visible, piece, money } = this.props
        return <Modal
            title="结算"
            cancelText='取消'
            okText="付款"
            width={480}
            visible={visible}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
        >
            <p>已选 <b> {piece} </b> 件商品，总计 <b style={{ color: '#4391FF' }}> ¥{numeral(money).format('0,0.00')}</b></p>
        </Modal>
    }
}
