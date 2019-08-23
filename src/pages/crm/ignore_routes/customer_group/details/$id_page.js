import React from 'react'
import documentTitleDecorator from 'hoc/documentTitle'
import ContentHeader from 'business/ContentHeader'
import styles from '../index.less'
import CustomersDetails from '../components/CustomersDetails'
import _ from 'lodash'

@documentTitleDecorator({
    title: '客户分组详情',
})
export default class Index extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = {}
    }

    render() {
        return (
            <div className={styles.details}>
                <ContentHeader
                    contentType={'breadcrumb'}
                    content={
                        [
                            {
                                name: '客户分组',
                                path: '/crm/customer_group',
                            },
                            {
                                name: '客户分组详情',
                            },
                        ]
                    }
                />
                <CustomersDetails
                    id={this.props.match.params.id}
                    title={_.get(this, 'props.location.query.title')}
                    callType={1}
                />
            </div>
        )
    }
}
