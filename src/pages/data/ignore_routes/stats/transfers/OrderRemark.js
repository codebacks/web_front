'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 16/12/29
 */


import React from 'react'
import {Input, Modal, Row, Col, notification} from 'antd'
import styles from './OrderRemark.scss'

class ModifyForm extends React.Component {
    constructor(props) {
        super()
        this.state = {
            remark: '',
            record: null
        }
    }

    handleChange = (e) => {
        this.setState({remark: e.target.value.trim()})
    };

    handleSave = () => {
        // if (this.state.remark) {
        if (this.state.remark.length > 50) {
            notification.error({
                message: '错误提示',
                description: '备注最长为50个字符!',
            })
        } else {
            setTimeout(() => {
                const remark = this.state.remark
                let record = {...this.props.record}
                record.remark = remark
                window.localStorage.setItem('transfer_remark_last', remark)
                this.props.dispatch({
                    type: 'data_transfer/modify',
                    payload: {id: this.props.record.id, body: {remark: remark}, record: record},
                    callback: () => {
                        this.props.onCancel()
                    }
                })
            }, 0)
        }
        // }
    };

    componentDidMount() {
        let _remark = this.props.record.remark
        _remark = _remark ? _remark : window.localStorage.getItem('transfer_remark_last') || ''
        this.setState({remark: _remark})
    }

    render() {
        const record = this.props.record
        return (
            <Modal title="设置备注/用途" visible={this.props.visible} style={{width: '80%'}} className={styles.editMessageOrder} onOk={this.handleSave} onCancel={this.props.onCancel}
            >
                <div className={styles.orderRemark}>
                    <Row>
                        <Col span="6"><label>微信备注</label></Col>
                        <Col span="18">{record.friend.target.remark_name}</Col>
                    </Row>
                    <Row>
                        <Col span="6"><label>金额</label></Col>
                        <Col span="18">{record.amount}元</Col>
                    </Row>
                    <Row>
                        <Col span="6"><label>备注/用途</label></Col>
                        <Col span="18">
                            <Input placeholder="请输入备注/用途" value={this.state.remark} onChange={this.handleChange}/>
                            <div className={styles.tip}>备注最大长度为50个汉字<span>{this.state.remark.length}字</span></div>
                        </Col>
                    </Row>
                </div>
            </Modal>
        )
    }
}

export default ModifyForm
