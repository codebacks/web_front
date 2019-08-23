/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/10/29
 */

import React, {PureComponent} from 'react'
import {Modal} from "antd"
import createFaceHtml from 'components/Face/createFaceHtml'
import PropTypes from 'prop-types'
import styles from "./index.less"

export default class Index extends PureComponent {
    static propTypes = {
        contents: PropTypes.array,
        typeKey: PropTypes.string.isRequired,
        contentKey:  PropTypes.string.isRequired,
    }

    static defaultProps = {
        contents: [],
    }

    renderMessages = (item) => {
        const {typeKey, contentKey} = this.props
        if(item[typeKey] === 1) {
            return createFaceHtml({
                tagName: 'div',
                tagProps: {className: styles.text},
                values: item[contentKey],
            })
        }else if(item[typeKey] === 3) {
            return (
                <img
                    className={styles.image}
                    src={item[contentKey]}
                    alt="imgType"
                />
            )
        }else if(item[typeKey] === 43) {
            return (
                <a
                    className={styles.video}
                    href={item[contentKey]}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                </a>
            )
        }
    }

    render() {
        const {visible, onCancel, contents, title} = this.props

        return (
            <Modal
                centered
                width={560}
                visible={visible}
                title={title}
                onCancel={onCancel}
                destroyOnClose={true}
                wrapClassName={styles.MsgContent}
                footer={null}
            >
                <ul className={styles.list}>
                    {
                        contents.map((item, index) => {
                            return (
                                <li
                                    className={styles.item}
                                    key={index}
                                >
                                    <span className={styles.label}>消息{index + 1}：</span>
                                    <div className={styles.content}>
                                        {
                                            this.renderMessages(item)
                                        }
                                    </div>
                                </li>
                            )
                        })
                    }
                </ul>
            </Modal>
        )
    }
}