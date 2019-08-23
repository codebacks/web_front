'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 16/12/29
 */


import React from 'react'
import {Input, Modal, Row, Col, notification} from 'antd'
import styles from './Remark.scss'

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
        if (this.state.remark) {
            setTimeout(() => {
                let record = {...this.props.crm_members.record}
                record.remark = this.state.remark
                window.localStorage.setItem('potential_remark_last', this.state.remark)
                this.props.dispatch({
                    type: 'crm_members/modify',
                    payload: {id: record.id, body: {remark: this.state.remark}, record: record},
                    callback: () => {
                        this.props.onCancel()
                    }
                })
            }, 0)
        } else {
            notification.error({
                message: '错误提示',
                description: '请输入备注',
            })
        }
    };

    componentDidMount() {
        let _remark = this.props.crm_members.record.remark
        _remark = _remark ? _remark : window.localStorage.getItem('potential_remark_last') || ''
        this.setState({remark: _remark})
    }

    render() {
        const {editLoading,record} = this.props.crm_members
        return (
            <Modal title="设置备注" visible={this.props.crm_members.remarkModal}
                style={{width: '80%'}}
                loading={editLoading}
                onOk={this.handleSave} onCancel={this.props.onCancel}
            >
                <div className={styles.remark}>
                    <Row>
                        <Col span="6"><label>姓名</label></Col>
                        <Col span="18">{record.real_name}</Col>
                    </Row>
                    <Row>
                        <Col span="6"><label>手机号</label></Col>
                        <Col span="18">{record.mobile}</Col>
                    </Row>
                    <Row>
                        <Col span="6"><label>会员名</label></Col>
                        <Col span="18">{record.name}</Col>
                    </Row>
                    <Row>
                        <Col span="6"><label>备注</label></Col>
                        <Col span="18">
                            <Input placeholder="请输入备注" value={this.state.remark} onChange={this.handleChange}/>
                        </Col>
                    </Row>
                </div>
            </Modal>
        )
    }
}

export default ModifyForm
