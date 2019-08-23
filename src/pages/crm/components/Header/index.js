/**
 **@Description:
 **@author: leo
 */

import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import {Breadcrumb} from 'antd'
import {Link} from 'dva/router'
import styles from './index.less'

export default class Header extends PureComponent {
    static propTypes = {
        breadcrumbData: PropTypes.array,
    }

    static defaultProps = {
        breadcrumbData: [],
    }

    renderBreadcrumbItem = () => {
        const {breadcrumbData} = this.props
        return breadcrumbData.map((item, i) => {
            const content = item.path ? (
                <Link to={item.path}>{item.name}</Link>
            ) : item.name
            return (
                <Breadcrumb.Item key={i}>
                    {content}
                </Breadcrumb.Item>
            )
        })
    }

    render() {

        return (
            <header className={styles.header}>
                <Breadcrumb>
                    {
                        this.renderBreadcrumbItem()
                    }
                </Breadcrumb>
            </header>
        )
    }
}
