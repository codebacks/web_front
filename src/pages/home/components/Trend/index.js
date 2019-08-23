import React from 'react'
import {Icon} from 'antd'
import styles from './index.less'
import classnames from 'classnames'

export default class Trend extends React.PureComponent {
    render(){
        const { 
            title, 
            flag,
            children } = this.props

        const className = flag ? (flag==='up'? styles.textUp: styles.textDown): ''

        return <dl className={classnames(styles.trend, className)}>
            <dt>{title}</dt>
            <dd>
                {flag && (
                    <span className={styles[flag]}>
                        <Icon type={`caret-${flag}`} />
                    </span>
                )} {children}
            </dd>
        </dl>
    }
}