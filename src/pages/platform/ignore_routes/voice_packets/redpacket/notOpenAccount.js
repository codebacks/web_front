/**
 **@Description:
 **@author: 吴明
 */

import React, {Component,Fragment} from 'react'
import { Form, Row, Col, Button} from 'antd'
import {connect} from 'dva'
import OpenAccount from '../compoments/openAccount'
import Page from '@/components/business/Page'
import PromotionActivity from '../compoments/promotionActivity'
import styles from './index.less'

@connect(({base,platform_voicepacket}) => ({
    base,
    platform_voicepacket
}))
@Form.create()

export default class Index extends Component {
    constructor ( props) {
        super(props)
        this.state = {
            visible:false,
            activityVisible:false
        }
    }
    handleOpenAccount = () =>{
        this.setState({
            visible:true    
        })
    }
    componentDidMount () {
        let activity_code = sessionStorage.getItem('HUZAN_ACTIVITY_CODE')
        if(!activity_code){
            this.setState({
                activityVisible:true
            })
            sessionStorage.setItem('HUZAN_ACTIVITY_CODE',true)
        }
    }
    onCancel = () =>{
        this.setState({
            visible:false,
        })
    }
    handleCancelActivity = () =>{
        this.setState({
            activityVisible:false
        })
    }
    handleActivityRecharge =() =>{
        this.setState({
            activityVisible:false,
            visible:true
        })
    }
    render() {
        const action= <Button type="primary"  onClick={this.handleOpenAccount} className={styles.open}>立即开通</Button>
        const {activityVisible} = this.state
        return (
            <Page className={styles.formSearch}>
                <Page.ContentHeader
                    title="红包列表"
                    action={action}
                    helpUrl='http://newhelp.51zan.cn/manual/content/%E8%90%A5%E9%94%80%E5%B9%B3%E5%8F%B0/%E8%AF%AD%E9%9F%B3%E7%BA%A2%E5%8C%85.md'
                />
                <Page.ContentAdvSearch>
                    <Form layout="horizontal" className="hz-from-search">
                        <Row>
                            <Col style={{marginBottom:8}}>
                               功能说明：
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                            语音红包为第三方提供的红包发送功能， 在第三方平台微信充值账户之后，就可以在牛客服上发送语音红包了，新零售平台会记录相关数据，方便查询和对账。
                            </Col>
                        </Row>
                    </Form>
                </Page.ContentAdvSearch>
                <Page.ContentBlock title={(<Fragment><span>应用说明</span></Fragment>)} hasDivider={false} style={{marginTop:-16}}>
                    <div className={styles.introduct}>
                        <div className={styles.intrTitle}>这是一款红包返现工具</div>
                        <div className={styles.intrDec}>1. 在牛客服上直接对客户发送返现红包</div>
                        <div className={styles.intrDec}>2. 无需开通微信商户号，在第三方平台微信充值账户后即可使用</div>
                        <div className={styles.intrDec}>3. 多场景适用，自定义金额操作自由高效</div>
                        <div className={styles.intrPic}>
                            <img src={require('platform/assets/images/redpack1@2x.png')}  alt=''/>
                            <img src={require('platform/assets/images/redpack2@2x.png')}  alt=''/>
                            <img src={require('platform/assets/images/redpack3@2x.png')}  alt=''/>
                            <img src={require('platform/assets/images/redpack4@2x.png')}  alt=''/>
                        </div>
                    </div>
                </Page.ContentBlock>
                <OpenAccount visible={this.state.visible} onCancel={this.onCancel}></OpenAccount>
                <PromotionActivity  activityVisible = {activityVisible} cancelActivity={this.handleCancelActivity} cancelRecharge={this.handleActivityRecharge}/>
            </Page>
        )
    }
}
