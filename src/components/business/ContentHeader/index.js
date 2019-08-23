/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/01/14
 */

import React from 'react'
import styles from './index.less'
import {
    Icon,
    Breadcrumb,
    Popover,
} from 'antd'
import classNames from 'classnames'
import Link from 'umi/link'
import PropTypes from 'prop-types'
import {firstStringToUppercase} from './utils'

export default class ContentHeader extends React.PureComponent {
    static propTypes = {
        contentType: PropTypes.oneOf(['title', 'breadcrumb', 'custom']).isRequired,
        content: PropTypes.oneOfType([
            PropTypes.object,
            PropTypes.array,
            PropTypes.func,
        ]).isRequired,
        help: PropTypes.oneOfType([
            PropTypes.object,
            PropTypes.func,
        ]),
        className: PropTypes.string,
        breadcrumbOption: PropTypes.object,
    }

    static defaultProps = {
        contentType: 'title',
    }

    renderCustomContent = () => {
        return this.props.content()
    }

    renderDescription = (description, descriptionPlacement) => {
        if(typeof description === 'function') {
            return description()
        }else if(description) {
            return (
                <Popover
                    placement={descriptionPlacement || 'bottomLeft'}
                    content={description}
                    title={null}
                >
                    <Icon
                        className={styles.questionCircle}
                        type="question-circle-o"
                    />
                </Popover>
            )
        }
    }

    renderTitleContent = () => {
        const {
            content: {
                title = '',
                description,
                descriptionPlacement,
            } = {},
        } = this.props

        return (
            <h1 className={styles.title}>
                {title}
                {
                    this.renderDescription(description, descriptionPlacement)
                }
            </h1>
        )
    }

    renderBreadcrumbContent = () => {
        const {
            breadcrumbOption = {},
        } = this.props
        return (
            <Breadcrumb
                {...breadcrumbOption}
                className={classNames(styles.breadcrumb, breadcrumbOption.className)}
            >
                {this.renderBreadcrumbItem()}
            </Breadcrumb>
        )
    }

    renderBreadcrumbItemContent = (item = [], i) => {
        if(typeof item.render === 'function') {
            return item.render(item, i)
        }else {
            return item.path ? (
                <Link to={item.path}>{item.name}</Link>
            ) : item.name
        }
    }

    renderBreadcrumbItem = () => {
        const {content} = this.props

        return content.map((item, i) => {
            return (
                <Breadcrumb.Item
                    {...item}
                    key={i}
                >
                    {this.renderBreadcrumbItemContent(item, i)}
                </Breadcrumb.Item>
            )
        })
    }

    renderContent = () => {
        const {
            contentType,
        } = this.props

        const contentFn = this[`render${firstStringToUppercase(contentType)}Content`]
        if(typeof contentFn === 'function') {
            return contentFn()
        }
    }

    renderHelpContent = ({url = '', name = '帮助'} = {}) => {
        return (
            <div className={styles.help}>
                <a
                    href={url}
                    target="_blank"
                    rel="nofollow me noopener noreferrer"
                >
                    <Icon
                        type="book"
                    >
                    </Icon>
                    {name}
                </a>
            </div>
        )
    }

    renderHelp = () => {
        const {
            help,
        } = this.props
        if(typeof help === 'function') {
            return help()
        }else if(typeof help === 'object') {
            return this.renderHelpContent({
                url: help.url,
                name: help.name,
            })
        }
    }

    render() {
        const {
            className,
        } = this.props

        return (
            <header className={classNames(styles.head, className)}>
                {
                    this.renderContent()
                }
                {
                    this.renderHelp()
                }
            </header>
        )
    }
}
