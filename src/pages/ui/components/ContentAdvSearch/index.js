import React from 'react'
import styles from './index.less'

export default class ContentMain extends React.PureComponent {
    render(){
        const {children} = this.props 

        return (
            <div className={styles.content}>
                {children}
            </div>
        )
    }
}