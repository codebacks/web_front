/* eslint-disable no-mixed-spaces-and-tabs */
'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 16/12/8
 */
import React from 'react'
import {
    Pagination,
    Row,
    Col,
    Icon,
    Input,
    Button,
    DatePicker,
    message
} from 'antd'
import classNames from 'classnames'
import styles from './History.scss'
import Helper from 'crm/utils/helper'
import config from 'crm/common/config'
import moment from 'moment'
import MessagesView from '../Messages/MessagesView'
import 'moment/locale/zh-cn'

moment.locale('zh-cn')
const InputGroup = Input.Group
const {pageSizeOptions, DateFormat, DefaultAvatar, Sex, ReceiveMessageTypes} = config

class History extends React.Component {
    constructor(props) {
        super()
        this.state = {
            focus: false,
            endOpen: false,
            order_id: '',
            visible: false,
            message: null,
            activeSession: {}
        }
    }

	loadMessages = (params) => {
	    this.props.dispatch({
	        type: 'messages/query',
	        payload: {
	            params: {
	                from_uin: params.from.uin,
	                to_username: params.target.username,
	                offset: (-this.props.messages.params.limit)
	            }
	        },
	        callback: (data) => {
	            this.handleIntoView()
	        }
	    })
	};

	componentDidMount() {
	    this.props.dispatch({
	        type: 'messages/resetParams',
	        payload: {},
	        callback: () => {
	        }
	    })
	}

	componentWillReceiveProps = (props) => {
	    try {
	        let activeSession = {...props.sessions.activeSession}
	        if (activeSession.target) {
	            if (activeSession.target.username !== Helper.getIn(this.state, 'activeSession.target.username') || activeSession.from.username !== Helper.getIn(this.state, 'activeSession.from.username')) {
	                this.setState({
	                    activeSession: activeSession
	                })
	                this.loadMessages(activeSession)
	            }
	        }
	    }
	    catch (e) {
	        console.log('profile index will receive props')
	    }
	};

	handleIntoView = (flag) => {
	    setTimeout(() => {
	        const node = document.getElementsByClassName('message-history')
	        if (node.length) {
	            const li = node[0].getElementsByTagName('li')
	            let idx = 0
	            if (flag === 'search') {
	                //定位到第一条搜索结果
	                const {list, params} = this.props.messages
	                idx = list.findIndex((item) => {
	                    if (item.type === ReceiveMessageTypes.text) {
	                        return item.content.indexOf(params.old_content) !== -1
	                    }
	                })
	            } else {
	                idx = li.length - 1
	            }
	            if (idx) {
	                li[idx] && li[idx].scrollIntoView()
	            }
	        }
	    }, 100)
	};

	handlePage(page) {
	    this.props.dispatch({
	        type: 'messages/query',
	        payload: {page: page},
	        callback: () => {
	            this.handleIntoView()
	        }
	    })
	}

	handleInputChange(e) {
	    let content = e.target.value.trim()
	    let params = {...this.props.messages.params}
	    params.content = content
	    params.old_content = content
	    this.props.dispatch({
	        type: 'messages/setProperty',
	        payload: {params: params},
	    })
	}

	handleFocusBlur(e) {
	    this.setState({
	        focus: e.target === document.activeElement,
	    })
	}

	disabledStartDate = (start_time) => {
	    let params = {...this.props.messages.params}
	    const end_time = params.end_time
	    if (!start_time || !end_time) {
	        return false
	    }
	    return start_time.valueOf() > moment(end_time).unix * 1000
	};

	disabledEndDate = (end_time) => {
	    let params = {...this.props.messages.params}
	    const start_time = params.start_time
	    if (!end_time || !start_time) {
	        return false
	    }
	    return end_time.valueOf() <= moment(start_time).unix() * 1000
	};
	onChange = (field, value) => {
	    let params = {...this.props.messages.params}
	    if (field === 'start_time') {
	        if (value) {
	            params[field] = moment(value).format(DateFormat) + ' 00:00:00'
	        } else {
	            params[field] = ''
	        }
	    } else {
	        if (value) {
	            params[field] = moment(value).format(DateFormat) + ' 23:59:59'
	        } else {
	            params[field] = ''
	        }
	    }
	    this.props.dispatch({
	        type: 'messages/setProperty',
	        payload: {params: params},
	    })
	    this.handleSearch()
	};
	handleChangeCash = (e) => {
	    let params = {...this.props.messages.params}
	    params.origin_app_message_type = e.target.value
	    this.props.dispatch({
	        type: 'messages/setProperty',
	        payload: {params: params},
	    })
	    this.handleSearch()
	};

