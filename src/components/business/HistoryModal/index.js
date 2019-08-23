import React, {Component} from 'react'
import {Button, Modal} from 'antd'
import createFaceHtml from 'components/Face/createFaceHtml'
import Messages from 'components/business/HistoryMessages/Messages'
import styles from './index.less'

export default class extends Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount(props) {
    }

    getName = (item) => {
        return item.remark || item.remark_name || item.nickname
    }

    getInfo = (record) => {
        if (record) {
            const from = record.from ? this.getName(record.from)
                : (record.service_wechat ? this.getName(record.service_wechat)
                    : (record.friend && record.friend.from ? this.getName(record.friend.from) : ''))

            const target = record.target ? this.getName(record.target)
                : (record.wechat ? this.getName(record.wechat)
                    : (record.friend && record.friend.target ? this.getName(record.friend.target) : ''))
            return {from, target}
        }
        return {}
    }

    handleCancel = () => {
        this.props.onCancel()
    }

    render() {
        const {visible, record, fromUin, toUsername, keyword} = this.props
        const {winHeight} = this.props.base
        const contentHeight = winHeight - 140
        const info = this.getInfo(record)

        return (
            <Modal
                title={createFaceHtml({
                    tagName: 'div',
                    tagProps: {className: styles.title},
                    values: `聊天记录（${info.from}与${info.target}的聊天记录）`
                })}
                centered
                visible={visible}
                wrapClassName={styles.wrapper}
                width={910}
                maskClosable={false}
                onCancel={this.handleCancel}
                footer={[
                    <Button key="cancel" onClick={this.handleCancel}>取消</Button>
                ]}>
                <Messages {...this.props}
                    fromUin={fromUin}
                    toUsername={toUsername}
                    activeSession={record}
                    keyword={keyword}
                    contentHeight={contentHeight}
                />
            </Modal>
        )
    }
}
