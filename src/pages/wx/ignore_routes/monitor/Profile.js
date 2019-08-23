'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 16/12/27
 */
import React from 'react'
import {Card, Button, Input, Icon, Row, Col, message, Checkbox} from 'antd'
import styles from './Profile.scss'

export default class extends React.Component {
    constructor(props) {
        super()
        this.state = {
            remark: '',
            from_uin: '',
            to_uin: '',
            value: {
                remark_name: ''
            },
            change: {
                remark_name: false
            },
            activeSession: {},
            tags: [],
            friendExtends: [],
            activeKey: '' // 当前修改extend key
        }
    }

    componentDidMount() {
        this.loadFriendTags()
        this.loadChatroomTags()
        this.loadFriendExtends()
    }

    componentWillUnmount() {
    }

    loadFriendTags = () => {
        this.props.dispatch({
            type: 'profile/queryFriendTags',
            payload: {}
        })
    };

    loadChatroomTags = () => {
        this.props.dispatch({
            type: 'profile/queryChatroomTags',
            payload: {}
        })
    };
    loadFriendExtends = () => {
        this.props.dispatch({
            type: 'profile/queryFriendExtends',
            payload: {}
        })
    };

    render() {

        return (<div className={styles.profile} style={{height: profileHeight}} ref="profile">
            {target.username ?
                <div>
                 username    
                </div>
                :
                <div className="tip-wrap">
                    <p className="tip">请选择客户</p>
                </div>
            }
        </div>)
    }
}