	onStartChange = (value) => {
	    this.onChange('start_time', value)
	};

	onEndChange = (value) => {
	    this.onChange('end_time', value)
	};

	handleStartOpenChange = (open) => {
	    if (!open) {
	        this.setState({endOpen: true})
	    }
	};

	handleEndOpenChange = (open) => {
	    this.setState({endOpen: open})
	};

	handleSearch = () => {
	    setTimeout(() => {
	        this.props.dispatch({
	            type: 'messages/query',
	            payload: {page: 1},
	            callback: () => {
	                this.handleIntoView('search')
	            }
	        })
	    }, 0)
	};

	handleNextPos = () => {
	    let params = {...this.props.messages.params}
	    params.content = params.old_content
	    params.offset = params.offset + params.limit
	    if (params.offset < this.props.messages.total) {
	        setTimeout(() => {
	            this.props.dispatch({
	                type: 'messages/query',
	                payload: {params: params},
	                callback: () => {
	                    this.handleIntoView('search')
	                }
	            })
	        }, 0)
	    } else {
	        message.warning('已查找到最后一页!')
	    }
	};

	handleRemoveContent = () => {
	    let params = {...this.props.messages.params}
	    params.old_content = ''
	    params.content = ''
	    this.props.dispatch({
	        type: 'messages/setProperty',
	        payload: {params: params}
	    })
	    this.handleSearch()
	};


