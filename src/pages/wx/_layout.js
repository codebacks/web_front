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
import fontStyles from './style/font.less'

const {Content} = Layout

@connect(({base}) => ({
    base,
}))
export default class PageLayout extends React.PureComponent {
    getPageTitle() {
        return '个人号'
    }

    render() {
        const {children} = this.props

        return (
            <DocumentTitle title={this.getPageTitle()}>
                <SubContent {...this.props}>
                    <Content className={styles.content}>
                        <div className={`${styles.contentSub} ${fontStyles.font}`}>
                            {children}
                        </div>
                    </Content>
                </SubContent>
            </DocumentTitle>
        )
    }
}
