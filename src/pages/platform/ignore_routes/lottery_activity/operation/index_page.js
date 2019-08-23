import React from 'react'
import Award from './Award'
import Condition from './Condition'


export default class extends React.Component {
    state = {
        step: 1,
        from:null
    }

    setStep = (step,from) =>{
        this.setState({ step,from })
    }

    render(){
        return this.state.step === 1 ? <Condition {...this.props} setStep={this.setStep} from={this.state.from} /> : 
            this.state.step === 2 ? <Award {...this.props} setStep={this.setStep} from={this.state.from} /> : null
    }
}

