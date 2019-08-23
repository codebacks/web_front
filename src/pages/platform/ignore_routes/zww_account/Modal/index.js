
import React from 'react'
import ToPay from './ToPay'
import ResultPay from './ResultPay'
export default class extends React.PureComponent {
    state = {
        step: 1
    }
    hidePayModal = (step) => {
        this.setState({ step })
    }
    render() {
        return this.state.step === 1 ? <ToPay {...this.props} hidePayModal={this.hidePayModal} /> : <ResultPay {...this.props}  hidePayModal={this.hidePayModal} />
    }
}