import React, { Component, Children } from 'react'
import styles from './index.scss'

export default class Item extends Component {
    delete = () => {
        this.props.onTopicDelete && this.props.onTopicDelete(this.props.topic)
        this.props.onDelete && this.props.onDelete(this.props.topic)
    }
    render() {
        const { topic, setField, render } = this.props
        return (
            <div className={styles.tags}>
                {/* 标签名和删除 */}
                <div className={styles.tagsHead}>
                    <div className={styles.name}>{topic && topic['label']}</div>
                    <div className={styles.operate} onClick={this.delete}>删除</div>
                </div>
                {/* 中间文字 */}
                <div className={styles.tagsCon}>{topic && topic['text']}</div>
                <div>
                    {
                        (render && typeof render === 'function') ?
                            render(topic, setField,this.props.validateFields.bind(this,topic),this.props.errors) : this.props.children
                    }
                </div>
            </div>
        )
    }
}

