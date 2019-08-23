/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/10/15
 */

import React from 'react'
import PropTypes from 'prop-types'

export default class Toggle extends React.PureComponent {
    static propTypes = {
        initStatus: PropTypes.bool,
        children: PropTypes.func.isRequired,
    }

    static defaultProps = {
        initStatus: false,
    }

    constructor(props) {
        super(props)
        this.state = {
            status: props.initStatus,
        }
    }

    setTrue = () => {
        this.setState({
            status: true,
        })
    }

    setFalse = () => {
        this.setState({
            status: false,
        })
    }

    toggle = () => {
        this.setState({
            status: !this.state.status,
        })
    }

    setStatus = (status = true) => {
        this.setState({
            status: Boolean(status),
        })
    }

    getStatus = () => {
        return this.state.status
    }

    render() {
        const {children} = this.props
        const {status} = this.state

        return children({
            status,
            setTrue: this.setTrue,
            setFalse: this.setFalse,
            toggle: this.toggle,
            setStatus: this.setStatus,
            getStatus: this.getStatus,
        })
    }
}