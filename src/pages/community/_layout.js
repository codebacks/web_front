/**
 **@Description:
 **@author: leo
 */

import React from 'react'
import {ConfigProvider} from 'antd'
import DocumentTitle from 'react-document-title'
import SubContent from 'components/SubContent'
import {connect} from 'dva'
import styles from './style/index.less'

@connect(({base}) => ({
    base,
}))
export default class PageLayout extends React.Component {
    getPageTitle() {
        return '社区'
    }

    getContentRef = (node) => {
        this.content = node
    }

    render() {
        const {children} = this.props

        return (
            <DocumentTitle title={this.getPageTitle()}>
                <SubContent
                    {...this.props}
                >
                    <ConfigProvider
                        getPopupContainer={() => {
                            return this.content
                        }}
                    >
                        <div
                            ref={this.getContentRef}
                            className={styles.content}
                        >
                            {children}
                        </div>
                    </ConfigProvider>
                </SubContent>
            </DocumentTitle>
        )
    }
}
