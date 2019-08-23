import React, { Component } from "react"
import { Modal, Button, Icon } from "antd"
import styles from "./index.scss"

export default class Recharge extends Component {
    onCancel = () => {
        this.props.onHide && this.props.onHide()
    }

    onOk = (e) => {
        e.preventDefault()
        this.props.showRechargeResult && this.props.showRechargeResult(false)
        this.props.onOk && this.props.onOk()
    }

    handle = (e) => {
        e.preventDefault()
    }

    render() {
        const { visible } = this.props
        return (
            <Modal
                className={styles.modal_body_ctrl}
                visible={visible}
                // style={{ top: 260 }}
                title="提示"
                okText="支付"
                cancelText="取消"
                destroyOnClose={true}
                onCancel={this.onCancel}
                onOk={this.onOk}
                width={724}
                footer={null}
            >
                <p> <Icon className='icon_ctrl' type="exclamation-circle" theme="filled" /> 在完成付款之前，请不要关闭这个窗口</p>
                <p> <span className='icon_ctrl' ></span> 支付完成后，根据您的情况，请点击下面的按钮</p>
                <div className="recharge_bottom">
                    <Button className="recharge_btn" onClick={this.handle} >支付遇到问题</Button>
                    <Button className="recharge_btn" type="primary" onClick={this.onOk} >支付完成</Button>
                </div>
                <br /><br />
            </Modal>
        )
    }
}
