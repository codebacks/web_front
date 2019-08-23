import React from 'react'
import { Modal,Icon, Button } from 'antd'
import styles from './index.scss'

export default class extends React.Component {
    handleOk =() => {
        this.props.getList && this.props.getList()
        this.onCancel()
        this.props.hidePayModal && this.props.hidePayModal(1)
    }
    onCancel = () => {
        this.props.onCancel && this.props.onCancel(true)
        this.props.hidePayModal && this.props.hidePayModal(1)
    }
    handleCancel =(e)=> {
        window.open('http://newhelp.51zan.cn/changjianwenti/content/%E8%99%8E%E8%B5%9E%E5%B0%8F%E5%BA%97/%E6%94%AF%E4%BB%98%E8%AF%B4%E6%98%8E.md','_blank')
        this.onCancel()
    }
   
    render() {
        const { visible } = this.props
        return <Modal
            visible={visible}
            onCancel={this.onCancel}
            footer={
                <div>
                    <Button onClick={e => this.handleCancel(e) } >支付遇到问题</Button>
                    <Button type='primary' onClick={e => this.handleOk(e) } >支付完成</Button>
                </div>
            }
            width={480}
        >
            <p className={styles.pay_modal}> <Icon className={styles.modal_icon} type="exclamation-circle" theme="filled" /> <b>在完成付款之前，请不要关闭这个窗口</b></p>
            <p className={styles.pay_modal_text}> 支付完成后，根据您的情况，请点击下面的按钮 </p>
        </Modal>
    }
}
