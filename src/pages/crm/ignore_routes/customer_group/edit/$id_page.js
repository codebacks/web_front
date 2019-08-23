import React from 'react'
import documentTitleDecorator from 'hoc/documentTitle'
import ContentHeader from 'business/ContentHeader'
import CustomersGroupsFilter from '../components/CustomersGroupsFilter'
import styles from './index.less'

@documentTitleDecorator({
    title: '编辑客户分组',
})
export default class extends React.PureComponent {
    render() {
        return (
            <div className={styles.newGroup}>
                <ContentHeader
                    contentType={'breadcrumb'}
                    content={
                        [
                            {
                                name: '客户分组',
                                path: '/crm/customer_group',
                            },
                            {
                                name: '编辑客户分组',
                            },
                        ]
                    }
                />
                <CustomersGroupsFilter
                    id={this.props.match.params.id}
                />
            </div>
        )
    }
}
