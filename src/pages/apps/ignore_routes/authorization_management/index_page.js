import React from 'react'
import styles from './index.less'
import AuthorizedApplication from './components/AuthorizedApplication'
import UnauthorizedApplication from './components/UnauthorizedApplication'
import ContentTabs from 'business/ContentTabs'

export default class Index extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {
    }

    render() {
        return (
            <div className={styles.container}>
                <ContentTabs
                    location={this.props.location}
                    content={[
                        {
                            name: '已授权应用',
                            tabKey: 'authorized_application',
                            content: <AuthorizedApplication/>,
                        },
                        {
                            name: '待授权应用',
                            tabKey: 'unauthorized_application',
                            content: <UnauthorizedApplication/>,
                        },
                    ]}
                />
            </div>
        )
    }
}
