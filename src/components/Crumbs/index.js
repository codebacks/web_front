/**
 **@Description:
 **@author: 1625
 */

import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import {Breadcrumb} from 'antd'
import {Link} from 'dva/router'
import styles from './index.less'

export const crumbsHeight = 42

export default class Crumbs extends PureComponent {
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
            <Breadcrumb
                className={styles.crumbs}
                style={{
                    lineHeight: `${crumbsHeight}px`,
                    height: `${crumbsHeight}px`,
                }}
            >
                {this.renderBreadcrumbItem()}
            </Breadcrumb>
        )
    }
}
