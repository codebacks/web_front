/**
 **@Description:
 **@author: 吴明
 */

import React, {Component} from 'react'

import {connect} from 'dva'
import NotOpenAccount from './notOpenAccount'
import documentTitleDecorator from 'hoc/documentTitle'
import OpenAccount from './openAccount'
@connect(({base,platform_voicepacket}) => ({
    base,
    platform_voicepacket
}))

@documentTitleDecorator({
    title:'红包列表'
})
export default class Index extends Component {
    constructor ( props) {
        super(props)
        this.state = {
        }
    }

    // 判断是否开通语音红包功能
    checkPacket () {
        const { dispatch } = this.props
        dispatch({
            type: 'platform_voicepacket/voicePacketsAccount',
            payload: {
            },
            callback:(data) =>{
            }
        })
    }



    componentDidMount () {
        this.checkPacket()
    }

    render() {
        const { isOpenAccount } = this.props.platform_voicepacket
        return (
            <div>
                {
                    isOpenAccount === undefined ? '': ( isOpenAccount?<OpenAccount/>:<NotOpenAccount/>)
                }
            </div>
        )
    }
}
