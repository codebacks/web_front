/**
 **@Description:
 **@author: leo
 */

import React from 'react'
import DocumentTitle from 'react-document-title'
import SubContent from 'components/SubContent'
import { Layout } from 'antd'
import { connect } from 'dva'
import styles from './style/index.scss'

const { Content } = Layout

@connect(({ base }) => ({
    base,
}))
export default class PageLayout extends React.PureComponent {
    getPageTitle() {
        return '客户管理'
    }

    render() {
        const { children } = this.props
        const { pathname } = this.props.location
        const isUseCustomiseLayout = ![
            '/crm/vip_rank',
            '/crm/vip_list',
            '/crm/customerpool',
            '/crm/customerpool/message',
            '/crm/customerpool/importRecord',
            '/crm/sms_management',
            '/crm/sms_record',
            '/crm/sms_account',
            '/crm/sms_management/create_management',
            '/crm/sign_management',
            '/crm/sms_batch_send',
            '/crm/sms_batch_send/sms_account',
            '/crm/integral_overview',
            '/crm/integral_detail',
            '/crm/integral_detail/customer_detail',
            '/crm/integral_order',
            '/crm/integral_award',
            '/crm/integral_mall',
            '/crm/integral_mall/mall_detail',
            '/crm/integral_award/award_detail',
            '/crm/integral_setting',
            '/crm/hand_send',
            '/crm/sms_batch_send/send_message_setting',
            '/crm/automatic_send',
            '/crm/automatic_send/create_automatic',
            '/crm/automatic_send/autoDetail',
            '/crm/hand_send/message_recharge_record'
        ].some(url => url === pathname)
        return (
            <DocumentTitle title={this.getPageTitle()}>
                <SubContent {...this.props}>
                    <Content className={styles.content}>
                        {
                            isUseCustomiseLayout ?
                                <div className={styles.contentSub}>
                                    {children}
                                </div>
                                :
                                children
                        }
                    </Content>
                </SubContent>
            </DocumentTitle>
        )
    }
}
