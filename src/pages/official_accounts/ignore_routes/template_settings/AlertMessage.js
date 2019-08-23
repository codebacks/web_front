import React from 'react'
import { Modal,Icon ,Button} from 'antd'
import styles from './index.less'

export default class extends React.Component {
    handleOk =(e) => {
        
        this.handleCancel()
    }
    handleCancel =()=> {
        this.props.onCancel && this.props.onCancel()
    }
   
    render() {
        const { visible , content } = this.props
        return <Modal
            visible={visible}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
            width={480}
            footer={
                <Button type="primary" onClick={e => this.handleOk(e)}>确定</Button>
            }
        >
            <p className={styles.modal_title}> <Icon className={styles.modal_icon} type="exclamation-circle" theme="filled" /> <b>{content.code === '206' ? '提示' :'开启失败'}</b></p>
            <p className={styles.modal_text}> {content.message} {content.code === '206' ? <a href='http://newhelp.51zan.cn/manual/content/%E5%85%AC%E4%BC%97%E5%8F%B7/%E6%A8%A1%E6%9D%BF%E6%B6%88%E6%81%AF/%E5%A6%82%E4%BD%95%E5%BC%80%E9%80%9A%E6%A8%A1%E6%9D%BF%E6%B6%88%E6%81%AF.md' target='_blank' rel="noopener noreferrer"> 使用教程</a>:null}</p>
        </Modal>
    }
}
