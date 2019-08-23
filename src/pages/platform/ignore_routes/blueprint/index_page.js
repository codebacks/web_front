/**
 **@time: 2018/9/20
 **@Description:晒图红包-首页
 **@author: wangchunting
 */

import React, { Component } from 'react'
import Page from '@/components/business/Page'
import DocumentTitle from 'react-document-title'
import BlueprintPage from './blueprint'
import { Popover, Icon } from 'antd'

export default class Index extends Component {
    render() {

        return (
            <DocumentTitle title="晒图红包">
                <Page>
                    <Page.ContentHeader
                        title="晒图红包"
                        titleHelp={<Popover placement="bottomLeft" content={<div>输入订单号并晒图，即可领取红包<br></br>活动期间切勿更换支付商户号以免支付失败</div>}>
                            <Icon className="hz-text-primary hz-icon-size-default hz-icon-popover" type="question-circle-o" />
                        </Popover>}
                        helpUrl="http://newhelp.51zan.cn/manual/content/%E8%90%A5%E9%94%80%E6%B4%BB%E5%8A%A8/%E6%99%92%E5%9B%BE%E7%BA%A2%E5%8C%85.md"
                    />
                    <BlueprintPage history={this.props.history}  location={this.props.location}></BlueprintPage>
                </Page>
            </DocumentTitle>
        )
    }
}

