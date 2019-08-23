/**
 **@Description:
 **@author: 吴明
 */

import React, { Component } from 'react'
import documentTitleDecorator from 'hoc/documentTitle'
import styles from './index.less'

@documentTitleDecorator({
    title: '协议'
})
export default class Index extends Component {
    render() {
        return (
            <div className={styles.agreement}>
                <div className={styles.head}>虎赞“小程序”功能使用协议</div>
                <div className={styles.subHead}>致尊敬的虎赞用户：</div>
                <div className={styles.content}>感谢您选择使用我司（上海虎赞信息科技有限公司，以下简称“我司”或“虎赞”）虎赞“小程序”功能。您登录虎赞账户并点击同意《虎赞“小程序”功能使用协议》时，视为您账户对应法律主体明确同意本协议约定内容。</div>

                <div className={styles.title}>一、您应满足以下条件：</div>
                <div className={styles.content}>1、虎赞签约客户；</div>
                <div className={styles.content}>2、已完成微信小程序申请，拥有微信小程序权限；</div>
                <div className={styles.content}>3、无其他违法、违规、违约行为。</div>

                <div className={styles.title}>二、虎赞“小程序”功能系针对您在微信平台申请注册的小程序账号提供的一项技术服务，主要功能如下：</div>
                <div className={styles.content}>1、小程序店铺装修、后台数据管理；</div>
                <div className={styles.content}>2、小程序店铺与微信支付功能绑定；</div>
                <div className={styles.content}>3、小程序店铺数据分析及各类报表；</div>
                <div className={styles.content}>4、小程序店铺分销活动（限一级分销）。</div>

                <div className={styles.title}>三、为向您提供稳定的服务，您需提供如下支持：</div>
                <div className={styles.content}>1、必要的端口权限；</div>
                <div className={styles.content}>2、必要的信息、资质证书、资料、素材、数据等。</div>

                <div className={styles.title}>四、您在使用本服务时，应严格遵守以下约定：</div>
                <div className={styles.content}>1、小程序店铺经营内容应严格按照您的经营范围，需要获得前置审批的，您应先行获得前置审批；</div>
                <div className={styles.content}>2、您在运营小程序店铺时应严格遵守法律、法规，同时尊重第三方的合法权益及用户的个人隐私、个人信息或资料内容。</div>

                <div className={styles.title}>五、您在使用小程序店铺分销活动时应特别注意，针对该活动，虎赞仅提供一级分销技术支持。您与您导购员（即一级分销用户）之间发生的任何法律行为均由您与导购员独立承担法律责任。</div>

                <div className={styles.title}>六、若有明确证据或法律文书证明您违规使用虎赞“小程序”功能，我司将有权单方面终止您继续使用，直至您与第三人纠纷解除。</div>

                <div className={styles.title}>七、本协议自您点击同意之时生效，至您与虎赞签订的软件销售或平台服务类协议（以下统称“主协议”）服务期终止而终止。您使用本协议时，应同时严格遵守您与我司签订的主协议。</div>

                <div className={styles.title}>八、本协议未约定事项，以主协议内容为准。</div>
            </div>
        )
    }
}
