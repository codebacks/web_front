import React, { Component } from "react"
import PropTypes from "prop-types"
import Recharge from "./Recharge"
import RechargeResult from "./RechargeResult"

class SMSRecharge extends Component {
    state = {
        rechargeResultVisible: false
    }
    showRechargeResult = (bool) => {
        this.setState({
            rechargeResultVisible: bool
        })
    }

    onCancel = () => {
        let type = 2
        this.props.onCancel && this.props.onCancel(type)
        this.showRechargeResult(false)
    }

    render() {
        return this.state.rechargeResultVisible ?
            <RechargeResult
                {...this.props}
                showRechargeResult={this.showRechargeResult}
                onHide={this.onCancel}
            /> : <Recharge {...this.props} showRechargeResult={this.showRechargeResult} />

    }
}

// SMSRecharge.PropTypes = {
//     visible: PropTypes.bool,
//     // 剩余短信
//     residue: PropTypes.number
// }

export default SMSRecharge
