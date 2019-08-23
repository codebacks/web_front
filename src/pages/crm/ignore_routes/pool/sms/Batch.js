'use strict'

/**
 * 文件说明: 通过订单发送短信
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 17/08/01
 */
import React from 'react'
import Members from './Members'
import Send from './Send'


class Batch extends React.Component {
    constructor(props) {
        super()
        this.state = {}
    }

    componentDidMount() {
        this.props.dispatch({
            type: 'crm_sms/setProperty',
            payload: {confirmModal: true, sendModal: false}
        })

    };

    render() {
        const {confirmModal, sendModal} = this.props.crm_sms
        return (
            <div>
                {confirmModal ? <Members {...this.props} source={this.props.source}/> : ''}
                {sendModal ? <Send {...this.props} source={this.props.source}/> : ''}
            </div>
        )
    }
}

export default Batch