	render() {
	    let session = this.props.sessions.activeSession || {}
	    let target = session && session.target || {}
	    let innerHeight = this.props.base.winHeight
	    let {params} = this.props.messages
	    const searchCls = classNames({
	        'ant-search-input': true,
	        'ant-search-input-focus': this.state.focus,
	    })
	    const btnCls = classNames({
	        'ant-search-btn': true,
	        'ant-search-btn-noempty': !!params.content.trim(),
	    })
	    let listHeight = ''
	    if (this.refs.searchPanel && this.refs.searchPanel.getBoundingClientRect()) {
	        listHeight = innerHeight - this.refs.searchPanel.getBoundingClientRect().bottom - 78
	    }
	    const {endOpen} = this.state
	    return (
	        <div>
	            {target.username ?
	                <div className={styles.history}>
	                    <div className={styles.chatHead}>
	                        <Row>
	                            <Col span="14">
	                                <div className={styles.targetWrap}>
	                                    <div className={styles.userInfo}>
	                                        <ul>
	                                            <li>
	                                                <div className={styles.nicknameWrap}>
														昵称： {Helper.getIn(session, 'target.nickname')} </div>
	                                            </li>
	                                            <li>
													来自： {Helper.getIn(session, 'target.city') ?
	                                                    <span>{Helper.getIn(session, 'target.province') + Helper.getIn(session, 'target.city')}</span>
	                                                    :
	                                                    <span>无</span>
	                                                }
	                                            </li>
	                                            <li>
													性别： {session.target.sex ? Sex[session.target.sex] : '未知'}
	                                            </li>
	                                            <li>
													备注：{session.target.remark_name}
	                                            </li>
	                                        </ul>

	                                    </div>
	                                </div>
	                            </Col>
	                            <Col span="10" style={{textAlign: 'right'}}>
	                                <div className={styles.fromWrap}>
	                                    <div className={styles.avatar}>
	                                        <a href={Helper.getIn(session, 'from.head_img_url')} target="_blank" rel="noopener noreferrer">
	                                            {Helper.getIn(session, 'from.head_img_url') ?
	                                                <img src={Helper.getIn(session, 'from.head_img_url')} alt=""/>
	                                                :
	                                                <img src={DefaultAvatar} alt=""/>
	                                            }
	                                        </a>
	                                    </div>
	                                    <div className={styles.userInfo}>
	                                        <ul>
	                                            <li>
													昵称：{Helper.getIn(session, 'from.nickname')}
	                                            </li>
	                                            <li>
													来自： {Helper.getIn(session, 'from.city') ?
	                                                    <span>{Helper.getIn(session, 'from.province') + Helper.getIn(session, 'from.city')}</span>
	                                                    :
	                                                    <span>无</span>
	                                                }
	                                            </li>
	                                            <li>
													性别：{session.from.sex ? Sex[session.from.sex] : '未知'}
	                                            </li>
	                                        </ul>
	                                    </div>
	                                </div>
	                            </Col>
	                        </Row>
	                    </div>

	                    <div className={styles.searchPanel} ref="searchPanel">
	                        <div>
	                            <Row gutter={16}>
	                                <Col span="9">
	                                    <InputGroup className={searchCls}>
	                                        <Input placeholder="请输入搜索关键字" value={this.props.messages.params.content}
											       onChange={this.handleInputChange.bind(this)}
											       onFocus={this.handleFocusBlur.bind(this)}
											       onBlur={this.handleFocusBlur.bind(this)}
											       onPressEnter={this.handleSearch.bind(this)}
	                                        />
	                                        <div className="ant-input-group-wrap">
	                                            <Button icon="search" className={btnCls}
												        onClick={this.handleSearch.bind(this)}/>
	                                        </div>
	                                    </InputGroup>
	                                    {params.old_content ?
	                                        <div className={styles.nextPos}>
	                                            <strong>关键字：{params.old_content}</strong>
	                                            <Button size="small" style={{marginLeft: 8}}
												        className={styles.btn}
												        onClick={this.handleNextPos}>下一条</Button>
	                                            <Icon type="close" className={styles.removeBtn}
												      onClick={this.handleRemoveContent}/>
	                                        </div>
	                                        : ''}
	                                </Col>
	                                <Col span="7">
	                                    <DatePicker
	                                        disabledDate={this.disabledStartDate}
	                                        // showTime
	                                        format="YYYY-MM-DD"
	                                        // value={params.start_time && moment(params.start_time, DateFormat) || 0}
	                                        placeholder="开始时间"
	                                        style={{width: '100%'}}
	                                        onChange={this.onStartChange}
	                                        onOpenChange={this.handleStartOpenChange}
	                                    />
	                                </Col>
	                                <Col span="1" className={styles.sp}>至</Col>
	                                <Col span="7">
	                                    <DatePicker
	                                        disabledDate={this.disabledEndDate}
	                                        // showTime
	                                        format="YYYY-MM-DD"
	                                        // value={params.end_time && moment(params.end_time, DateFormat) || 0}
	                                        placeholder="结束时间"
	                                        onChange={this.onEndChange}
	                                        open={endOpen}
	                                        style={{width: '100%'}}
	                                        onOpenChange={this.handleEndOpenChange}
	                                    />
	                                </Col>
	                            </Row>
	                        </div>
	                    </div>
	                    <div className="message-history">
	                        <MessagesView
	                            {...this.props}
	                            cls={styles.listView}
	                            historyHeight={listHeight}
	                            loading={this.props.messages.loading}
	                            keyword={this.props.messages.params.old_content}
	                            hideBind={true}
	                            records={this.props.messages.list}/>
	                    </div>

	                </div>
	                :
	                <div className={styles.tipWrap} style={{paddingTop: 30}}>
	                    <p className={styles.tip}>请选择客户</p>
	                </div>
	            }
	            {target.username && this.props.messages.list.length ?
	                <div className={styles.pageWrap}>
	                    <Pagination pageSizeOptions={pageSizeOptions}
                                    defaultCurrent={1}
						            showQuickJumper
						            size="small"
						            current={this.props.messages.current}
						            pageSize={this.props.messages.params.limit}
						            onChange={this.handlePage.bind(this)}
						            total={this.props.messages.total}/>
	                </div>
	                : ''}
	        </div>
	    )
	}
}

History.propTypes = {}

export default History
