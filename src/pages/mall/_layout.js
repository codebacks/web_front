/**
 **@Description: 2018/9/26 修改 zhousong@51zan.com
 **@author: leo
 */

import React from 'react'
import DocumentTitle from 'react-document-title'
import SubContent from 'components/SubContent'
import {connect} from 'dva'
import styles from './style/index.less'

@connect(({base}) => ({
    base,
}))
export default class PageLayout extends React.PureComponent {
    getPageTitle() {
        return '虎赞小店'
    }

    render() {
        // 不需要菜单的页面链接
        const pages = ['/mall/initialization']
        const isSide = !pages.some(c => this.props.location.pathname === c)
        const {children} = this.props

        return (
            <DocumentTitle title={this.getPageTitle()}>
                <SubContent
                    hasSider={isSide}
                    hiddenMenuForPath={pages}
                    {...this.props}
                >
                    <div
                        className={styles.content}
                    >
                        {children}
                    </div>
                </SubContent>
            </DocumentTitle>
        )
    }
}
