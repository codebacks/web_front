import React, {PureComponent} from 'react'
import styles from './index.scss'

export default class Tip extends PureComponent {
    render() {
        return (
            <p className={styles.tip}>使用“牛客服”在聊天窗口选择对应信息，右键可将素材添加至素材库</p>
        )
    }
}

