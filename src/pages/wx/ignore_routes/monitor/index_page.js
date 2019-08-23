'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 16/12/27
 */
import React from 'react'
import { Row, Col} from 'antd'
import {connect} from 'dva'
import ContentHeader from 'components/business/ContentHeader'
import documentTitleDecorator from 'hoc/documentTitle'
import styles from './index.scss'
import Session from './Session'
import History from './History'
import GroupHistory from './GroupHistory'

@connect(({ base, wx_sessions, wx_messages,messages, wx_group_messages }) => ({
    base, wx_sessions, wx_messages, messages, wx_group_messages
}))
@documentTitleDecorator()
export default class extends React.Component {
    constructor(props) {
        super()
        this.state = {
            value: '',
            focus: '',
            activeSession: {},
            visible: false,
            visibleDetail: false,
            record: null
        }
    }

    componentDidMount() {

    }

    render() {
        const {winHeight: innerHeight} = this.props.base
        const _height = innerHeight - 60 - 93
        const {isFriendTab} = this.props.wx_sessions

        return (
            <div>
                <ContentHeader
                    contentType={'title'}
                    content={{
                        title: this.props.documentTitle,
                    }}
                    help={{
                        url: 'http://newhelp.51zan.cn/manual/content/%E4%B8%AA%E4%BA%BA%E5%8F%B7/%E6%B6%88%E6%81%AF%E7%AE%A1%E7%90%86.md',
                    }}
                />
                <div className={styles.monitorWrap}>
                    <Row>
                        <Col span={6}>
                            <div style={{height: _height}}>
                                <Session {...this.props}/>
                            </div>
                        </Col>
                        <Col span={18}>
                            <div style={{height: _height}}>
                                {
                                    isFriendTab ? <History {...this.props}/> : <GroupHistory {...this.props}/>
                                }
                            </div>
                        </Col>
                    </Row>
                </div>
            </div>
        )
    }
}
