'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 16/12/8
 */
import React from 'react'
import  {Modal, Pagination, Row, Col} from 'antd'
import MessagesView from 'components/Common/MessagesView/Index'
import styles from './Index.scss'
import Helper from 'crm/utils/helper'
import config from 'crm/common/config'

const {Sex} = config

class PerHistory extends React.Component {
    constructor(props) {
        super()
        this.state = {}
    }

    loadMessages = (params) => {
        this.props.dispatch({
            type: 'crm_perHistory/query',
            payload: {
                params: {
                    uin: params.from.uin,
                    to_uin: params.target.id,
                    is_chatroom: params.target.username.startsWith('@@'),
                    message_id: this.props.message_id,
                }
            },
        })
    };

    componentDidMount() {
        this.loadMessages(this.props.record)
    }

    handleCancel = () => {
        this.props.dispatch({
            type: 'crm_perHistory/resetState',
            payload: {},
        })
        this.props.onCancel()
    };

    handlePage(page) {
        this.props.dispatch({
            type: 'crm_perHistory/query',
            payload: {page: page},
        })
    }

    render() {
        let target = this.props.record.target

        return (
            <Modal
                visible={this.props.visible}
                title="聊天记录"
                onCancel={this.handleCancel}
                footer={[]}
                width={900}
                height={720}
                className={styles.perHistory}
            >
                <div className={styles.content}>
                    <Row>
                        <Col span="16">
                            <div className={styles.chatHistory}>
                                <MessagesView {...this.props} activeObj={this.props.record}
                                    historyHeight={600}
                                    loading={this.props.crm_perHistory.loading}
                                    messages={this.props.crm_perHistory.messages}/>
                            </div>
                            <div className={styles.pageWrap}>
                                <Pagination defaultCurrent={1}
                                    current={this.props.crm_perHistory.current}
                                    pageSize={this.props.crm_perHistory.params.limit}
                                    onChange={this.handlePage.bind(this)}
                                    total={this.props.crm_perHistory.total}/>
                            </div>

                        </Col>
                        <Col span="8">
                            <div className={styles.attrs}>
                                <Row>
                                    <Col span="6" className={styles.label}>
                                        <label>来自:</label>
                                    </Col>
                                    <Col span="18">
                                        {Helper.getIn(target, 'province') + Helper.getIn(target, 'city')}
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span="6" className={styles.label}>
                                        <label>性别:</label>
                                    </Col>
                                    <Col span="18">
                                        {target.sex ? Sex[target.sex] : '未知'}
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span="6" className={styles.label}>
                                        <label>昵称:</label>
                                    </Col>
                                    <Col span="18">
                                        { target.nickname}
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span="6" className={styles.label}>
                                        <label>添加时间:</label>
                                    </Col>
                                    <Col span="18">
                                        {Helper.timestampFormat(Helper.getIn(target, 'add_time')) || '未知'}
                                    </Col>
                                </Row>

                                <Row>
                                    <Col span="6" className={styles.label}>
                                        <label>备注名:</label>
                                    </Col>
                                    <Col span="18">
                                        {Helper.getIn(target, 'remark_name') || '未知'}
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span="6" className={styles.label}>
                                        <label>手机号码:</label>
                                    </Col>
                                    <Col span="18">
                                        {Helper.getIn(target, 'mobile') || '无'}
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span="6" className={styles.label}>
                                        <label>邮箱地址:</label>
                                    </Col>
                                    <Col span="18">
                                        {Helper.getIn(target, 'email') || '无'}
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span="6" className={styles.label}>
                                        <label>微博账号:</label>
                                    </Col>
                                    <Col span="18">
                                        {Helper.getIn(target, 'weibo') || '无'}
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span="6" className={styles.label}>
                                        <label>备注:</label>
                                    </Col>
                                    <Col span="18">
                                        {Helper.getIn(target, 'remark') || '无'}
                                    </Col>
                                </Row>
                            </div>

                        </Col>
                    </Row>
                </div>
            </Modal>
        )
    }
}

PerHistory.propTypes = {}

export default PerHistory
