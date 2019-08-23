/**
 **@Description:
 **@author: leo
 */

import React, { Component } from "react"
import { Modal,Checkbox,message } from "antd"
import { connect } from "dva"
// import {router} from 'umi/router'
import router from 'umi/router'

// import styles from "./index.less"

@connect(({base, platform_voicepacket }) => ({
    base,platform_voicepacket
}))
export default class Index extends Component {
    state = {
        checked:true,
        isDisabled:false
    }
    onCancel = () => {
        this.setState({
            isDisabled:false
        })
        this.props.onCancel && this.props.onCancel()
    }
    onChange = (e) =>{
        this.setState({
            checked:e.target.checked
        })
    }
    onOk = () =>{
        const {checked} = this.state
        if(checked){
            this.setState({
                isDisabled:true
            })
        }
        if(checked){
            this.props.dispatch({
                type:'platform_voicepacket/openAccount',
                payload:{},
                callback:()=>{
                    this.props.dispatch({
                        type: 'platform_voicepacket/voicePacketsAccount',
                        payload: {
                        },
                        callback:(data) =>{
                        }
                    })
                    this.props.dispatch({
                        type:'platform_voicepacket/setProperty',
                        payload:{
                            isOpenAccount:true
                        },
                    })
                    this.onCancel()
                }
            })
        }else{
            message.error('阅读并同意此协议！')
        }
    }
    render() {
        const { visible } = this.props
        const { isDisabled } = this.state
        return (
            <Modal
                visible={visible}
                title='开通语音红包功能'
                okText="开通"
                cancelText='返回'
                okButtonProps={{ disabled: isDisabled }}
                onCancel={this.onCancel}
                onOk={this.onOk}
            >
                <p>是否开通语音红包功能，开通后无需绑定服务号也可在牛客服上给客户发红包！</p>
                {/* <p> <Checkbox checked={this.state.checked}  onChange={this.onChange}></Checkbox><a style={{textDecoration:'underline',marginLeft:8}}  href='/platform/voice_packets/agreement'  target='_blank'>我已阅读并同意此协议</a></p> */}
            </Modal>
        )
    }
}
