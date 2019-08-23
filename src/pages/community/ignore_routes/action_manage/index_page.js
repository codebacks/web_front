import React from 'react'
import ActionManage from './components/ActionManage'
import ViolationRecord from './components/ViolationRecord'
import KickRecord from './components/KickRecord'
import ContentTabs from 'business/ContentTabs'

export default class Index extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {}

    render() {
        return (
            <div>
                <ContentTabs
                    location={this.props.location}
                    content={[
                        {
                            name: '行为管理',
                            tabKey: 'action_manage',
                            content: <ActionManage setting_level={0}/>, // setting_level为区别行为管理接口的类型
                            help: {
                                url: 'http://newhelp.51zan.cn/manual/content/%E7%A4%BE%E7%BE%A4/%E8%A1%8C%E4%B8%BA%E7%AE%A1%E7%90%86.md',
                            },
                        },
                        {
                            name: '违规行为记录',
                            tabKey: 'violation_record',
                            content: <ViolationRecord />,
                            help: {
                                url: 'http://newhelp.51zan.cn/manual/content/%E7%A4%BE%E7%BE%A4/%E8%A1%8C%E4%B8%BA%E7%AE%A1%E7%90%86.md',
                            },
                        },
                        {
                            name: '踢人记录',
                            tabKey: 'kick_record',
                            content: <KickRecord />,
                            help: {
                                url: 'http://newhelp.51zan.cn/manual/content/%E7%A4%BE%E7%BE%A4/%E8%A1%8C%E4%B8%BA%E7%AE%A1%E7%90%86.md',
                            },
                        },
                    ]}
                />
            </div>
        )
    }
}
