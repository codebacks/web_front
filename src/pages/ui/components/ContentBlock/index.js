import React from 'react'
import styles from './index.less'

export default class Index extends React.PureComponent {
    render() {
        const {
            title,
            hasDivider,
            children
        } = this.props

        return (
            <div className={styles.block + ' ' + (hasDivider? styles.blockBottomDriver : '')}>
                <div className={styles.title} >
                    <span className={styles.titleDriver}></span>
                    <span>{title}</span>
                </div>
                <div className={styles.body}>
                    {children}
                </div>
            </div>
        )
    }
}