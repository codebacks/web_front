'use strict'

/**
 * 文件说明: 聊天记录
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 17/2/25
 */

import React from 'react'
import {Row, Col} from 'antd'
import Messages from 'components/business/HistoryMessages/Messages'
import styles from './index.scss'

export default class extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            record: {},
            selectedIndex: 0,
        }
    }

    loadFriends = () => {
        const wxId = this.props.wxId
        this.props.dispatch({
            type: 'crm_customers/queryFriends',
            payload: {params: {username: wxId}},
            callback: (data) => {
                this.setState({
                    record: data[0],
                    selectedIndex: 0,
                })
            }
        })
    };

    componentDidMount() {
        this.loadFriends()
    }

    handleSelect = (record, index) => {
        this.setState({
            record: record,
            selectedIndex: index
        })
    }

    render() {
        const {friends, loadingFriends} = this.props.crm_customers
        const {record, selectedIndex} = this.state
        const height = this.props.base.winHeight - 196
        return (
            <div className={styles.historyWrap}>
                {friends.length ?
                    <Row>
                        <Col span={3}>
                            <ul className={styles.friends} style={{height: height}}>
                                {friends.map((item, idx) => {
                                    return <li className={`${styles.friend} ${selectedIndex === idx ? styles.active : ''}`}
                                        key={idx} onClick={()=>{this.handleSelect(item, idx)}}>{item.from.remark || item.from.nickname}</li>
                                })}
                            </ul>
                        </Col>
                        <Col span={18} className={styles.message}>
                            {record.from ?
                                <Messages {...this.props}
                                    fromUin={record.from.uin}
                                    toUsername={record.target.username}
                                    activeSession={record}
                                    contentHeight={height}
                                /> : null}
                        </Col>
                    </Row>
                    : ''}
                {!loadingFriends && !friends.length ?
                    <p style={{padding: '30px 0'}}>未找到该客户聊天记录</p>
                    : ''}
            </div>
        )
    }
}
