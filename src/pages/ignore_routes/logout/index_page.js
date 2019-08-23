import React from 'react'
import {connect} from 'dva'

@connect(({login}) => ({
    login,
}))
export default class LogoutPage extends React.Component {
    constructor(props) {
        super(props)
        this.props.dispatch({
            type: 'login/logout',
            payload: {},
        })
    }
    render(){
        return null
    }
}