/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/11/7
 */

import React from 'react'
import {
    Popover,
} from 'antd'
import Ellipsis from 'components/Ellipsis'
import classNames from 'classnames'
import styles from './index.less'
import PropTypes from "prop-types"

function EllipsisPopover(props) {
    const {
        popoverContentClassName,
        content,
        ellipsisClassName,
        ...otherProps
    } = props

    return (
        <Popover
            {...otherProps}
            content={
                <p
                    className={classNames(styles.popoverContent, popoverContentClassName)}
                >
                    {content}
                </p>
            }
        >
            <Ellipsis
                {...otherProps}
                className={classNames(styles.ellipsis, ellipsisClassName)}
            >
                {content}
            </Ellipsis>
        </Popover>
    )
}

EllipsisPopover.defaultProps = {
    placement: 'topLeft',
    title: null,
    trigger: 'hover',
}

EllipsisPopover.propTypes = {
    content: PropTypes.string,
    popoverContentClassName: PropTypes.string,
    ellipsisClassName: PropTypes.string,
}

export default EllipsisPopover