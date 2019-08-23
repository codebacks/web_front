import React from 'react'
import { Popover } from 'antd'
import styles from './index.less'

export default class Index extends React.PureComponent {
    render(){
        const {
            text
        } = this.props
        return (
            <Popover placement="bottomLeft" content={text}>
                <span className={styles.text}>{text}</span>
            </Popover>
        )
    }
}