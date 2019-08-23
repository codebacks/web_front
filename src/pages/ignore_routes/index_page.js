import React from 'react'
import router from 'umi/router'

export default class Index extends React.PureComponent {
    constructor(props) {
        super(props)
        const {search} = this.props.location
        router.replace(`/home${search}`)
    }
    render(){
        return null
    }
}
