'use strict'
import React, { Fragment } from 'react'
import { connect } from 'dva'
import router from 'umi/router'
import { Form, Steps, Button } from 'antd'
import documentTitleDecorator from 'hoc/documentTitle'
import Page from '../../../../components/business/Page'
import styles from './index.less'
const Step = Steps.Step


@connect(({ base, gzh_fans }) => ({ base, gzh_fans }))
@documentTitleDecorator({ title: '公众号概述' })
@Form.create()
export default class extends React.Component {
    componentDidMount(){
        this.props.dispatch({
            type: 'gzh_fans/getOauthGzh',
            payload: {}
        })  
    }
    onCreate = ()=>{
        router.push('/official_accounts/attention_prize/activity')
    }
    onParamQrc = ()=>{
        router.push('/official_accounts/wxpublic_qrcode/qrcode')
    }
    onSetting = ()=>{
        router.push('/official_accounts/template_settings')
    }
    oauthGzh = ()=>{
        router.push('/setting/authorization/subscription')
    }
    render() {
        const { getOauthGzh } = this.props.gzh_fans
        return (
            <Page>
                <Page.ContentHeader
                    title="公众号概述"
                    action={
                        <Fragment>
                            {
                                Array.isArray(getOauthGzh)&&(
                                    getOauthGzh.length>0?(
                                        <span className={styles.blod_title}>{getOauthGzh[0].name}</span>
                                    ):(
                                        <Button type='primary' onClick={this.oauthGzh}>授权公众号</Button>
                                    )
                                )
                            } 
                            <span className='hz-page-content-action-description'>系统提供强大的公众号功能，将个人号好友与公众号粉丝数据打通</span>
                        </Fragment>
                    }
                    helpUrl="http://newhelp.51zan.cn/manual/content/%E5%85%AC%E4%BC%97%E5%8F%B7/%E5%85%AC%E4%BC%97%E5%8F%B7.md"
                />
                <div className={styles.head}>
                    <div className={styles.card}>
                        <div>
                            <div className={styles.cardIcon}>
                                <img src={require(`official_accounts/assets/images/icon_marketing.svg`)} alt=''/>
                            </div>
                            <div className={styles.cardCon}>
                                <div className={styles.title}>关注有礼</div>
                                <div className={styles.dec}>帮助商家快速引导好友关注 及打通个人号与公众号粉丝数据</div>
                                <div className={styles.btn} onClick={this.onCreate}>创建</div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.card}>
                        <div>
                            <div className={styles.cardIcon}>
                                <img src={require(`official_accounts/assets/images/icon_QRcode.svg`)} alt=''/>
                            </div>
                            <div className={styles.cardCon}>
                                <div className={styles.title}>带参二维码</div>
                                <div className={styles.dec}>商家用于印刷在粉丝卡、海报 活动宣传同时关注公众号</div>
                                <div className={styles.btn} onClick={this.onParamQrc}>创建</div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.card}>
                        <div>
                            <div className={styles.cardIcon}>
                                <img src={require(`official_accounts/assets/images/icon_model_message.svg`)} alt=''/>
                            </div>
                            <div className={styles.cardCon}>
                                <div className={styles.title}>模板消息</div>
                                <div className={styles.dec}>公众号智能推送客户订单信息、 物流发货、签收通知等消息</div>
                                <div className={styles.btn} onClick={this.onSetting}>设置</div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.card}>
                        <div>
                            <div className={styles.cardIcon}>
                                <img src={require(`official_accounts/assets/images/icon_templet_message.svg`)} alt=''/>
                            </div>
                            <div className={styles.cardCon}>
                                <div className={styles.title}>自动回复</div>
                                <div className={styles.dec}>粉丝向公众号发送微信消息时， 公众号智能回复</div>
                                <div className={styles.disableBtn + ' ' + styles.btn}>敬请期待</div>
                            </div>
                        </div>
                    </div>

                </div>
                <div className={styles.content}>
                    <div className={styles.list}>Q：个人号与公众号数据关联后有什么好处？</div>
                    <div className={styles.list}>A：商家可开启<span className={styles.clickText}>模板消息</span>功能，之后微信好友的订单物流相关信息，公众号可以自动指定粉丝进行消息推送。</div>
                    <div>
                        <Steps direction="vertical" size="small" current={1}>
                            <Step 
                                status='wait' 
                                title={(<div className={styles.stepTitle}>授权公众号</div>)}
                                description={
                                    (<div className={styles.stepDes}>
                                        <div>为保证所有功能正常，授权时请保持默认选择，</div>
                                        <div>把权限统一授权给虎赞</div>
                                    </div>)
                                }
                            />
                            <Step 
                                status='wait' 
                                title={(<div className={styles.stepTitle}>创建关注有礼活动</div>)}
                                description={
                                    (<div className={styles.stepDes}>
                                        <div>帮助商家快速引导好友关注，同时将个人号好友</div>
                                        <div>与公众号粉丝身份进行关联</div>
                                    </div>)
                                }
                            />
                            <Step 
                                status='wait' 
                                title={(<div className={styles.stepTitle}>牛客服发送二维码</div>)}
                                description={
                                    (<div className={styles.stepDes}>
                                        <div>好友扫码并关注公众号后，牛客服绑定的订单数据</div>
                                        <div>将与公众号数据互通。</div>
                                    </div>)
                                }
                            />
                        </Steps>
                    </div>
                </div>
            </Page>
        )
    }
}
