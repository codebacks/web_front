import React from "react"
import { Modal } from "antd"
import { connect } from "dva"
import router from 'umi/router'

@connect(({wxpublic_qrcode }) => ({wxpublic_qrcode}))
export default class extends React.Component {
    onClick = (e,row) =>{
        e.preventDefault()
        this.props.onOk && this.props.onOk(row)
        this.onCancel()
    }
    onCancel =()=>{
        this.props.onCancel && this.props.onCancel()
    }
    go = ()=>{
        router.push('/platform/blueprint')
    }
    render() {
        
        const { visible } = this.props
        return (
            <Modal
                visible={visible}
                title="活动统计"
                okText="提交"
                cancelText="返回"
                destroyOnClose
                onCancel={this.onCancel}
                width={600}
                footer={null}
            >
            </Modal>
        )
    }
}