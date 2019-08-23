/**
 **@Description:
 **@author: leo
 */

import React from 'react'
import DocumentTitle from 'react-document-title'
import SubContent from 'components/SubContent'
import {connect} from 'dva'
@connect(({base,platform_base}) => ({
    base,
    platform_base,
}))
export default class PageLayout extends React.PureComponent {
    getPageTitle() {
        return '营销平台'
    }

    render() {
        const {children} = this.props
        return (
            <DocumentTitle title={this.getPageTitle()}>
                <SubContent
                    {...this.props}
                >
                    {children}
                </SubContent>
            </DocumentTitle>
        )
    }
}
