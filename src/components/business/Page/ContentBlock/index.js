import React from 'react'
import styles from './index.less'
import classNames from 'classnames'

export default class ContentBlock extends React.PureComponent {
    render() {
        const {
            title,
            hasDivider,
            children,
            style,
            className,
            subhead,
            gutterTop = true,
            gutterBottom = true
        } = this.props
        
        return (
            <div className={classNames(styles.block , (hasDivider ? styles.blockBottomDriver : '' ), className)} style={{...style}}>
                <div className={classNames(styles.title, (!gutterTop ? styles.clearGutterTop : ''), (!gutterBottom ? styles.clearGutterBottom : ''))} >
                    <span className={styles.titleDriver}></span>
                    <span>{title}</span>
                    <span className={styles.subhead}>{subhead}</span>
                </div>
                <div className={styles.body}>
                    {children}
                </div>
            </div>
        )
    }
}