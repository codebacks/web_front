/**
 * 扩展 ant design Icon 组件, 支持自定义的字体
 */
import React from 'react'
import {Icon} from 'antd'
import classNames from 'classnames'

export default props => {
    let { type, spin, className = '', ...other } = props
    if (type.indexOf('ex-') === 0) {
        className = classNames('anticon', className, `icon-${type.slice(3)}`, {
            'animate-spin': spin
        })
        return <i className={className} {...other} />
    } else {
        return <Icon {...props}/>
    }
}