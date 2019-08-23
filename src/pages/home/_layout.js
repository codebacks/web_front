import React from 'react'
import DocumentTitle from 'react-document-title'
import SubContent from 'components/SubContent'
import {connect} from 'dva'

@connect(({base, setting_base}) => ({
    base,
    setting_base,
}))
export default class PageLayout extends React.PureComponent {
    getPageTitle() {
        return '首页'
    }

    render() {
        const { children } = this.props

        return (
            <DocumentTitle title={this.getPageTitle()}>
                <SubContent isAutoScroll={true} hasSider={false} {...this.props}>
                    {children}
                </SubContent>
            </DocumentTitle>
        )
    }
}
