import React from 'react'
import styles from './index.less'
import { Icon, Breadcrumb } from 'antd'
import {Link} from 'dva/router'


export default class ContentHeader extends React.PureComponent {


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

    static defaultProps = {
        hasGutter: true
    }

    render(){

        const {
            title,
            titleDescription,
            tabs,
            subTitle,
            description,
            action,
            help,
            hasGutter,
            breadcrumbData,
            breadcrumb
        } = this.props

        return (
            <div>
                <div className={styles.head}>
                    { (breadcrumb || breadcrumbData)  && this.renderBreadCrumb(breadcrumbData, breadcrumb)}
                    {/* <div className={styles.breadcrumb}>
                        <Breadcrumb>
                            <Breadcrumb.Item><a href="">UI</a></Breadcrumb.Item>
                            <Breadcrumb.Item>详情</Breadcrumb.Item>
                        </Breadcrumb>
                    </div> */}
                    {title && <h1 className={styles.title}>{title} {titleDescription && <span className={styles.titleDescription}>{titleDescription}</span>}</h1>}
                    {tabs && <div>{tabs}</div>}
                    {/* <Tabs onChange={this.onChange} defaultActive='import' options={[{label:'店铺订单', value: 'dianpu'}, {label: '导入订单', value: 'import'}]}></Tabs> */}
                    {help && <div className={styles.help}>{help}</div>}
                </div>
                <div className={styles.row + (!hasGutter ? styles.noGutter: '')}>
                    {subTitle && <div className={styles.subTitle}>{subTitle}</div>}
                    {action && <div className={styles.action}>{action}</div>}
                    {description && <div className={styles.description}><Icon className="hz-text-primary hz-icon-size-default" type="exclamation-circle" /> {description}</div>}
                </div>
            </div>
        )

    }

}