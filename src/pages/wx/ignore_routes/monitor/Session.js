'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 16/12/27
 */
import React from 'react'
import {
    Input,
    Icon,
    Checkbox,
    Row,
    Col,
    Pagination,
    Tooltip,
    Tabs
} from 'antd'
import {connect} from 'dva'
import Helper from 'wx/utils/helper'
import config from 'wx/common/config'
import DepartmentSelect from 'components/business/DepartmentSelect'
import UserSelect from 'components/business/UserSelect'
import WeChatSelectSingle from 'components/business/WeChatSelectSingle'
import styles from './Session.scss'

import SessionList from './SessionList'
import GroupSessionList from './GroupSessionList'

const Search = Input.Search

const {
    pageSizeOptions,
} = config

@connect(({ base, sessions}) => ({
    base, sessions
}))
export default class extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {
        this.loadSessions({page: 1}, ({data})=>{
            if(data.length){
                // 默认选中第一个
                this.handleItemClick(data[0])
            }
        })
    }

    componentWillUnmount() {
        this.resetParams()
        this.props.dispatch({
            type: 'wx_sessions/setProperty',
            payload: {
                isFriendTab: true
            }
        })
    }

    resetParams = () => {
        this.props.dispatch({
            type: 'wx_sessions/resetParams'
        })
    }

    loadSessions = (payload, callback) => {
        setTimeout(() => {
            this.props.dispatch({
                type: 'wx_sessions/query',
                payload: {
                    page: payload.page || 1,
                    params: payload.params
                },
                callback: (option) => {
                    if(callback && typeof callback === 'function'){
                        callback(option)
                    }
                }
            })
        }, 0)
    }

    // 该方法传给child，设置选中的session-item
    handleItemClick = (item) => {
        this.props.dispatch({
            type: 'wx_sessions/setProperty',
            payload: {activeSession: item}
        })
    }

    handleChange = (key, e) => {
        let val = ''
        if (key === 'query') {
            val = e.target.value
        } else {
            val = e
        }
        let params = {...this.props.wx_sessions.params}
        params[key] = val
        if (key === 'department_id') {
            params['user_id'] = undefined
            params['uin'] = undefined
        } else if (key === 'user_id') {
            params['uin'] = undefined
        }
        this.props.dispatch({
            type: 'wx_sessions/setParams',
            payload: params,
        })
        if (['department_id', 'user_id', 'uin'].includes(key)) {
            this.loadSessions({page: 1})
        }
    }

    handleChangeFilter = (e) => {
        const checked = e.target.checked
        let params = Object.assign({}, this.props.wx_sessions.params)
        if (checked) {
            params.is_no_reply = 1
        } else {
            params.is_no_reply = ''
        }
        this.props.dispatch({
            type: 'wx_sessions/setProperty',
            payload: {params: params, sessions: []},
        })
        this.loadSessions({page: 1})
    };

    handleTabs = (key) => {
        let params = {...this.props.wx_sessions.params}
        const isFriendTab = key === '1'
        this.props.dispatch({
            type: 'wx_sessions/setProperty',
            payload: {
                isFriendTab: isFriendTab
            }
        })
        const payload = {
            page: 1,
            params: params
        }
        this.loadSessions(payload, ({data, isFriend})=>{
            const {isFriendTab} = this.props.wx_sessions
            if(isFriendTab !== isFriend) {
                return
            }
            if (data.length) {
                // 默认选中第一个
                this.handleItemClick(data[0])
            } else {
                this.props.dispatch({
                    type: 'wx_sessions/setParams',
                    payload: {activeSession: {}}
                })
            }
        })
    }

    render() {
        const innerHeight = this.props.base.winHeight
        let {
            params, sessionLoading,
            sessionList, sessionCurrent, sessionTotal,
            groupSessionList, groupSessionCurrent, groupSessionTotal,
            activeSession, isFriendTab
        } = this.props.wx_sessions

        let list = isFriendTab ? sessionList : groupSessionList
        let current = isFriendTab ? sessionCurrent : groupSessionCurrent
        let total = isFriendTab ? sessionTotal : groupSessionTotal

        let listHeight = ''
        if (this.refs.searchPanel && this.refs.searchPanel.getBoundingClientRect()) {
            listHeight = innerHeight - this.refs.searchPanel.getBoundingClientRect().bottom - 60 - 62
        }

        let filter_type = this.props.wx_sessions.filter_type
        if (filter_type) {
            if (filter_type === '0') {
                list = list.filter((item) => {
                    return !item.target.username.startsWith('@@')
                })
            }
            if (filter_type === '1') {
                list = list.filter((item) => {
                    return item.target.username.startsWith('@@')
                })
            }
            if (filter_type === '3') {
                list = list.filter((item) => {
                    return Helper.getIn(item, 'is_no_reply') > 0 || Helper.getIn(this.props.im.activeSession, 'target.username') === Helper.getIn(item.target, 'username')
                })
            }
        }

        return (<div className={styles.session}>
            <div className={styles.searchBar} ref="searchPanel">
                <div className={styles.checkboxWrap}>
                    <Row gutter={16} style={{marginBottom: 8}}>
                        <Col span={24}>
                            <Search
                                placeholder="请输入好友昵称、好友备注、群名称、群备注"
                                value={params.query}
                                onChange={(e)=>{this.handleChange('query', e)}}
                                onSearch={()=>{this.loadSessions({page: 1})}}
                            />
                        </Col>
                    </Row>
                    <Row gutter={16} style={{marginBottom: 8}}>
                        <Col span={12}>
                            <DepartmentSelect
                                departmentId={params.department_id}
                                onChange={(value)=>{this.handleChange('department_id', value)}}
                            />
                        </Col>
                        <Col span={12}>
                            <UserSelect
                                departmentId={params.department_id}
                                userId={params.user_id}
                                onChange={(value)=>{this.handleChange('user_id', value)}}
                            />
                        </Col>
                    </Row>
                    <Row gutter={16} style={{marginBottom: 8}}>
                        <Col span={12}>
                            <WeChatSelectSingle
                                departmentId={params.department_id}
                                userId={params.user_id}
                                uin={params.uin}
                                onChange={(value)=>{this.handleChange('uin', value)}}
                            />
                        </Col>
                        <Col span={12}>
                            <Checkbox
                                className={styles.checkbox}
                                onChange={this.handleChangeFilter}
                            >只看未回复消息</Checkbox>
                        </Col>
                    </Row>
                </div>
            </div>
            <Tabs defaultActiveKey="1" onChange={this.handleTabs} className={styles.tabs} animated={false}>
                <Tabs.TabPane tab="好友" key="1">
                    <SessionList
                        list={sessionList}
                        activeSession={activeSession}
                        listHeight={listHeight}
                        sessionLoading={sessionLoading}
                        handleItemClick={this.handleItemClick}
                    />
                </Tabs.TabPane>
                <Tabs.TabPane tab="群" key="2">
                    <GroupSessionList
                        list={groupSessionList}
                        activeSession={activeSession}
                        listHeight={listHeight}
                        sessionLoading={sessionLoading}
                        handleItemClick={this.handleItemClick}
                    />
                </Tabs.TabPane>
            </Tabs>
            {list.length ?
                <div className={styles.pageWrap}>
                    <Pagination defaultCurrent={1}
                        showQuickJumper
                        pageSizeOptions={pageSizeOptions}
                        size="small"
                        current={current}
                        pageSize={params.limit}
                        onChange={(page)=>{this.loadSessions({page: page})}}
                        total={total}/>
                </div> : ''}
        </div>)
    }
}
