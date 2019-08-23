/**
 * 文件说明: 弹窗DEMO
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期 18/08/01
 */

import React from 'react'
import {Modal, Button} from 'antd'

export default class LocalizedModal extends React.PureComponent {
    state = {visible: false}

    showModal = () => {
        this.setState({visible: true})
    }

    hideModal = () => {
        this.setState({visible: false})
    }

    render() {
        return (
            <div>
                <Button type="primary" onClick={this.showModal}>Modal</Button>
                <Modal
                    title="Modal"
                    visible={this.state.visible}
                    onOk={this.hideModal}
                    onCancel={this.hideModal}
                    okText="确认"
                    cancelText="取消"
                >
                    <p>Bla bla ...</p>
                    <p>Bla bla ...</p>
                    <p>Bla bla ...</p>
                </Modal>
            </div>
        )
    }
}


