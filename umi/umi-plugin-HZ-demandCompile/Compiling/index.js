/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2019/2/1
 */

import React, {PureComponent} from 'react'
import styles from './index.css'

class Index extends PureComponent {
    componentDidMount() {
        new Image().src = `${window.routerBase}__HZ_umi_dev/compiling${this.props.route}`
    }

    render() {
        return (
            <div className={styles.content}>按需编译中...</div>
        )
    }
}

export default Index
