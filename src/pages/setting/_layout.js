/**
 **@Description:
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
        return 'setting'
    }

    render() {
        const {children} = this.props

        return (
            <DocumentTitle title={this.getPageTitle()}>
                <SubContent
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
