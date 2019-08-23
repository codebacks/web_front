// 左右等高布局
// 左边宽度固定，右边自适应
// 类似From.Item的效果

import { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './index.less'

export default class AccorLayout extends Component {
    static propTypes = {
        title: PropTypes.string.isRequired,
        width: PropTypes.number.isRequired,
    }
    render () {
        const { title, width, style, className } = this.props
        return (
            <div  className={classNames(styles.wrap, className)} style={{ borderLeft: `${width}px solid transparent`, ...style }} >
                <div className={styles.title} style={{width: `${width}px`,marginLeft: `-${width}px`}}>{title}</div>
                <div className={styles.content}>
                    {this.props.children}
                </div>
            </div>
        )
    }
}