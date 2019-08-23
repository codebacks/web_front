/**
 * @Description
 * @author XuMengPeng
 * @date 2018/11/5
 */

import React, {PureComponent} from 'react'
import {Tooltip, Icon} from 'antd'
import config from 'wx/common/config'
import moment from 'moment'
import _ from 'lodash'
import createFaceHtml from 'components/Face/createFaceHtml'
import {MessageTypes} from 'components/business/HistoryMessages/config'
import {parseMsg} from './util'
import styles from './Session.scss'

const {
    DateMonthFormat,
    DefaultAvatar,
} = config

export default class SessionList extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {
    }

    childHandleItemClick = (item) => {
        this.props.handleItemClick(item)
    }

    render() {
        const { list, activeSession, listHeight, sessionLoading } = this.props

        const getTime = (item) => {
            if (_.get(item, 'conversation_time')) {
                return moment(_.get(item, 'conversation_time')).format(DateMonthFormat)
            }
        }

        const lastMessageContent = (item) => {
            const message = parseMsg(item)
            const msgType = Number(_.get(message, 'msg_type'))

            if (msgType === MessageTypes.text) {
                return createFaceHtml({
                    tagName: 'span',
                    tagProps: {className: styles.digest},
                    values: item.digest
                })
            }
            return <span className={styles.digest}>{item.digest}</span>
        }

        const getCls = (item) => {
            //用户名跟微信号一致
            if (_.get(activeSession, 'target.id') === item.target.id) {
                if (_.get(activeSession, 'target.username').startsWith('@@') && item.target.username.startsWith('@@')) {
                    return styles.chatItem + ' ' + styles.active
                }
                if (!_.get(activeSession, 'target.username').startsWith('@@') && !item.target.username.startsWith('@@')) {
                    return styles.chatItem + ' ' + styles.active
                }
                return styles.chatItem
            } else {
                return styles.chatItem
            }
        }

        return (
            <div className={styles.list} id="sessionList">
                <div className={styles.sessionListWrap} style={{height: listHeight}}>
                    {sessionLoading ? <div className={styles.loadingWrap}><Icon type="loading"/></div> :
                        <div>
                            {list.length ?
                                <ul>
                                    {list.map((item, index) => {
                                        if (item.from && item.target && item.target.username) {
                                            let status = _.get(item, 'status.progress.content') ?
                                                <strong
                                                    className={styles.status}
                                                >{_.get(item, 'status.progress.content')}<i>-</i></strong> : ''
                                            let isBlock = item.target.is_block ?
                                                <span className={styles.isBlock}>[已被删除]</span> : ''
                                            return (
                                                <li className={getCls(item)}
                                                    key={_.get(item, 'target.username') + index}
                                                    onClick={() => {
                                                        this.childHandleItemClick(item)
                                                    }}>
                                                    <div className={styles.avatar}>
                                                        <img src={item.target.head_img_url}
                                                             onError={(e) => {
                                                                 e.target.src = DefaultAvatar
                                                             }}
                                                             alt=""
                                                             rel="noreferrer"
                                                        />
                                                    </div>
                                                    <h3 className={styles.nickname}>
                                                        {status}{isBlock}
                                                        {_.get(item, 'target.remark_name')
                                                            ? _.get(item, 'target.remark_name') : _.get(item, 'target.nickname')}
                                                    </h3>
                                                    <div className={styles.lastMessage}>
                                                        {lastMessageContent(item)}
                                                        <Tooltip placement="topRight"
                                                                 title={_.get(item, 'from.nickname')}>
                                                            <span
                                                                className={styles.from}
                                                            >{_.get(item, 'from.nickname')}</span>
                                                        </Tooltip>
                                                    </div>
                                                    <div className={styles.time}>{getTime(item)}</div>
                                                </li>
                                            )
                                        } else {
                                            return ''
                                        }
                                    })}
                                </ul>
                                : <div className={styles.tipWrap}>
                                    <p className={styles.tip}>没有聊天会话</p>
                                </div>
                            }
                        </div>
                    }
                </div>
            </div>
        )
    }
}
