'use strict'

/**
 * 文件说明: 客户详情
 * ----------------------------------------
 * 创建用户: liyan [randonely@gmail.com]
 * 创建日期: 18/08/20
 */
import React from 'react'
import {connect} from 'dva'
import {Tabs} from 'antd'
import ContentHeader from 'components/business/ContentHeader'
import documentTitleDecorator from 'hoc/documentTitle'
import styles from './index.scss'
import Base from 'crm/components/Customers/Customers/Base'
import Orders from 'crm/components/Customers/Customers/Orders'
import Message from 'crm/components/Customers/Customers/Message'

const TabPane = Tabs.TabPane

@connect(({ base, crm_wechats, crm_customers, crm_perHistory, crm_plans, crm_messages }) => ({
    base, crm_wechats, crm_customers, crm_perHistory, crm_plans, crm_messages,
}))
@documentTitleDecorator()
export default class extends React.Component {
    constructor(props) {
        super()
        this.state = {}
    }

    componentDidMount() {
    }

    render() {
        const {id} = this.props.match.params
        const wxId = this.props.location.query ? this.props.location.query.wxId : null

        return (
            <div className={styles.customerDetail}>
                <ContentHeader
                    contentType={'breadcrumb'}
                    content={
                        [
                            {
                                name: '客户管理',
                                path: '/crm/customers'
                            },
                            {
                                name: '客户详情',
                            },
                        ]
                    }
                />
                {
                    id && !Number.isNaN(parseInt(id, 10)) ? <Tabs defaultActiveKey="1">
                        <TabPane tab="基础信息" key="1">
                            <Base {...this.props} customerId={id}/>
                        </TabPane>
                        <TabPane tab="订单记录" key="2">
                            <Orders {...this.props} customerId={id}/>
                        </TabPane>
                        <TabPane tab="聊天记录" key="3">
                            {wxId ? <Message {...this.props} wxId={wxId}/> : ''}
                        </TabPane>
                    </Tabs> : ''
                }
            </div>)
    }
}
