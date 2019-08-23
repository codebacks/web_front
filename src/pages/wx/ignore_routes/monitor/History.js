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
import styles from './History.scss'
import config from 'wx/common/config'
import moment from 'moment'
import _ from 'lodash'
import Messages from 'components/business/HistoryMessages/Messages'
import 'moment/locale/zh-cn'

moment.locale('zh-cn')

const {DefaultAvatar, Sex} = config

class History extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            activeSession: {}
        }
    }

    componentDidMount() {}

    render() {
        let session = this.props.wx_sessions.activeSession || {}
        let target = session && session.target || {}
        let pageHeight = this.props.base.pageHeight
        let contentHeight = pageHeight - 200

        return (
            <div>{target.username ?
                <div className={styles.history}>
                    <div className={styles.chatHead}>
                        <Row>
                            <Col span={14}>
                                <div className={styles.targetWrap}>
                                    <div className={styles.userInfo}>
                                        <ul>
                                            <li>
                                                <div className={styles.nicknameWrap}>
													昵称： {_.get(session, 'target.nickname')} </div>
                                            </li>
                                            <li>
													来自： {_.get(session, 'target.city') ?
                                                    <span>{_.get(session, 'target.province') + _.get(session, 'target.city')}</span>
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
                            <Col span={10} style={{textAlign: 'right'}}>
                                <div className={styles.fromWrap}>
                                    <div className={styles.avatar}>
                                        <a href={_.get(session, 'from.head_img_url')} target="_blank" rel="noopener noreferrer">
                                            {_.get(session, 'from.head_img_url') ?
                                                <img src={_.get(session, 'from.head_img_url')} alt="" rel="noreferrer"/>
                                                :
                                                <img src={DefaultAvatar} alt=""/>
                                            }
                                        </a>
                                    </div>
                                    <div className={styles.userInfo}>
                                        <ul>
                                            <li>
													昵称：{_.get(session, 'from.nickname')}
                                            </li>
                                            <li>
													来自： {_.get(session, 'from.city') ?
                                                    <span>{_.get(session, 'from.province') + _.get(session, 'from.city')}</span>
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
                    <div className={styles.messagesWrap}>
                        <Messages {...this.props}
                                  fromUin={_.get(session, 'from.uin')}
                                  toUsername={_.get(session, 'target.username')}
                                  activeSession={session}
                                  contentHeight={contentHeight}
                        />
                    </div>
                </div>
                : <div className={styles.tipWrap} style={{paddingTop: 30}}>
                    <p className={styles.tip}>请选择客户</p>
                </div>
            }
            </div>
        )
    }
}

History.propTypes = {}

export default History
