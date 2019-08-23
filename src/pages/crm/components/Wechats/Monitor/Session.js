/* eslint-disable no-mixed-spaces-and-tabs */
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
    Button,
    Icon,
    Row,
    Col,
    Pagination,
    Select,
    Tooltip
} from 'antd'
import Helper from 'crm/utils/helper'
import config from 'crm/common/config'
import moment from 'moment'
import styles from './Session.scss'

const Search = Input.Search
const Option = Select.Option

const {
    pageSizeOptions,
    DateMonthFormat,
    DefaultAvatar,
    ReceiveMessageTypes,
    ReceiveMessageTypesDesc
} = config

let Timer = 0
export default class extends React.Component {
    constructor(props) {
        super()
        this.state = {}
    }

    componentDidMount() {
        this.loadUsers()
        this.loadWechats()
        this.loadSessions()

    }

    loadUsers() {
        this.props.dispatch({
            type: 'sessions/queryUsers',
            payload: {params: {limit: 1000}},
        })
    }

    loadWechats() {
        this.props.dispatch({
            type: 'sessions/queryWechats',
            payload: {},
        })
    }

    loadSessions(page) {
        setTimeout(() => {
            this.props.dispatch({
                type: 'sessions/query',
                payload: {page: page || 1}
            })
        }, 0)
    }

	handleAutoReload = (e) => {
	    if (e.target.checked) {
	        Timer = setInterval(() => {
	            this.loadSessions(1)
	        }, 5000)
	    } else {
	        clearInterval(Timer)
	    }
	};

	handleItemClick(item) {
	    this.props.dispatch({
	        type: 'sessions/setProperty',
	        payload: {activeSession: item}
	    })
	    setTimeout(() => {
	        this.props.onChange && this.props.onChange(item)
	    }, 0)
	}

	handleChange(key, e) {
	    let val = ''
	    if (key === 'query') {
	        val = e.target.value
	    } else {
	        val = e
	    }
	    let params = {...this.props.sessions.params}
	    params[key] = val
	    if (key === 'user_id') {
	        params['uin'] = ''
	    }
	    this.props.dispatch({
	        type: 'sessions/setParams',
	        payload: params,
	    })
	    if (['user_id', 'uin'].includes(key)) {
	        this.loadSessions(1)
	    }
	}

	handleChangeFilter = (val, e) => {
	    let params = Object.assign({}, this.props.sessions.params)
	    if (window.parseInt(val) === 4) {
	        params.is_send = 0
	    } else {
	        params.is_send = ''
	    }
	    this.props.dispatch({
	        type: 'sessions/setProperty',
	        payload: {params: params, sessions: [], filter_type: val},
	    })
	    if (['', '4'].includes(val)) {
	        this.loadSessions(1)
	    }
	};

