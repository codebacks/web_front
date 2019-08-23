/**
 **@time: 2018/9/20
 **@Description:活动审核
 **@author: wangchunting
 */

import React, { Component } from 'react'
import Page from '@/components/business/Page'
import DocumentTitle from 'react-document-title'
import Examine from './examine'

export default class Index extends Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }

    render() {
        return (
            <DocumentTitle title="活动审核">
                <Page>
                    <Page.ContentHeader 
                        title="活动审核"
                        helpUrl="http://newhelp.51zan.cn/manual/content/%E8%90%A5%E9%94%80%E6%B4%BB%E5%8A%A8/%E6%99%92%E5%9B%BE%E7%BA%A2%E5%8C%85.md"
                    />
                    <Examine history={this.props.history} location={this.props.location}></Examine>
                </Page>
            </DocumentTitle>
        )
    }
}

