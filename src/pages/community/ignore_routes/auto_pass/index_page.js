import React from 'react'
import styles from './index.less'
import GroupAutoPass from './components/GroupAutoPass'
import GroupInvitationRecord from './components/GroupInvitationRecord'
import ContentTabs from 'business/ContentTabs'
import ContentHeader from "community/ignore_routes/auto_reply/index_page"

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
                            name: '自动通过',
                            tabKey: 'group_auto_pass',
                            content: <GroupAutoPass/>,
                            help: {
                                url: 'http://newhelp.51zan.cn/manual/content/%E7%A4%BE%E7%BE%A4/%E8%87%AA%E5%8A%A8%E9%80%9A%E8%BF%87.md',
                            },
                        },
                        {
                            name: '通过记录',
                            tabKey: 'group_invitation_record',
                            content: <GroupInvitationRecord/>,
                        },
                    ]}
                />
            </div>
        )
    }
}
