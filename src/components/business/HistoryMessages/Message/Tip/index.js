import React, {PureComponent} from 'react'
import {MessageTypeText} from '../../config'
import styles from './index.less'

export default class Tip extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {
    }

    render() {
        const {type} = this.props
        const typeText = MessageTypeText[type]
        return <div className={`${styles.box} ${styles.text}`}>
            【{typeText}】暂不支持请在手机上查看
        </div>
    }
}