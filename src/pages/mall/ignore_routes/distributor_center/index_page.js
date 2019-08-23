/**
 **@Description:分销- 分销员中心
 **@author: wangchunting
 */

import React, { Component } from 'react'
import { connect } from 'dva'
import DocumentTitle from 'react-document-title'
import router from 'umi/router'
import Page from '@/components/business/Page'
import { Form, Button } from 'antd'
import WeBox from '../../../home/components/WeBox'
import styles from './index.less'
import { jine } from '../../../../utils/display'

@Form.create({})
@connect(({ base, distributor_center }) => ({
    base, distributor_center
}))

export default class Index extends Component {
    componentDidMount() {
        this.getCenterList()
    }

    getCenterList = () => {
        this.props.dispatch({
            type: 'distributor_center/centerList',
            payload: {},
        })
    }

    // Btn-未开通(创建活动)
    // isOpen() {
    //     this.props.dispatch({
    //         type: 'distributor_center/isOpen',
    //         payload: {
    //             has_wx_pay: 2
    //         }
    //     })
    // }

    // 设置分销员页面
    setDistributorHandler = () => {
        router.push('distributor_center/set')
    }

    render() {
        const { centerList } = this.props.distributor_center
        const action = (
            <div>
                {
                    // !isOpen.length ? <Button type="primary" onClick={this.isOpenShopConfirm}><Link to='/setting/authorization/subscription?type=openDistributorAuthorization'>设置分销员</Link></Button> : <Button type="primary" onClick={this.setDistributorHandler}>设置分销员</Button>
                    <Button type="primary" onClick={this.setDistributorHandler}>设置分销员</Button>
                }
            </div>
        )
        return (
            <DocumentTitle title="分销员中心">
                <Page>
                    <Page.ContentHeader title="分销员中心" action={action} />
                    <Page.ContentAdvSearch >
                        <div className={styles.distributorSearch}>
                            <p>分销员功能说明</p>
                            <p>分销功能帮助商家拓宽销售渠道，提高销售量同时增加自己店铺的粉丝流量。分销功能依托于小程序（虎赞小店），采取全店分销模式（参与特价或拼团的商品除外），当前仅支持一级分销，即分销员只抽取自己下级绑定客户的购买提成佣金，分销员与自己的绑定客户的绑定关系是永久的，当自己的绑定客户也成为分销员时，则他们之间不再存在抽佣关系。</p>
                        </div>
                    </Page.ContentAdvSearch>
                    <WeBox {...this.props} title="分销员概览">
                        <ul className={styles.overviewWrap}>
                            <li className={styles.overview}>
                                <div className={styles.overviewTitle}>
                                    <span className={styles.overviewIcon}>
                                        <img src={require(`mall/assets/images/distributor.svg`)} alt="" />
                                    </span>
                                    <span>我的分销员</span>
                                </div>
                                <div className={styles.overviewContent}>
                                    <div>
                                        <p>分销员总数</p>
                                        <p>{centerList.distributor_count}</p>
                                    </div>
                                    <div>
                                        <p>昨日新增</p>
                                        <p>{centerList.yesterday_distributor_count}</p>
                                    </div>
                                </div>
                            </li>
                            <li className={styles.overview}>
                                <div className={styles.overviewTitle}>
                                    <span className={styles.overviewIcon}>
                                        <img src={require(`mall/assets/images/distribution_order.svg`)} alt="" />
                                    </span>
                                    <span>分销订单</span>
                                </div>
                                <div className={styles.overviewContent}>
                                    <div>
                                        <p>分销订单总数</p>
                                        <p>{centerList.order_count}</p>
                                    </div>
                                    <div>
                                        <p>昨日新增</p>
                                        <p>{centerList.yesterday_order_count}</p>
                                    </div>
                                </div>
                            </li>
                            <li className={styles.overview}>
                                <div className={styles.overviewTitle}>
                                    <span className={styles.overviewIcon}>
                                        <img src={require(`mall/assets/images/distribution_promotion.svg`)} alt="" />
                                    </span>
                                    <span>分销推广</span>
                                </div>
                                <div className={styles.overviewContent}>
                                    <div>
                                        <p>分销推广总数</p>
                                        <p>{centerList.promote_count}</p>
                                    </div>
                                    <div>
                                        <p>昨日新增</p>
                                        <p>{centerList.yesterday_promote_count}</p>
                                    </div>
                                </div>
                            </li>
                        </ul>
                        <ul className={styles.overviewWrap}>
                            <li className={styles.overview}>
                                <div className={styles.overviewTitle}>
                                    <span className={styles.overviewIcon}>
                                        <img src={require(`mall/assets/images/distributor_commission.svg`)} alt="" />
                                    </span>
                                    <span>分销员佣金</span>
                                </div>
                                <div className={styles.overviewContent}>
                                    <div>
                                        <p>分销员累计佣金(元)</p>
                                        <p>{jine(centerList.commission_amount, '0,0.00', 'Fen')}</p>
                                    </div>
                                    <div>
                                        <p>昨日新增(元)</p>
                                        <p>{jine(centerList.yesterday_commission_amount, '0,0.00', 'Fen')}</p>
                                    </div>
                                </div>
                            </li>
                            <li className={styles.overview}>
                                <div className={styles.overviewTitle}>
                                    <span className={styles.overviewIcon}>
                                        <img src={require(`mall/assets/images/pending_commission.svg`)} alt="" />
                                    </span>
                                    <span>待审核佣金</span>
                                </div>
                                <div className={styles.overviewContent}>
                                    <div>
                                        <p>提现中佣金(元)</p>
                                        <p>{jine(centerList.un_audit_amount, '0,0.00', 'Fen')}</p>
                                    </div>
                                    <div>
                                        <p>待审核佣金(笔)</p>
                                        <p>{centerList.un_audit_count}</p>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </WeBox>
                </Page>
            </DocumentTitle>
        )
    }
}
