/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2019/2/20
 */

import React from 'react'
import styles from './index.less'
import PropTypes from "prop-types"

export default class Index extends React.PureComponent {
    static propTypes = {
        top: PropTypes.number,
        hidden: PropTypes.bool,
        content: PropTypes.func.isRequired,
        height: PropTypes.number.isRequired,
        item: PropTypes.object,
    }

    static defaultProps = {
        top: 0,
        hidden: true,
        content: ({id, data}) => {
            return (
                <div className={`${styles.tombstone}`}>
                    {/*{id}*/}
                    <img
                        className={styles.avatar}
                        width="48"
                        height="48"
                        src={require('./images/unknown.jpg')}
                    />
                    <div className={styles.bubble}>
                        <p></p>
                        <p></p>
                        <p></p>
                    </div>
                </div>
            )
        },
    }

    render() {
        const {
            top,
            hidden,
            item,
            height,
            content,
        } = this.props

        return (
            <div
                style={{
                    display: `${hidden ? 'none' : ''}`,
                    position: 'absolute',
                    transform: `translate(0, ${top}px)`,
                    height: `${height}px`,
                }}
            >
                {
                    content({
                        id: item.id,
                        data: item.data,
                    })
                }
            </div>
        )
    }
}
