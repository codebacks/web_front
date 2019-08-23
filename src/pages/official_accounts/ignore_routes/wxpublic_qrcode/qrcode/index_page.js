'use strict'

import React from 'react'
import Qrcode from './Qrcode'
import QrcodeDetail from './QrcodeDetail'
export default class extends React.Component {
    state = {
        isEdit: true
    }
    componentDidMount(){
        const query = this.props.location.query
        if(query.id && !this.state.isEdit){
            this.setState({
                isEdit: true
            })
        }else if(query.showid && this.state.isEdit){
            this.setState({
                isEdit: false
            })
        }
    }
    render() {
        return this.state.isEdit ? <Qrcode {...this.props}/> : <QrcodeDetail {...this.props}/>
    }
}
