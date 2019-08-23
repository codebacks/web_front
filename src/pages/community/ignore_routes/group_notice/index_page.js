import React, {Component} from 'react'
import {connect} from 'dva'
import documentTitleDecorator from 'hoc/documentTitle'
import GroupNotice from './components/GroupNotice'
import GroupNoticeRecord from './components/GroupNoticeRecord'
import ContentTabs from 'business/ContentTabs'


@connect(({base}) => ({
    base,
}))
@documentTitleDecorator()
export default class extends Component {
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
                            name: '群公告',
                            tabKey: 'group_notice',
                            content: <GroupNotice />,
                            help: {
                                url: 'http://newhelp.51zan.cn/manual/content/%E7%A4%BE%E7%BE%A4/%E7%BE%A4%E5%85%AC%E5%91%8A.md',
                            },
                        },
                        {
                            name: '群公告修改记录',
                            tabKey: 'group_notice_record',
                            content: <GroupNoticeRecord />,
                            help: {
                                url: 'http://newhelp.51zan.cn/manual/content/%E7%A4%BE%E7%BE%A4/%E7%BE%A4%E5%85%AC%E5%91%8A.md',
                            },
                        },
                    ]}
                />
            </div>
        )
    }
}
