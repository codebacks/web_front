/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/10/15
 */

import React, {PureComponent} from 'react'
import PropTypes from "prop-types"
import styles from './index.less'
import {Icon} from "antd"

export default class LibModalWarp extends PureComponent {
    static propTypes = {
        buttons: PropTypes.array,
    }

    static defaultProps = {
        buttons: [],
    }

    renderBtn = (item) => {
        return (
            <div
                className={styles.addInner}
                onClick={item.onClick}
            >
                <Icon
                    type="plus"
                    className={styles.addIcon}
                />
                <div
                    className={styles.addName}
                >
                    {item.name}
                </div>
            </div>
        )
    }

    renderButtons = () => {
        const {
            buttons,
        } = this.props

        return buttons.map((item, index) => {
            item.key = item.key || `addBlock-${index}`
            return (
                <div
                    className={styles.add}
                    key={item.key}
                >
                    {item.render(this.renderBtn)}
                </div>
            )
        })
    }

    render() {
        return (
            <div className={styles.addBlockWarp}>
                <div className={styles.addBlock}>
                    {this.renderButtons()}
                </div>
            </div>
        )
    }
}
