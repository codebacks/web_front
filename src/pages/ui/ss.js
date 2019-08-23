import React from 'react'
import DocumentTitle from 'react-document-title'
import { Layout } from 'antd'
import {connect} from 'dva'

const {Content} = Layout
const contentSubMargin = 14

@connect(({base, setting_base}) => ({
    base,
    setting_base,
}))
export default class PageLayout extends React.PureComponent {
    getPageTitle() {
        return '首页'
    }

    render() {
        const {children, base} = this.props
        const contentHeight = base.winHeight - base.headerHeight

        return (
            <DocumentTitle title={this.getPageTitle()}>
                <Layout>
                    <Layout>
                        <Content
                           
                            style={{
                                height: contentHeight,
                                marginTop: base.headerHeight,
                            }}
                        >
                            <div
                                
                                style={{
                                    minHeight: contentHeight - (contentSubMargin * 2),
                                    margin: `${contentSubMargin}px`,
                                }}
                            >
                                {children}
                            </div>
                        </Content>
                    </Layout>
                </Layout>
            </DocumentTitle>
        )
    }
}