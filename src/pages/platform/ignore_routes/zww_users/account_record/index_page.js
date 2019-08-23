/*
 * @Author: sunlizhi 
 * @Date: 2018-11-29 14:17:16 
 * @Last Modified by: sunlizhi
 * @Last Modified time: 2018-12-06 17:03:32
 */

// import React, { Component, PureComponent } from 'react'
import Page, { DEFAULT_PAGER , DEFAULT_PAGER_FILTER} from '../../../../../components/business/Page'
import {connect} from 'dva'
// import router from 'umi/router'
import DocumentTitle from 'react-document-title'
import { Table, Pagination, Badge, Tabs, Form } from 'antd'
import styles from './index.less'
import { number } from 'utils/display.js'

const DEFAULT_CONDITION = {
    uid: '',
    status: '0',
}

const TabPane = Tabs.TabPane

@Form.create()
@connect(({zww_users, base}) =>({
    zww_users, base
}))
export default class extends  Page.ListPureComponent {
    state = {
        loading: true,
        condition: {...DEFAULT_CONDITION},
        pager: {...DEFAULT_PAGER}
    }

    initPage = (isSetHistory = false) => {
        let uid = this.props.location.query.uid
        const condition = this.getParamForObject(DEFAULT_CONDITION, this.props.location.query)
        const pager = this.getParamForObject(DEFAULT_PAGER, this.props.location.query, DEFAULT_PAGER_FILTER)

        const { status } = condition
        condition.uid = uid
        this.getAccountRecord(uid)

        this.getPageData(condition, pager, isSetHistory)
        
        this.props.form.setFieldsValue({
            'status': status,
        })
    }

    getPageData = (condition, pager, isSetHistory = true,callback) => {
        if( isSetHistory ){
            this.history(condition, pager)
        }

        this.setState({
            condition: condition,
            pager: pager,
            loading: true
        })

        const IssueRecord = '0' // 发放记录
        const ConsumptionRecords = '1' // 消费记录
        let type = ''
        if (condition.status === IssueRecord) {
            type = 'zww_users/sentRecords'
        } else if (condition.status === ConsumptionRecords) {
            type = 'zww_users/consumeRecords'
        }
        
        this.props.dispatch({
            type: type,
            payload: {
                doll_id: condition.uid,
                offset: (pager.current - 1) * pager.pageSize,
                limit: pager.pageSize,
            },
            callback: (data) => {
                this.setState({
                    loading: false
                })

                callback && callback(data)
            }
        })
    }

    // 选择分类
    handleTabs = (value) =>{
        let uid = this.props.location.query.uid
        let {condition, pager} = this.state
        condition.status = value
        condition.uid = uid
        // pager.current = DEFAULT_PAGER.current
        pager.current = 1

        this.getPageData(condition, pager)
    }

    getAccountRecord = (id) => {
        this.props.dispatch({
            type: 'zww_users/accountRecord',
            payload: {
                id: id,
            },
            callback: (data) => {
                this.setState({
                    loading: false
                })
            }
        })
    }
    handleListPageChange = (current) =>{
        const condition = this.getParamForObject(DEFAULT_CONDITION, this.props.location.query)
        const pager = this.getParamForObject(DEFAULT_PAGER, this.props.location.query, DEFAULT_PAGER_FILTER)
        pager.current = current
        this.getPageData(condition, pager)
    }
    handleListPageChangeSize = (current,pageSize) =>{
        const condition = this.getParamForObject(DEFAULT_CONDITION, this.props.location.query)
        const pager ={
            current:1,
            pageSize
        }
        this.getPageData(condition, pager)
    }

    render () {
        const { accountRecord, sentRecordsList, sentRecordsCount, consumeRecordsList, consumeRecordsCount } = this.props.zww_users
        const { condition } = this.state
        const { current, pageSize } = this.state.pager

        const PageTitle = ({title}) => {
            return <div className={styles.pageTitle}>{title}</div>
        }

        const issueRecordColumns = [
            {
                title: '发送虎赞账号',
                dataIndex: 'user.nickname',
            },
            {
                title: '创建日期',
                dataIndex: 'created_at'
            },
            {
                title: '发送游戏币',
                dataIndex: 'coin',
            },
        ]

        const recordsCconsumptionColumns = [
            {
                title: '游戏时间',
                dataIndex: 'gamed_at',
            },
            {
                title: '消费游戏币',
                dataIndex: 'coin'
            },
            {
                title: '游戏结果',
                dataIndex: 'game_result',
                render: (text, record)=>{
                    return (
                        <div>
                            {text===1?
                                <Badge status="success" text="成功"/>
                                :
                                <Badge status="error" text="失败"/>}
                        </div>
                    )
                }
            },
        ]

        return (
            <DocumentTitle title='账户记录'>
                <Page>
                    <Page.ContentHeader
                        hasGutter={false}
                        breadcrumbData={[{
                            name: '用户管理',
                            path: '/platform/zww_users'
                        },{
                            name: '账户记录'
                        }]}
                    />

                    <PageTitle title='用户信息'/>
                    <div className={styles.userInfo}>
                        <div>
                            <span>微信昵称：</span>
                            <span>{accountRecord.wx_nickname}</span>
                        </div>
                        <div>
                            <span>手机号：</span>
                            <span>{accountRecord.mobile}</span>
                        </div>
                        <div>
                            <span>已消费游戏币：</span>
                            <span className={styles.num}>{number(accountRecord.consumed_coin_count)}</span>
                        </div>
                        <div>
                            <span>剩余游戏币：</span>
                            <span className={styles.num}>{number(accountRecord.left_coin_count)}</span>
                        </div>
                    </div>
                    
                    <Tabs activeKey={condition.status} onChange={this.handleTabs}>
                        <TabPane tab="发放记录" key="0"></TabPane>
                        <TabPane tab="消费记录" key="1"></TabPane>
                    </Tabs>

                    {condition.status === '0' ?
                        <div className={styles.clearBoth}>
                            <Table
                                columns={issueRecordColumns}
                                dataSource={sentRecordsList}
                                loading={this.state.loading}
                                pagination={false}
                                rowKey='id'
                            />
                            {parseFloat(sentRecordsCount) ?
                                <Pagination
                                    className="ant-table-pagination"
                                    current={current}
                                    total={parseFloat(sentRecordsCount)}
                                    showTotal={(total) => `共 ${total} 条`} 
                                    showQuickJumper={true} 
                                    showSizeChanger={true}  
                                    pageSize={pageSize} 
                                    pageSizeOptions= {['10', '20', '50', '100']}
                                    onShowSizeChange={this.handleListPageChangeSize}
                                    onChange={this.handleListPageChange} />
                                : ''
                            }
                        </div> : 
                        <div className={styles.clearBoth}>
                            <Table
                                columns={recordsCconsumptionColumns}
                                dataSource={consumeRecordsList}
                                loading={this.state.loading}
                                pagination={false}
                                rowKey='id'
                            />
                            {parseFloat(consumeRecordsCount) ?
                                <Pagination
                                    className="ant-table-pagination"
                                    current={current}
                                    total={parseFloat(consumeRecordsCount)}
                                    showTotal={(total) => `共 ${total} 条`} 
                                    showQuickJumper={true} 
                                    showSizeChanger={true}  
                                    pageSize={pageSize} 
                                    pageSizeOptions= {['10', '20', '50', '100']}
                                    onShowSizeChange={this.handleListPageChangeSize}
                                    onChange={this.handleListPageChange} />
                                : ''
                            }
                        </div>
                    }
                    
                </Page>
            </DocumentTitle>
        )
    }
}