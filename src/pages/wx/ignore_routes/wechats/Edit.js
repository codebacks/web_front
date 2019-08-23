'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 16/12/29
 */


import React from 'react'
import {Input, Modal, Row, Col, notification} from 'antd'
import styles from './Edit.scss'

class ModifyForm extends React.Component {
    constructor(props) {
        super()
        this.state = {
            sms_alias: '',
            record: null,
            editLoading: false
        }
    }

    handleChange = (e) => { 
        this.setState({sms_alias: e.target.value.trim()})
    };
    handleSave = () => {
        const reg = /^1[34578]\d{9}$/  ///^1[0-9]{10}$/
        if (this.state.sms_alias && reg.test(this.state.sms_alias)) {
            setTimeout(() => {
                this.setState({editLoading: true})
                this.props.dispatch({
                    type: 'wechats/update',
                    payload: {username: this.props.record.username, body: {sms_alias: this.state.sms_alias}},
                    callback: () => {
                        this.setState({editLoading: false})
                        this.props.onCancel()
                    }
                })
            }, 0)
        } else {
            notification.error({
                message: '错误提示',
                description: '请输入正确的手机号码',
            })
        }
    };

    componentDidMount() {
        let sms_alias = this.props.record.sms_alias
        this.setState({sms_alias: sms_alias})
    }

    render() {
        const {record} = this.props
        const {editLoading} = this.state
        return (
            <Modal title="设置微信手机号" visible={this.props.visible} loading={editLoading} onOk={this.handleSave} onCancel={this.props.onCancel}
            >
                <div className={styles.edit}>
                    <Row>
                        <Col span={6} className="textRight"><label>微信昵称：</label></Col>
                        <Col span={18}>{record.nickname}</Col>
                    </Row>
                    <Row>
                        <Col span={6} className="textRight"><label>微信号：</label></Col>
                        <Col span={18}>{record.alias}</Col>
                    </Row>
                    <Row>
                        <Col span={6} className="textRight"><label>手机号：</label></Col>
                        <Col span={18}>
                            <Input placeholder="请输入微信手机号,建议使用微信关联的电话号码" value={this.state.sms_alias} onChange={this.handleChange}/>
                            <p className="strong">只能设置一次，设置后不可修改</p>
                        </Col>
                    </Row>
                </div>
            </Modal>
        )
    }
}

ModifyForm.propTypes = {}


export default ModifyForm
