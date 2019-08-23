'use strict'

import React from 'react'
import { connect } from 'dva'
import { Button, Card,Icon,Row,Col } from 'antd'
import DocumentTitle from 'react-document-title'
import Link from 'umi/link'
import Page from '../../../../../components/business/Page'
import styles from './index.less'
import _ from "lodash"


@connect(({ base, attention_prize, oem }) => ({
    base,
    attention_prize,
    oem,
}))
export default class extends React.Component {
    render() {
        const query = this.props.location.query
        const { accessToken} = this.props.base
        const {
            oemConfig = {},
        } = this.props.oem
        return (
            <DocumentTitle title={query.id ? '编辑活动成功' : '创建活动成功'}>
                <Page>
                    <Page.ContentHeader
                        hasGutter={false}
                        breadcrumbData={[{
                            name: '关注有礼',
                            path: '/official_accounts/attention_prize'
                        }, {
                            name: query.id ? '编辑活动成功' : '创建活动成功'
                        }]}
                    />
                    <div className={styles.content}>
                        <Icon type="check-circle" className={styles.content_icon}/>
                        <h2 className={styles.content_center} >{query.id ? '编辑成功' : '创建成功'}</h2>
                        <p className={styles.content_center} >活动创建成功后，可到 牛客服-关注有礼 发送二维码；</p>
                        <Card style={{ width: 600 }}>
                            <h3>Q：为什么要在牛客服给微信好友发送活动二维码？</h3>
                            <p>A：在牛客服发送关注有礼活动二维码，微信好友关注公众号后，将公众号粉丝与微信好友关联，并且该微信好友名下绑定的订单数据将与公众号数据互通。</p>
                            <br/>
                            <h3>Q：个人号与公众号数据关联后有什么好处？</h3>
                            <p>A：商家可开启 <Link to='/official_accounts/template_settings'>模板消息</Link> 功能，之后微信好友的订单物流相关信息，公众号可自动且指定粉丝进行消息推送。</p>
                        </Card>
                        <br/>
                        <Row style={{marginTop:'10px'}}>
                            <Col span={10}></Col>
                            <Col span={6} className={styles.content_link}>
                                <a href={`${_.get(oemConfig, 'niukefu.url', '')}?access_token=${accessToken}`} target={'_blank'}>
                                    <Button type="primary">去发送</Button>
                                </a>
                                <Link  to='/official_accounts/attention_prize'>返回</Link>
                            </Col>
                        </Row>
                    </div>

                </Page>

            </DocumentTitle>
        )
    }
}
