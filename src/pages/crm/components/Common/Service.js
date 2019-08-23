'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 16/12/8
 */
import React from 'react'
import {Icon, Popover} from 'antd'
import Helper from 'crm/utils/helper'
import Styles from './Service.scss'


class Service extends React.Component {
    constructor(props) {
        super()
        this.state = {
            collapse: false,
            focus: false,
            value: ''

        }
    }

    componentDidMount() {
    }

    render() {
        const {initData: config} = this.props.base
        const {scanTip, icon, name} = this.props
        const content = (<div className={Styles.qrcode}>
            {!this.props.hideHelp ?
                <p className={Styles.help}>使用问题，请先查看 <a href={Helper.getHelpUrl('home')} target="_blank" rel="noopener noreferrer">使用帮助</a></p>
                : ''}
            <img src={Helper.getIn(config, 'agent.wx_qrcode')} style={{width: 148, height: 148}} alt=""/>
            <p>{scanTip || '微信扫码联系客服'}</p>
        </div>)
        return (<Popover
            content={content}
            placement={this.props.placement || 'top'}
            title={null}><span className={Styles.name}>{icon ||
            <Icon type="customer-service"/>}{name || '扫码加微信，联系客服'}</span></Popover>
        )
    }
}

export default Service
