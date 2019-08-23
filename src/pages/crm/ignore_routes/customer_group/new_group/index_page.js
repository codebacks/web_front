import React from 'react'
import documentTitleDecorator from 'hoc/documentTitle'
import ContentHeader from 'business/ContentHeader'
import CustomersGroupsFilter from '../components/CustomersGroupsFilter'
import styles from './index.less'

@documentTitleDecorator({
    title: '创建客户分组',
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
                                name: '创建客户分组',
                            },
                        ]
                    }
                />
                <CustomersGroupsFilter/>
            </div>
        )
    }
}
