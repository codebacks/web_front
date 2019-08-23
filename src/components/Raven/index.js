/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/11/12
 */
import React, {Component} from 'react'
import {captureException} from 'utils/raven'

class Raven extends Component {
    componentDidCatch(error, errorInfo) {
        captureException(error, {extra: errorInfo})
        console.error(error)
    }

    render() {
        return this.props.children
    }
}

export function rootContainer(container) {
    return React.createElement(Raven, null, container)
}
