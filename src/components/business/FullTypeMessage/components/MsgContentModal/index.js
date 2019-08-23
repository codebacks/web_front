/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/10/15
 */

import React, {PureComponent} from 'react'
import toggleModalWarp from 'hoc/toggleModalWarp'
import MsgContent from '../MsgContent'
import styles from './index.less'
import PropTypes from "prop-types"
import {getTabName} from '../../constant'

@toggleModalWarp({
    title: "回复内容",
    width: 560,
    destroyOnClose: true,
    maskClosable: false,
    centered: true,
    wrapClassName: styles.MsgContent,
    footer: null,
})
export default class MsgContentModal extends PureComponent {
    static propTypes = {
        contents: PropTypes.array,
        transformItem: PropTypes.func,
    }

    static defaultProps = {
        contents: [],
        transformItem: (data) => {
            return data.common_msg_content || {}
        },
    }

    render() {
        const {contents} = this.props

        return (
            <ul className={styles.list}>
                {
                    contents.map((item, index) => {
                        if(this.props.transformItem) {
                            item = this.props.transformItem(item)
                        }
                        return (
                            <li
                                className={styles.item}
                                key={index}
                            >
                                <span className={styles.label}>消息{index + 1}({getTabName(item.type)})：</span>
                                <div className={styles.content}>
                                    <MsgContent
                                        {...item}
                                    />
                                </div>
                            </li>
                        )
                    })
                }
            </ul>
        )
    }
}
