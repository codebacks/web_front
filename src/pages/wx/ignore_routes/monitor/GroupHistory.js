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
import _ from 'lodash'
import moment from 'moment'
import 'moment/locale/zh-cn'
import styles from './History.scss'
import GroupMessages from 'components/business/HistoryMessages/GroupMessages'

moment.locale('zh-cn')

class History extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
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
                                                    群名称： {
                                                    _.get(session, 'target.nickname') ? _.get(session, 'target.nickname')
                                                        : _.get(session, 'target.display_name')}
                                                </div>
                                            </li>
                                            <li>
                                                群成员： {session.target.members_num ? `${session.target.members_num}人` : '未知'}
                                            </li>
                                            <li>
                                                备注：{session.target.remark ? session.target.remark: '无'}
                                            </li>
                                        </ul>

                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </div>
                    <div className={styles.messagesWrap}>
                        <GroupMessages
                            {...this.props}
                            activeSession={session}
                            fromUin={session.uin}
                            toUsername={session.target.username}
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
