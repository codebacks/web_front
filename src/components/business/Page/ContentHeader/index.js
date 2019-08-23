import React from 'react'
import styles from './index.less'
import {Icon, Breadcrumb} from 'antd'
import {Link} from 'dva/router'
import PropTypes from 'prop-types'
import ContentDescription from '../ContentDescription'

export default class ContentHeader extends React.PureComponent {
    static propTypes = {
        title: PropTypes.string,
        titleHelp: PropTypes.node,
        titleDescription: PropTypes.string,
        tabs: PropTypes.node,
        subTitle: PropTypes.oneOfType([PropTypes.string,PropTypes.bool]),
        showDescriptionIcon: PropTypes.bool,
        description: PropTypes.string,
        action:  PropTypes.oneOfType([PropTypes.object,PropTypes.bool]),
        hasGutter: PropTypes.bool,
        breadcrumb: PropTypes.node,
        breadcrumbData: PropTypes.array
    }

    static defaultProps = {
        showDescriptionIcon: true,
        hasGutter: true,
        isAutoScroll: false
    }

    render() {
        const {
            title,
            titleHelp,
            titleDescription,
            tabs,
            subTitle,
            description,
            showDescriptionIcon,
            action,
            help,
            helpUrl,
            hasGutter,
            breadcrumbData,
            breadcrumb,
            contentDescription
        } = this.props
        
        
        return (
            <div>
                <div className={styles.head}>
                    { 
                        (breadcrumb || breadcrumbData)  && 
                        this.renderBreadCrumb(breadcrumbData, breadcrumb)
                    }
                    {
                        title &&
                        <h1 className={styles.title}>{title}
                            {
                                titleHelp && <span className={styles.titleHelp}>{titleHelp}</span>
                            }
                            {
                                titleDescription && <span className={styles.titleDescription}>{titleDescription}</span>
                            }
                        </h1>
                    }
                    {
                        tabs && <div className={styles.tabs}>{tabs}</div>
                    }
                    {
                        help &&
                        <div className={styles.help}>{help}</div>
                    }
                    {
                        helpUrl &&
                        <div className={styles.help}>
                            <a href={helpUrl} target='_blank' rel="nofollow me noopener noreferrer"><Icon type="book"></Icon> 帮助</a>
                        </div>
                    }
                </div>
                <div className={styles.row + ' ' + (!hasGutter ? styles.noGutter: '')}>
                    {subTitle && <div className={styles.subTitle}>{subTitle}</div>}
                    {contentDescription && <ContentDescription {...{...contentDescription.props,  isInnerHeader: true}} />}
                    {action && <div className={styles.action}>{action}</div>}
                    {
                        description &&
                        <div className={styles.description}>
                            { showDescriptionIcon &&
                                <Icon
                                    className="hz-text-primary hz-icon-size-default hz-margin-small-right"
                                    type="exclamation-circle"
                                />
                            }
                            {description}
                        </div>
                    }
                </div>
            </div>
        )

    }

    renderBreadCrumbForData = (data) => {
        const items = data.map((item, i) => {
            const content = item.path ? (
                <Link to={item.path}>{item.name}</Link>
            ) : item.name
            return (
                <Breadcrumb.Item key={i}>
                    {content}
                </Breadcrumb.Item>
            )
        })

        return <Breadcrumb>{items}</Breadcrumb>
    }

    renderBreadCrumb = (breadcrumbData, breadcrumb) => {
        if(breadcrumb) {
            return <div className={styles.breadcrumb}>{breadcrumb}</div>
        }
        else if(breadcrumbData) {
            return <div className={styles.breadcrumb}>{this.renderBreadCrumbForData(breadcrumbData)}</div>
        }
    }


}
