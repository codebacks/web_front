/**
 **@Description:
 **@author: 吴明
 */

import React, { Component } from 'react'
import documentTitleDecorator from 'hoc/documentTitle'
import styles from './index.less'

@documentTitleDecorator({
    title: '商品条款与条件'
})
export default class Index extends Component {
    render() {
        return (
            <div className={styles.agreement}>
                <h1 style={{textAlign:'center',marginTop:30}}>商品条款与条件  <a href='https://public.51zan.com/commodity-title-20190417.pdf?attname=商品条款与条件.pdf'>下载协议</a></h1>
                <p style={{textAlign:'right'}}>本协议于【 2019年3月25日】公布</p>
                <ul>
                    <li><strong><strong>一、适用</strong></strong></li>
                </ul>
                <p>本《商品条款与条件》适用于您通过虎赞平台购买虎赞商品时使用，旨在规范您向上海虎赞信息科技有限公司及其指定关联方（下称 &ldquo;我们&rdquo;或&ldquo;虎赞&rdquo;）采购商品时您与虎赞之间的关系。</p>
                <p>您理解，本协议列明的条款并不能完整罗列并覆盖您与虎赞所有权利与义务，现有的约定也不能保证完全符合未来发展的需求。因此，适用之有效的法律法规，以及虎赞平台的《用户协议》、交易规则等经依法公示的，视为本协议不可分割的部分。</p>
                <p>&nbsp;</p>
                <ul>
                    <li><strong><strong>二、价格及展示信息</strong></strong></li>
                </ul>
                <p>除非另有说明，虎赞网站提供的商品价格以人民币为单位（含税）。<strong><u><strong>除非您可以直接成功提交订单并完成全部支付，否则相您获得的有关价格信息仅供参考，不应当视为任何法律意义上的要约或承诺。</strong></u></strong></p>
                <p>我们的商品商品的名称、价格、数量、规格、使用限制、售后服务等信息不定期会发生调整，具体的商品信息以届时公布的为准。</p>
                <p>我们会采取一切合理的方法确保虎赞平台展示信息的准确性。然而，由于技术局限及可靠性等原因，虎赞平台展示的信息可能出现偏差（例如商品的细节）、遗漏（例如完整服务参数）或者更新不及时（例如专属活动）的情况。因此，我们无法保证该等信息的准确性、完整性或适时性，该等信息仅供参考，不视为任何具有法律意义的承诺或保证。</p>
                <p>&nbsp;</p>
                <ul>
                    <li><strong><strong>三、订单</strong></strong></li>
                </ul>
                <p>您可以通过虎赞平台采购我们的商品。具体商品以您订单生效时虎赞平台有效的状态呈现和提供。</p>
                <p><strong><u><strong>若您是消费者，您在</strong></u></strong><strong><u><strong>虎赞平台</strong></u></strong><strong><u><strong>选择产品或服务、成功提交订单并全额付款的，该订单成立并生效；若您是其他类型的用户（例如企业、组织或非消费自用的个人等），当我们通过短信、邮件或其他方式通知您订购的产品或服务成功订购时，该订单成立并生效。</strong></u></strong></p>
                <p>订单生效前，您有权修改输入错误。<strong><u><strong>在您提交订单时，请您务必仔细确认所购商品的名称、价格、数量、规格、使用限制、售后服务、联系地址、电话、收货人等信息。</strong></u></strong></p>
                <p>订单生效前，我们可以拒绝接受或取消您已提交的订单。</p>
                <p>&nbsp;</p>
                <ul>
                    <li><strong><strong>四、使用限制</strong></strong></li>
                </ul>
                <p><strong><u><strong>您理解，您采购的商品仅能使用于您的工作所需，不得用于日常生活或者以任何形式向第三方销售或授权使用。若采购商品最终分配至员工使用，您应当在分配给员工之前告知员工商品的功能、用途、使用方式，并监督您的员工按照规定仅基于工作目的使用相关商品。</strong></u></strong></p>
                <p><strong><strong>&nbsp;</strong></strong></p>
                <ul>
                    <li><strong><strong>五、支付和结算</strong></strong></li>
                </ul>
                <p>您应当根据付款页面的提示完成商品价款的支付。除货到付款的商品外，商品价款应在您下单时付清。在任何欠款未付清之前，我们有权暂停交付商品和/或提供服务，同时虎赞平台保留要求您立即偿付已交付的商品和/或服务价款的权利。</p>
                <p>&nbsp;</p>
                <ul>
                    <li><strong><strong>六、配送</strong></strong></li>
                </ul>
                <p>您在虎赞网站订购的商品由虎赞或委托配送公司配送。配送的区域限于中国大陆地区（仅本协议之目的，不包括香港、澳门和台湾地区以及其他境外地区）。</p>
                <p>所有在虎赞平台上列出的配送时间皆为<strong><u><strong>参考时间，仅供您参照使用</strong></u></strong><strong><strong>。</strong></strong></p>
                <p>因如下情况造成订单延迟或无法配送、交货等，我们不承担延迟配送、交货的责任：</p>
                <p>（1） 您要求延迟配送的；</p>
                <p>（2） 您提供的信息错误、地址不详细的；</p>
                <p>（3） 商品送达后无人签收的；</p>
                <p>（4） 发现拟配送商品不适宜配送等原因的；</p>
                <p>（5） 因节假日、大型促销活动、店庆、预购或抢购人数众多等原因导致的；</p>
                <p>（6） 不可抗力因素导致的，例如：自然灾害、交通戒严、突发战争等。</p>
                <p><strong><u><strong>商品的所有权及商品毁损、灭失的风险在商品配送至</strong></u></strong><strong><u><strong>您</strong></u></strong><strong><u><strong>指定地点的时由</strong></u></strong><strong><u><strong>虎赞</strong></u></strong><strong><u><strong>转移至</strong></u></strong><strong><u><strong>您自行享有并承担</strong></u></strong><strong><u><strong>。</strong></u></strong></p>
                <p>如您填写的收货人信息有误，导致虎赞交付给非您本意的收货人的，由此造成的损失需由您自行承担。</p>
                <p>&nbsp;</p>
                <ul>
                    <li><strong><strong>七、商品验收及退换货政策</strong></strong></li>
                </ul>
                <p>商品配送至您指定地点后，您应当立即安排人员验收。若对商品质量或者数量有任何异议的，请当场告知我们，由双方共同核验。若您未按时提出异议，后又以商品不符合质量或数量要求提出异议的，虎赞平台无法受理您的异议申请。</p>
                <p>商品品类及质量等验收标准，根据虎赞平台页面展示和描述的信息为准。</p>
                <p>若满足法定的退换货情形，除非由于乙方原因导致的，您应通过各商品品牌公示的退还渠道处理。我们可以为您提供向品牌方退换货过程中的必要协助。</p>
                <p>&nbsp;</p>
                <ul>
                    <li><strong><strong>八、售后服务</strong></strong></li>
                </ul>
                <p>您应通过各商品品牌公示的售后服务规则及渠道享受售后服务。我们可以为您提供与品牌方售后服务过程中的必要协助。</p>
                <p>&nbsp;</p>
                <ul>
                    <li><strong><strong>九、联系我们</strong></strong></li>
                </ul>
                <p>如果您有任何有关我们服务或本协议的问题或建议，或您希望提出有关我们服务的任何投诉，请写信至：【yangguang@51zan.com】。</p>
                <p>&nbsp;</p>
            </div>
        )
    }
}
