import React from 'react'
import styles from './index.less'
import classNames from 'classnames'

export default class ContentMain extends React.PureComponent {

    static defaultProps = {
        hasGutter: true,
        multiple: true
    }

    render(){
        const {
            className,
            children,
            hasGutter,
            multiple
        } = this.props 

        return (
            <div className={classNames(styles.searchBox, !hasGutter ? styles.noGutter: '', !multiple? styles.noMultiple: '', className)}>
                <div className={styles.content}>
                    {children}
                </div>
            </div>
        )
    }
}