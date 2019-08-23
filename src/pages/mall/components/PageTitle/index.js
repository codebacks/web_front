import React from 'react'
import PropTypes from 'prop-types'
import styles from './index.less'
export default class PageTitle extends React.PureComponent {
    static propTypes = {
        title: PropTypes.string.isRequired,
    }
    render(){
        const {title} = this.props
        return <div className={styles.pageTitle}>{title}</div>
    }
}