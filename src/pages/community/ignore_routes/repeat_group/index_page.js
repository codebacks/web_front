import React from 'react'
import styles from './index.less'
import documentTitleDecorator from 'hoc/documentTitle'
import RepeatGroup from './components/RepeatGroup'
import GroupMemberRepeat from './components/GroupMemberRepeat'
import ContentTabs from 'business/ContentTabs'

@documentTitleDecorator()
export default class Index extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {
    }

    render() {

        return (
            <div>
                <ContentTabs
                    location={this.props.location}
                    content={[
                        {
                            name: '重复加群',
                            tabKey: 'repeat_add_group',
                            content: <RepeatGroup/>,
                            help: {
                                url: 'https://www.kancloud.cn/newsystem51/manual/content/%E7%A4%BE%E7%BE%A4/%E9%87%8D%E5%A4%8D%E5%8A%A0%E7%BE%A4.md',
                            },
                        },
                        {
                            name: '群员工管理',
                            tabKey: 'group_member_repeat',
                            content: <GroupMemberRepeat {...this.props}/>,
                            help: {
                                url: 'http://newhelp.51zan.cn/manual/content/%E8%87%AA%E5%8A%A8%E6%8B%89%E7%BE%A4.md',
                            },
                        },
                    ]}
                />
            </div>
        )
    }
}
