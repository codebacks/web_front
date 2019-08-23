import React from 'react'
import {Spin} from 'antd'

export default class SyncModalContent extends React.PureComponent {

    state = {
        content: '',
        loading: true
    }

    componentDidMount(){
        this.props.onload((content) => {
            this.setState({
                loading: false,
                content: content
            })
        })   
    }

    render () {

        return (
            <span>
                {  this.state.loading ? <Spin /> : this.state.content}
            </span>
        )
    }
}