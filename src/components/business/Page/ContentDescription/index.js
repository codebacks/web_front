import React from 'react'
import classnames from 'classnames'
import styles from './index.less'

export default class Index extends React.PureComponent {

    static defaultProps = {
        isInnerHeader: false
    }

    render() {
        const {
            label,
            text,
            isInnerHeader
        } = this.props

        return <div className={classnames(styles.description, isInnerHeader?styles.headDescription: '')}>
            <div className={styles.content}>
                { label && <h5 className={styles.title}>{label}</h5>}
                {text}
            </div>
        </div>
    }
}