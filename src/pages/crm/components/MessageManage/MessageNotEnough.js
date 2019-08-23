'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户:[吴明]
 */
import React,{Fragment} from 'react'
import {Modal,Icon} from 'antd'
import { connect } from 'dva'
import router from 'umi/router'
import MessageRecharge from '@/pages/crm/components/MessageManage/MessageRecharge'
import styles from './index.less'


@connect(({ base, sms_managamnet,sms_account}) => ({
    base, sms_managamnet,sms_account
}))
export default class extends React.Component {
    constructor(props) {
        super()
        this.state = {
            visible:false
        }
    }
    componentDidMount(){
    }

    handleMessageRecharge =()=>{
        this.setState({
            visible:true,
        })
        this.props.onCancel()
    }
    cancelMessageRecharge =()=>{
        this.props.onCancel()
    }
    onCancel=()=>{
        this.setState({
            visible:false
        })
    }

    render() {
        let user_num = this.props.user_num || 1
        const { smsCount } = this.props.sms_account
        return (
            <Fragment>
                <Modal
                    title={null}
                    visible={this.props.visible}
                    centered={true}
                    okText='去充值'
                    closable={false}
                    onOk={this.handleMessageRecharge}
                    onCancel={this.cancelMessageRecharge}
                >
                    <div style={{paddingLeft:32,position:'relative'}}>
                        <Icon type="exclamation-circle" theme="filled" style={{color:'#F15043',fontSize:'24px',position:'absolute',top:0,left:0}}  />
                        <p style={{color:'#0D1A26',fontSize:'16px',fontWeight:'bold'}}>提示</p> 
                        <div style={{color:'#556675',fontSize:'14px'}}>本次选中<span style={{color:' #4391FF'}}>{user_num}</span>个用户，预计扣费<span style={{color:' #4391FF'}}>{this.props.send_count*user_num}</span>条短信，当前余额不足！</div>   
                    </div>
                </Modal>
                <MessageRecharge visible = {this.state.visible}  smsCount={smsCount}  onCancel={this.onCancel} />
            </Fragment>
        )
    }
}
