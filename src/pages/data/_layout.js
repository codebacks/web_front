/**
 **@Description:
 **@author: leo
 */

import React from 'react'
import DocumentTitle from 'react-document-title'
import SubContent from 'components/SubContent'
import {Layout} from 'antd'
import {connect} from 'dva'
import styles from './style/index.scss'

const {Content} = Layout

@connect(({base}) => ({
    base,
}))
export default class PageLayout extends React.PureComponent {
    getPageTitle() {
        return '数据中心'
    }

    render() {
        const {pathname} = this.props.location
        const isUseCustomiseLayout = ![
            '/data/stats/buleprint_reconciliation', 
            '/data/customer_group', 
            '/data/stats/packet_accounts',
            '/data/performance/sell',
            '/data/stats/customer',
            '/data/stats/messages',
            '/data/stats/moments',
            '/data/stats/transfers',
            '/data/performance_fj/service',
            '/data/weixin_analysis',
            '/data/performance_fj/friends'
        ].some(url => url === pathname)
        const {children} = this.props

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
