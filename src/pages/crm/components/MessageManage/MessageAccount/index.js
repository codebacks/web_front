'use strict'

import React ,{Fragment}from 'react'
import { connect } from 'dva'
import { Button ,Divider,Tabs} from 'antd'
import Page from '@/components/business/Page'
import numeral from 'numeral'
import router from 'umi/router'
import Link from 'umi/link'
import MessageRecharge from '@/pages/crm/components/MessageManage/MessageRecharge'
import styles from './index.less'

@connect(({ base, sms_account,crm_customerPool }) => ({
    base,
    sms_account,
    crm_customerPool
}))

export default class extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            visible: false,
            smsCount: 0,     
            value:'1',
            step:0,     
        }
    }
    
    componentDidMount() {
        this.props.dispatch({
            type:'sms_account/getSMSCount'
        })
    }
    showModel = (e) => {
        e.preventDefault()
        const { smsCount } = this.props.sms_account
        this.setState({
            visible: true,
            smsCount: smsCount
        })
    }

    onCancel = () => {
        this.setState({
            visible: false,
            smsCount: 0
        })
    }
    render() {
        const { smsCount } = this.props.sms_account
        return (
            <Fragment>
                <Page.ContentAdvSearch  hasGutter={false}>
                    <span className={styles.smsCounts}>当前账户可用短信 <span className={styles.bold}>{numeral(smsCount).format('0,0')}</span> 条</span>
                    <a  style={{marginLeft:36}}  onClick={this.showModel} >立即充值</a>
                    <Divider type="vertical" />
                    <Link to="/crm/hand_send/message_recharge_record">充值记录</Link>
                </Page.ContentAdvSearch>
                <MessageRecharge visible = {this.state.visible}  smsCount={smsCount}  onCancel={this.onCancel} />
            </Fragment>
        )
    }
}