	render() {
	    const innerHeight = this.props.base.winHeight
	    let {list, params, sessionLoading} = this.props.sessions
	    const {activeSession} = this.props.sessions
	    const users = this.props.sessions.users || []
	    const wechats = this.props.sessions.wechats || []
	    const getWechatOptions = () => {
	        let options = []
	        wechats.map((item) => {
	            if (item.uin) {
	                const val =`${item.nickname}[${item.alias}]`
	                if (params.user_id) {
	                    if (item.user_id === window.parseInt(params.user_id)) {
	                        options.push(<Option value={item.uin + ''}
							                     title={`${item.nickname}[${item.alias}]`}
							                     key={item.uin}>{ val }</Option>)
	                    }
	                } else {
	                    options.push(<Option value={item.uin}
						                     title={`${item.nickname}[${item.alias}]`}
						                     key={item.uin}>{ val }</Option>)
	                }
	            }
	        })
	        return options
	    }
	    const lastMessageContent = (item) => {
	        let type = Helper.getIn(item, 'latest_message.type')
	        if (type === ReceiveMessageTypes.card || type === ReceiveMessageTypes.picture) {
	            return ReceiveMessageTypesDesc[type]
	        }

	        if (Helper.getIn(item, 'latest_message.content')) {
	            if (type === ReceiveMessageTypes.text) {
	                return Helper.getIn(item, 'latest_message.content')
	            } else {
	                return Helper.getIn(item, 'latest_message.content') || ReceiveMessageTypesDesc[type] || '[附件]'
	            }
	        } else {
	            return Helper.getIn(item, 'lastMessageContent') || ReceiveMessageTypesDesc[type] || '[附件]'
	        }
	    }
	    const createMarkup = (t) => {
	        let cc = lastMessageContent(t)
	        cc = Helper.removeTag(cc)
	        let html = Helper.qqFaceToImg(cc)
	        if (html === 'null') {
	            html = cc.replace('[', '<').replace(']', '>')
	        }
	        html = Helper.emojiToImg(html)
	        return {__html: Helper.qqFaceToImg(html)}
	    }
	    const getCls = (item) => {
	        //用户名跟微信号一致
	        if (Helper.getIn(activeSession, 'target.id') === item.target.id) {
	            if (Helper.getIn(activeSession, 'target.username').startsWith('@@') && item.target.username.startsWith('@@')) {
	                return styles.chatItem + ' ' + styles.active
	            }
	            if (!Helper.getIn(activeSession, 'target.username').startsWith('@@') && !item.target.username.startsWith('@@')) {
	                return styles.chatItem + ' ' + styles.active
	            }
	            return styles.chatItem
	        } else {
	            return styles.chatItem
	        }


	    }
	    const getTime = (item) => {
	        if (Helper.getIn(item, 'conversation_time')) {
	            return moment(Helper.getIn(item, 'conversation_time')).format(DateMonthFormat)
	            // } else {
	            //     return moment(Helper.getIn(item, 'create_time') * 1000).format(DateMonthFormat)
	        }
	    }
	    let listHeight = ''
	    if (this.refs.searchPanel && this.refs.searchPanel.getBoundingClientRect()) {
	        listHeight = innerHeight - this.refs.searchPanel.getBoundingClientRect().bottom - 86
	    }
	    let filter_type = this.props.sessions.filter_type
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
	                return Helper.getIn(item, 'unread_count') > 0 || Helper.getIn(this.props.im.activeSession, 'target.username') === Helper.getIn(item.target, 'username')
	            })
	        }
	    }
	    return (<div className={styles.session}>
	        <div className={styles.searchBar} ref="searchPanel">
	            <div className={styles.checkboxWrap}>
	                <Row gutter={16} style={{marginBottom: 8}}>
	                    <Col span="24">
	                        <Search
	                            placeholder="输入好友昵称，备注及相应拼音"
	                            value={params.query}
	                            onChange={this.handleChange.bind(this, 'query')}
	                            onSearch={this.loadSessions.bind(this, 1)}
	                        />
	                    </Col>
	                </Row>
	                <Row gutter={16} style={{marginBottom: 8}}>
	                    <Col span="12">
	                        <Select showSearch
	                            optionFilterProp="children"
	                            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
	                            placeholder="全部【客服】" value={params.user_id + ''}
							        onChange={this.handleChange.bind(this, 'user_id')}
							        style={{width: '100%'}}>
	                            <Option value="">全部【客服】</Option>
	                            {users.map((item) => {
	                                return <Option value={item.id + ''} key={item.id}>
	                                    {item.username}{item.nickname ? <span>【{item.nickname}】</span> : ''}
	                                </Option>
	                            })}
	                        </Select>
	                    </Col>
	                    <Col span="12">
	                        <Select showSearch
	                            optionFilterProp="children"
	                            filterOption={(input, option) => option.props.children && option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0 }
								    style={{width: '100%'}}
							        placeholder="全部【微信号】"
							        value={params.uin}
							        onChange={this.handleChange.bind(this, 'uin')}>
	                            <Option value="">全部【微信号】</Option>
	                            {getWechatOptions()}
	                        </Select>
	                    </Col>
	                </Row>
	                <Row gutter={16} style={{marginBottom: 8}}>
	                    <Col span="12">
	                        <Select style={{width: '100%'}}
							        placeholder="全部[消息]"
							        value={this.props.sessions.filter_type}
							        onChange={this.handleChangeFilter.bind(this)}>
	                            <Option value="">全部消息</Option>
	                            {/*<Option value="1">只看群消息</Option>*/}
	                            {/*<Option value="0">只看好友消息</Option>*/}
	                            <Option value="4">只看未回复消息</Option>
	                        </Select>
	                    </Col>
	                    <Col span="12">
	                        <Button style={{width: '100%', padding: '4px 5px'}} icon="reload"
							        loading={sessionLoading}
							        onClick={this.loadSessions.bind(this, 1)}>刷新</Button>
	                    </Col>
	                </Row>
	            </div>
	        </div>
	        <div className={styles.list}
			     id="sessionList">
	            <div style={{height: listHeight, overflowY: 'auto'}}>
	                {sessionLoading ? <div className={styles.loadingWrap}><Icon type="loading"/></div> :
	                    <div>
	                        {list.length ?
	                            <ul>
	                                {list.map((item) => {
	                                    if (item.from && item.target && item.target.username) {
	                                        let status = Helper.getIn(item, 'status.progress.content') ?
	                                            <strong
	                                                className={styles.status}>{Helper.getIn(item, 'status.progress.content')}<i>-</i></strong> : ''
	                                        let isBlock = item.target.is_block ?
	                                            <span className={styles.isBlock}>[已被删除]</span> : ''
	                                        return (
	                                            <li className={getCls(item)}
												    key={Helper.getIn(item, 'target.username') + Helper.getIn(item, 'target.id')}
												    onClick={this.handleItemClick.bind(this, item)}>
	                                                <img className={styles.avatar}
													     src={item.target.head_img_url}
													     onError={(e) => {
														     e.target.src = DefaultAvatar
													     }}
													     alt=""/>
	                                                <h3 className={styles.nickname}>{status}{isBlock}{Helper.getIn(item, 'target.remark_name') ? Helper.getIn(item, 'target.remark_name') : Helper.getIn(item, 'target.nickname')}&nbsp;</h3>
	                                                <div className={styles.lastMessage}>
	                                                    <span dangerouslySetInnerHTML={createMarkup(item)}/>
	                                                    <Tooltip placement="topRight" title={Helper.getIn(item, 'from.nickname')}>
	                                                        <span className={styles.from}>{Helper.getIn(item, 'from.nickname')}</span>
	                                                    </Tooltip>
	                                                </div>
	                                                <div
	                                                    className={styles.time}>{getTime(item)}</div>
	                                            </li>
	                                        )
	                                    }
	                                })}
	                            </ul>
	                            :
	                            <div className={styles.tipWrap}>
	                                <p className={styles.tip}>没有聊天会话</p>
	                            </div>
	                        }
	                    </div>
	                }
	            </div>
	        </div>
	        {list.length ?
	            <div className={styles.pageWrap}>
	                <Pagination pageSizeOptions={pageSizeOptions}
                                defaultCurrent={1}
					            showQuickJumper
					            size="small"
					            current={this.props.sessions.current}
					            pageSize={this.props.sessions.params.limit}
					            onChange={this.loadSessions.bind(this)}
					            total={this.props.sessions.total}/>
	            </div> : ''}
	    </div>)
	}
}
